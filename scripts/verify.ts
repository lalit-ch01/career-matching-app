// One-command health check of the whole backend against the REAL database in
// .env.local. Takes a few seconds and leaves no data behind.
//
// Usage: npm run verify
//
// It checks: configuration, connectivity, migrations, security (RLS), the
// career data, parallel-query correctness, and a full student journey
// (profile -> assessment -> matching -> results -> learning path), using a
// temporary profile that is always deleted at the end.
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { buildLearningPath } from "../src/lib/matching/learning-path";
import { connectionOptions, isPostgresUrl, isSupabaseTransactionPooler } from "../src/server/db/connection";
import * as schema from "../src/server/db/schema";
import { defaultSeedData, findStaleReferenceData } from "../src/server/db/seed";
import { getAssessmentResult, listAssessmentsForStudent } from "../src/server/repositories/assessments";
import { loadCareerDetails } from "../src/server/repositories/careers";
import { getLearningSteps } from "../src/server/repositories/reference";
import { deleteStudentProfile, getStudentProfile } from "../src/server/repositories/students";
import { submitAssessment } from "../src/server/services/assessment-service";
import { saveProfile } from "../src/server/services/profile-service";
import { createSessionToken, verifySessionToken } from "../src/server/session-token";
import { loadLocalEnv } from "./load-env";

let failures = 0;

async function step(name: string, fn: () => Promise<string | void>): Promise<boolean> {
  const started = Date.now();
  try {
    const detail = await fn();
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""} (${Date.now() - started} ms)`);
    return true;
  } catch (error) {
    failures++;
    console.log(`  ✗ ${name} (${Date.now() - started} ms)\n      ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Career slug -> sorted skill slugs, straight from the seed data (the source of truth). */
const expectedSkills = new Map(defaultSeedData.careers.map((c) => [c.slug, Object.keys(c.skills).sort().join(",")]));

function careerDataProblems(careers: Awaited<ReturnType<typeof loadCareerDetails>>): string[] {
  const problems: string[] = [];
  if (careers.length !== defaultSeedData.careers.length) {
    problems.push(`expected ${defaultSeedData.careers.length} careers, got ${careers.length}`);
  }
  for (const c of careers) {
    const skills = c.skills.map((s) => s.slug).sort().join(",");
    if (skills !== expectedSkills.get(c.slug)) problems.push(`${c.slug}: skills are [${skills}]`);
    if (c.interests.length === 0 || c.interests.some((i) => !i.label)) problems.push(`${c.slug}: bad interests`);
    if (c.skills.some((s) => s.importance !== 2 && s.importance !== 3)) problems.push(`${c.slug}: bad skill importance`);
  }
  return problems;
}

const SAMPLE_ANSWERS = {
  skills: ["excel", "analytical-thinking", "problem-solving"],
  skills_detail: ["sql", "data-analysis"],
  skill_confidence: "3",
  interests: ["technology-data", "research"],
  work_type: "analytical",
  work_style: "independent",
  work_environment: "structured",
  career_priorities: ["fast-growth", "work-life-balance"],
};

async function main() {
  const started = Date.now();
  loadLocalEnv();
  const url = process.env.DATABASE_URL ?? "";
  console.log("\nVerifying the app against the database in .env.local\n");

  const configured = await step("Configuration", async () => {
    assert(isPostgresUrl(url), "DATABASE_URL is missing or not a postgres:// URL.");
    assert(!isSupabaseTransactionPooler(url), "DATABASE_URL uses the Transaction pooler (port 6543); use the Session pooler (port 5432).");
    const secret = process.env.SESSION_SECRET ?? "";
    assert(secret.length >= 32, "SESSION_SECRET is missing or shorter than 32 characters.");
    const id = "3f1c2a9e-7b4d-4e2a-9c1f-0a1b2c3d4e5f";
    assert(verifySessionToken(createSessionToken(id, secret), secret) === id, "Session signing round-trip failed.");
    return new URL(url).host;
  });
  if (!configured) return finish(started);

  // Same connection settings as the running app.
  const client = postgres(url, connectionOptions(url, Number(process.env.DATABASE_POOL_MAX ?? 5)));
  const db = drizzle(client, { schema });
  let tempStudentId: string | null = null;

  try {
    const reachable = await step("Database reachable", async () => {
      const t = Date.now();
      await client`select 1`;
      return `round trip ${Date.now() - t} ms`;
    });
    if (!reachable) return;

    await step("Migrations applied", async () => {
      const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: unknown[] };
      const [{ n }] = await client<{ n: number }[]>`select count(*)::int as n from drizzle.__drizzle_migrations`;
      assert(n === journal.entries.length, `${n} of ${journal.entries.length} migrations applied — run npm run db:migrate`);
      return `${n}/${journal.entries.length}`;
    });

    await step("Security: RLS on every table, public API roles locked out", async () => {
      const tables = await client<{ relname: string; rls: boolean }[]>`
        select relname, relrowsecurity as rls from pg_class
        where relnamespace = 'public'::regnamespace and relkind = 'r'`;
      assert(tables.length === 13, `expected 13 tables, found ${tables.length}`);
      const noRls = tables.filter((t) => !t.rls).map((t) => t.relname);
      assert(noRls.length === 0, `RLS is off on: ${noRls.join(", ")}`);
      const [{ exists }] = await client<{ exists: boolean }[]>`select exists(select 1 from pg_roles where rolname = 'anon')`;
      if (!exists) return "13 tables (no Supabase API roles on this database)";
      const readable = await client<{ relname: string }[]>`
        select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'
        and (has_table_privilege('anon', oid, 'SELECT') or has_table_privilege('authenticated', oid, 'SELECT'))`;
      assert(readable.length === 0, `readable through Supabase's public API: ${readable.map((r) => r.relname).join(", ")}`);
      return "13 tables";
    });

    await step("Career data matches the seed data", async () => {
      const stale = await findStaleReferenceData(db);
      const leftovers = Object.entries(stale).filter(([, list]) => list.length > 0);
      assert(leftovers.length === 0, `stale rows: ${leftovers.map(([k, l]) => `${k}: ${l.join(", ")}`).join("; ")} — run npm run db:seed -- --prune`);
      const problems = careerDataProblems(await loadCareerDetails(db));
      assert(problems.length === 0, `${problems.join("; ")} — run npm run db:seed`);
      return `${defaultSeedData.careers.length} careers, ${defaultSeedData.skills.length} skills, ${defaultSeedData.interests.length} interests`;
    });

    await step("Parallel queries return the right data", async () => {
      // Regression check: through Supabase's Transaction pooler, answers to
      // parallel queries got mixed up (careers "requiring" degrees as skills).
      const runs = await Promise.all(Array.from({ length: 6 }, () => loadCareerDetails(db)));
      const bad = runs.map(careerDataProblems).filter((p) => p.length > 0);
      assert(bad.length === 0, `${bad.length} of 6 parallel loads returned wrong data: ${bad[0]?.[0]}`);
      return "6 parallel loads, all correct";
    });

    await step("Student journey: profile → assessment → results → learning path", async () => {
      const profile = await saveProfile(db, null, {
        fullName: "Verify script (temporary)",
        educationLevel: "undergraduate",
        degreeSlug: "bsc",
      });
      assert(profile.ok, `saving the profile failed: ${JSON.stringify(!profile.ok && profile.errors)}`);
      tempStudentId = profile.studentId;

      const submission = await submitAssessment(db, tempStudentId, SAMPLE_ANSWERS);
      assert(submission.ok, `submitting the assessment failed: ${JSON.stringify(submission)}`);

      const result = await getAssessmentResult(db, submission.assessmentId, tempStudentId);
      assert(result, "the saved result could not be read back");
      assert(result.matches.length === defaultSeedData.careers.length, `expected ${defaultSeedData.careers.length} matches, got ${result.matches.length}`);
      assert(
        result.matches.every((m, i) => m.rank === i + 1 && m.matchPercent >= 0 && m.matchPercent <= 100),
        "ranks or percentages are out of order/range",
      );
      const top = result.matches[0];
      assert(top.careerSlug === "data-analyst", `expected Data Analyst as the top match, got ${top.careerTitle}`);

      const history = await listAssessmentsForStudent(db, tempStudentId);
      assert(history.length === 1 && history[0].topCareerTitle === "Data Analyst", "results history is wrong");

      const stranger = await getAssessmentResult(db, submission.assessmentId, "00000000-0000-4000-8000-000000000000");
      assert(stranger === null, "another student could read these results");

      const gapCareer = result.matches.find((m) => m.missingSkills.length > 0)!;
      const path = buildLearningPath(
        gapCareer.missingSkills,
        await getLearningSteps(db, gapCareer.missingSkills.map((s) => s.slug)),
      );
      assert(path.skillsWithoutGuidance.length === 0, `no learning steps for: ${path.skillsWithoutGuidance.map((s) => s.label).join(", ")}`);

      return `top match ${top.careerTitle} ${top.matchPercent}%, learning path for ${gapCareer.careerTitle}: ${path.phases.length} phase(s), ${path.totalHours} h`;
    });
  } finally {
    if (tempStudentId) {
      const id = tempStudentId;
      await step("Cleanup: temporary profile deleted", async () => {
        await deleteStudentProfile(db, id);
        assert((await getStudentProfile(db, id)) === null, "the temporary profile is still there");
      });
    }
    await client.end({ timeout: 5 });
    finish(started);
  }
}

function finish(started: number) {
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(failures === 0 ? `\nAll checks passed in ${seconds}s.\n` : `\n${failures} check(s) failed (${seconds}s).\n`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error("Verification crashed:", error);
  process.exitCode = 1;
});
