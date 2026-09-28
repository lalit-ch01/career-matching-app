import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildLearningPath } from "@/lib/matching/learning-path";
import { getAssessmentResult, listAssessmentsForStudent } from "@/server/repositories/assessments";
import { getCareerDetail, loadCareerDetails } from "@/server/repositories/careers";
import { getLearningSteps, listDegrees } from "@/server/repositories/reference";
import { getStudentProfile } from "@/server/repositories/students";
import { findStaleReferenceData, seedReferenceData, StaleReferenceDataError } from "@/server/db/seed";
import type { Database } from "@/server/db/types";
import { submitAssessment } from "@/server/services/assessment-service";
import { saveProfile } from "@/server/services/profile-service";
import { createTestDb } from "../helpers/test-db";

// End-to-end backend flow against a real Postgres engine (PGlite) with the
// real migrations and seed data: Profile -> Assessment -> Matching -> Results
// -> Skill gap -> Learning path.

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(async () => close());

const profileForm = {
  fullName: "Priya Sharma",
  email: "Priya@Example.com",
  college: "Pune University",
  educationLevel: "undergraduate",
  degreeSlug: "bsc",
  graduationYear: "2026",
};

const answers = {
  skills: ["excel", "analytical-thinking", "problem-solving"],
  skills_detail: ["sql", "data-analysis"],
  skill_confidence: "3",
  interests: ["technology-data", "research"],
  work_type: "analytical",
  work_style: "independent",
  work_environment: "structured",
  career_priorities: ["fast-growth", "work-life-balance"],
};

async function createStudent(overrides: Record<string, string> = {}) {
  const result = await saveProfile(db, null, { ...profileForm, ...overrides });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.studentId;
}

describe("schema and seed", () => {
  it("enables row level security on every table", async () => {
    const result = await db.execute(sql`
      select relname, relrowsecurity from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'`);
    // PGlite returns { rows }; the shape differs between drivers, hence the cast.
    const rows = (result as unknown as { rows: { relname: string; relrowsecurity: boolean }[] }).rows;
    expect(rows.length).toBe(13);
    expect(rows.filter((r) => !r.relrowsecurity)).toEqual([]);
  });

  it("loads all 14 careers with their linked data", async () => {
    const careers = await loadCareerDetails(db);
    expect(careers).toHaveLength(14);
    for (const c of careers) {
      expect(c.skills.length).toBeGreaterThan(0);
      expect(c.interests.length).toBeGreaterThan(0);
      expect(c.degrees.length).toBeGreaterThan(0);
      expect(c.workTypes.length).toBeGreaterThan(0);
      expect(c.priorities.length).toBeGreaterThan(0);
    }
  });

  it("can be re-seeded without duplicating anything", async () => {
    await seedReferenceData(db);
    const careers = await loadCareerDetails(db);
    expect(careers).toHaveLength(14);
    const da = careers.find((c) => c.slug === "data-analyst")!;
    expect(da.skills.map((s) => s.label).sort()).toEqual(["Analytical Thinking", "Data Analysis", "Excel", "Problem Solving", "SQL"]);
    expect((await listDegrees(db)).length).toBe(12);
  });

  it("has learning steps for every skill any career requires", async () => {
    const careers = await loadCareerDetails(db);
    const required = [...new Set(careers.flatMap((c) => c.skills.map((s) => s.slug)))];
    const steps = await getLearningSteps(db, required);
    expect(required.filter((slug) => !steps[slug]?.length)).toEqual([]);
  });

  it("enforces constraints in the database itself", async () => {
    await expect(
      db.execute(sql`insert into career_skills (career_slug, skill_slug, importance) values ('data-analyst', 'seo', 7)`),
    ).rejects.toThrow();
  });
});

describe("profiles", () => {
  it("creates a profile and normalises input", async () => {
    const id = await createStudent();
    const profile = await getStudentProfile(db, id);
    expect(profile).toMatchObject({ fullName: "Priya Sharma", email: "priya@example.com", degreeLabel: "BSc", graduationYear: 2026 });
  });

  it("rejects invalid input with field-level messages", async () => {
    const result = await saveProfile(db, null, { ...profileForm, fullName: " ", email: "nope", degreeSlug: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["degreeSlug", "email", "fullName"]);
  });

  it("rejects a degree that doesn't exist or doesn't fit the education level", async () => {
    const unknown = await saveProfile(db, null, { ...profileForm, degreeSlug: "phd-in-magic" });
    const mismatch = await saveProfile(db, null, { ...profileForm, degreeSlug: "mba" });
    expect(unknown.ok || mismatch.ok).toBe(false);
    if (!mismatch.ok) expect(mismatch.errors.degreeSlug).toMatch(/postgraduate/);
  });

  it("updates an existing profile instead of creating a new one", async () => {
    const id = await createStudent();
    const result = await saveProfile(db, id, { ...profileForm, fullName: "Priya S." });
    expect(result).toEqual({ ok: true, studentId: id, created: false });
    expect((await getStudentProfile(db, id))?.fullName).toBe("Priya S.");
  });

  it("creates a new profile if the old one was deleted", async () => {
    const result = await saveProfile(db, "00000000-0000-4000-8000-000000000000", profileForm);
    expect(result.ok && result.created).toBe(true);
  });
});

describe("assessment submission → results", () => {
  it("stores the response with a ranked, explained match for every career", async () => {
    const studentId = await createStudent();
    const submission = await submitAssessment(db, studentId, answers);
    expect(submission.ok).toBe(true);
    if (!submission.ok) return;

    const result = await getAssessmentResult(db, submission.assessmentId, studentId);
    expect(result).not.toBeNull();
    expect(result!.matches).toHaveLength(14);
    expect(result!.matches[0].careerSlug).toBe("data-analyst");
    expect(result!.matches.map((m) => m.rank)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(result!.matches[0].factors).toHaveLength(5);
    expect(result!.profileSnapshot).toEqual({ educationLevel: "undergraduate", degreeSlug: "bsc", degreeLabel: "BSc" });

    const history = await listAssessmentsForStudent(db, studentId);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ id: submission.assessmentId, topCareerTitle: "Data Analyst" });
  });

  it("builds a learning path covering every skill gap", async () => {
    const studentId = await createStudent();
    const submission = await submitAssessment(db, studentId, answers);
    if (!submission.ok) throw new Error("submission failed");
    const result = await getAssessmentResult(db, submission.assessmentId, studentId);
    const pm = result!.matches.find((m) => m.careerSlug === "project-coordinator")!;

    const steps = await getLearningSteps(db, pm.missingSkills.map((s) => s.slug));
    const path = buildLearningPath(pm.missingSkills, steps);
    expect(path.skillsWithoutGuidance).toEqual([]);
    expect(path.phases.flatMap((p) => p.skills.map((s) => s.skill.slug)).sort()).toEqual(
      pm.missingSkills.map((s) => s.slug).sort(),
    );
    expect(path.phases[0].importance).toBe(3);
    expect(path.totalHours).toBeGreaterThan(0);
  });

  it("doesn't let one student read another student's results", async () => {
    const owner = await createStudent();
    const other = await createStudent({ fullName: "Someone Else" });
    const submission = await submitAssessment(db, owner, answers);
    if (!submission.ok) throw new Error("submission failed");
    expect(await getAssessmentResult(db, submission.assessmentId, other)).toBeNull();
  });

  it("rejects invalid answers without storing anything", async () => {
    const studentId = await createStudent();
    const submission = await submitAssessment(db, studentId, { ...answers, work_type: "wizard" });
    expect(submission).toMatchObject({ ok: false, reason: "invalid" });
    expect(await listAssessmentsForStudent(db, studentId)).toHaveLength(0);
  });

  it("refuses a submission for a profile that doesn't exist", async () => {
    const submission = await submitAssessment(db, "00000000-0000-4000-8000-000000000000", answers);
    expect(submission).toEqual({ ok: false, reason: "no-profile" });
  });

  it("returns null for results that don't exist", async () => {
    const studentId = await createStudent();
    expect(await getAssessmentResult(db, "00000000-0000-4000-8000-000000000000", studentId)).toBeNull();
    expect(await getCareerDetail(db, "astronaut")).toBeNull();
  });
});

describe("re-seeding after the taxonomy changes", () => {
  it("refuses to leave removed careers/skills behind, and prunes them only when asked", async () => {
    const { db: fresh, close: closeFresh } = await createTestDb();
    try {
      // Simulate an older database that still has a career and a skill the team removed.
      await fresh.execute(sql`insert into skills (slug, label, description, category) values ('statistics', 'Statistics', 'x', 'data')`);
      await fresh.execute(sql`insert into careers (slug, title, summary, description, responsibilities, education_summary, work_style, work_environment, first_steps)
        values ('hr-analyst', 'HR Analyst', 's', 'd', '{}', 'e', 'mixed', 'structured', '{}')`);
      await fresh.execute(sql`insert into career_skills (career_slug, skill_slug, importance) values ('hr-analyst', 'statistics', 2)`);

      await expect(seedReferenceData(fresh)).rejects.toBeInstanceOf(StaleReferenceDataError);
      // Nothing was written: the stale rows are still there.
      expect((await findStaleReferenceData(fresh)).careers).toEqual(["hr-analyst"]);

      const summary = await seedReferenceData(fresh, undefined, { prune: true });
      expect(summary.pruned).toEqual({ careers: ["hr-analyst"], skills: ["statistics"], interests: [], degrees: [] });
      expect(await findStaleReferenceData(fresh)).toEqual({ careers: [], skills: [], interests: [], degrees: [] });
      expect(await loadCareerDetails(fresh)).toHaveLength(14);
    } finally {
      await closeFresh();
    }
  });
});
