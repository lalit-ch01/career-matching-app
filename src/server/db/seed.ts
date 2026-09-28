import { inArray, sql } from "drizzle-orm";
import {
  careerDegrees,
  careerInterests,
  careerPriorities,
  careerSkills,
  careerWorkTypes,
  careers,
  degrees,
  interests,
  skillLearningSteps,
  skills,
} from "./schema";
import type { Database } from "./types";
import { careerSeeds, DRAFTED_SKILL_MAPPINGS, type CareerSeed } from "./seed-data/careers";
import { degreeSeeds, type DegreeSeed } from "./seed-data/degrees";
import { interestSeeds, type InterestSeed } from "./seed-data/interests";
import { skillSeeds, type SkillSeed } from "./seed-data/skills";

export interface SeedData {
  degrees: DegreeSeed[];
  interests: InterestSeed[];
  skills: SkillSeed[];
  careers: CareerSeed[];
}

export const defaultSeedData: SeedData = {
  degrees: degreeSeeds,
  interests: interestSeeds,
  skills: skillSeeds,
  careers: careerSeeds,
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Blocking checks, run before anything is written: broken references, bad or
 * duplicate slugs and names, and data the matching engine can't use.
 * Returns a list of problems (empty = valid).
 */
export function findSeedProblems(data: SeedData): string[] {
  const problems: string[] = [];

  const checkList = (kind: string, items: { slug: string; label: string }[]) => {
    const slugs = new Set<string>();
    const labels = new Set<string>();
    for (const { slug, label } of items) {
      if (!SLUG_PATTERN.test(slug)) problems.push(`${kind} slug "${slug}" must be lowercase-kebab-case (e.g. "data-analyst").`);
      if (slugs.has(slug)) problems.push(`Duplicate ${kind.toLowerCase()} slug "${slug}".`);
      const normalised = label.trim().toLowerCase();
      if (label.trim() === "") problems.push(`${kind} "${slug}" has an empty name.`);
      else if (labels.has(normalised)) problems.push(`Duplicate ${kind.toLowerCase()} name "${label}".`);
      slugs.add(slug);
      labels.add(normalised);
    }
    return slugs;
  };

  const degreeSlugs = checkList("Degree", data.degrees);
  const interestSlugs = checkList("Interest", data.interests);
  const skillSlugs = checkList("Skill", data.skills);
  checkList("Career", data.careers.map((c) => ({ slug: c.slug, label: c.title })));

  for (const skill of data.skills) {
    if (skill.learningSteps.length === 0) problems.push(`Skill "${skill.slug}" has no learning steps.`);
    for (const step of skill.learningSteps) {
      if (step.estimatedHours <= 0) problems.push(`Skill "${skill.slug}" has a step with no estimated hours.`);
      if (step.resourceUrl && !step.resourceUrl.startsWith("https://")) {
        problems.push(`Skill "${skill.slug}" has a non-https resource URL.`);
      }
    }
  }

  const usedSkills = new Set<string>();
  const usedInterests = new Set<string>();
  for (const career of data.careers) {
    const where = `Career "${career.slug}"`;
    for (const slug of Object.keys(career.degrees)) {
      if (!degreeSlugs.has(slug)) problems.push(`${where} references unknown degree "${slug}".`);
    }
    for (const slug of Object.keys(career.skills)) {
      if (!skillSlugs.has(slug)) problems.push(`${where} references unknown skill "${slug}".`);
      usedSkills.add(slug);
    }
    for (const slug of Object.keys(career.interests)) {
      if (!interestSlugs.has(slug)) problems.push(`${where} references unknown interest "${slug}".`);
      usedInterests.add(slug);
    }
    if (Object.keys(career.skills).length < 3) problems.push(`${where} needs at least 3 required skills.`);
    if (!Object.values(career.interests).includes("primary")) problems.push(`${where} has no primary interest.`);
    if (!Object.values(career.workTypes).includes("primary")) problems.push(`${where} has no primary work type.`);
    if (!Object.values(career.degrees).includes("preferred")) problems.push(`${where} has no preferred degree.`);
    if (career.priorities.length === 0) problems.push(`${where} has no career priorities.`);
    if (career.responsibilities.length === 0) problems.push(`${where} has no responsibilities.`);
    if (career.firstSteps.length === 0) problems.push(`${where} has no first steps.`);
  }

  // Anything a student can pick in the assessment must be able to affect a score.
  for (const skill of data.skills) {
    if (!usedSkills.has(skill.slug)) {
      problems.push(`Skill "${skill.label}" isn't required by any career, so choosing it could never change a match.`);
    }
  }
  for (const interest of data.interests) {
    if (!usedInterests.has(interest.slug)) {
      problems.push(`Interest "${interest.label}" isn't linked to any career, so choosing it could never change a match.`);
    }
  }
  return problems;
}

/**
 * Non-blocking checks: things that are valid but worth a human decision.
 * Printed by `npm run db:seed`.
 */
export function findSeedWarnings(data: SeedData, draftedSkillMappings: string[] = DRAFTED_SKILL_MAPPINGS): string[] {
  const warnings: string[] = [];

  for (const interest of data.interests) {
    const primaryFor = data.careers.filter((c) => c.interests[interest.slug] === "primary");
    const relatedFor = data.careers.filter((c) => c.interests[interest.slug] === "secondary");
    if (primaryFor.length === 0 && relatedFor.length > 0) {
      warnings.push(
        `Interest "${interest.label}" is only a related (secondary) area of ${relatedFor.map((c) => c.title).join(", ")}, ` +
          `so a student interested only in it scores at most 50% on interests.`,
      );
    }
  }

  const primaryInterest = (c: CareerSeed) => Object.keys(c.interests).find((k) => c.interests[k] === "primary");
  for (let i = 0; i < data.careers.length; i++) {
    for (let j = i + 1; j < data.careers.length; j++) {
      const a = data.careers[i];
      const b = data.careers[j];
      const aSkills = new Set(Object.keys(a.skills));
      const bSkills = Object.keys(b.skills);
      const shared = bSkills.filter((s) => aSkills.has(s)).length;
      const similarity = shared / new Set([...aSkills, ...bSkills]).size;
      if (similarity >= 0.6 && primaryInterest(a) === primaryInterest(b)) {
        warnings.push(
          `"${a.title}" and "${b.title}" share ${shared} skills and the same main interest, so they will usually score ` +
            `within a few points of each other.`,
        );
      }
    }
  }

  const interestLabels = new Map(data.interests.map((i) => [i.label.toLowerCase(), i.label]));
  for (const skill of data.skills) {
    const clash = interestLabels.get(skill.label.toLowerCase());
    if (clash) warnings.push(`"${clash}" is both a skill and an interest; that's fine, but the two questions show the same word.`);
  }

  const drafted = draftedSkillMappings.filter((slug) => data.careers.some((c) => c.slug === slug));
  if (drafted.length > 0) {
    warnings.push(
      `Skill mappings for ${drafted.length} career(s) were drafted, not taken from the team's list — please confirm: ` +
        `${drafted.join(", ")} (see DRAFTED_SKILL_MAPPINGS in src/server/db/seed-data/careers.ts).`,
    );
  }
  return warnings;
}

export interface StaleReferenceData {
  careers: string[];
  skills: string[];
  interests: string[];
  degrees: string[];
}

/** Reference rows in the database that the seed data no longer contains. */
export async function findStaleReferenceData(db: Database, data: SeedData = defaultSeedData): Promise<StaleReferenceData> {
  const [careerRows, skillRows, interestRows, degreeRows] = await Promise.all([
    db.select({ slug: careers.slug }).from(careers),
    db.select({ slug: skills.slug }).from(skills),
    db.select({ slug: interests.slug }).from(interests),
    db.select({ slug: degrees.slug }).from(degrees),
  ]);
  const missing = (rows: { slug: string }[], seeded: { slug: string }[]) => {
    const keep = new Set(seeded.map((s) => s.slug));
    return rows.map((r) => r.slug).filter((slug) => !keep.has(slug));
  };
  return {
    careers: missing(careerRows, data.careers),
    skills: missing(skillRows, data.skills),
    interests: missing(interestRows, data.interests),
    degrees: missing(degreeRows, data.degrees),
  };
}

export class StaleReferenceDataError extends Error {
  constructor(public readonly stale: StaleReferenceData) {
    const lines = (Object.keys(stale) as (keyof StaleReferenceData)[])
      .filter((k) => stale[k].length > 0)
      .map((k) => `  - ${k}: ${stale[k].join(", ")}`);
    super(
      `The database contains reference data that is no longer in the seed data:\n${lines.join("\n")}\n` +
        "Left in place, removed skills and interests would still appear in the assessment. " +
        "Re-run with --prune to delete them (this also deletes stored results for removed careers).",
    );
    this.name = "StaleReferenceDataError";
  }
}

export interface SeedSummary {
  degrees: number;
  interests: number;
  skills: number;
  learningSteps: number;
  careers: number;
  pruned: StaleReferenceData;
}

const noneStale = (): StaleReferenceData => ({ careers: [], skills: [], interests: [], degrees: [] });

/**
 * Inserts or updates all reference data in one transaction. Safe to run
 * repeatedly. Student profiles and responses are never touched.
 *
 * If the database holds careers, skills, interests or degrees that are no
 * longer in the seed data, seeding stops (nothing is written) unless
 * `prune: true`, which deletes them in the same transaction.
 */
export async function seedReferenceData(
  db: Database,
  data: SeedData = defaultSeedData,
  options: { prune?: boolean } = {},
): Promise<SeedSummary> {
  const problems = findSeedProblems(data);
  if (problems.length > 0) {
    throw new Error(`Seed data is invalid:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  }

  const excluded = (column: string) => sql.raw(`excluded.${column}`);
  let pruned = noneStale();

  await db.transaction(async (tx) => {
    const stale = await findStaleReferenceData(tx, data);
    const hasStale = Object.values(stale).some((list) => list.length > 0);
    if (hasStale && !options.prune) throw new StaleReferenceDataError(stale);
    if (hasStale) pruned = stale;

    // Removed careers go first; their links and stored results cascade.
    if (stale.careers.length > 0) await tx.delete(careers).where(inArray(careers.slug, stale.careers));

    await tx
      .insert(degrees)
      .values(data.degrees.map((d, i) => ({ ...d, sortOrder: i })))
      .onConflictDoUpdate({
        target: degrees.slug,
        set: { label: excluded("label"), level: excluded("level"), sortOrder: excluded("sort_order") },
      });

    await tx
      .insert(interests)
      .values(data.interests.map((it, i) => ({ ...it, sortOrder: i })))
      .onConflictDoUpdate({
        target: interests.slug,
        set: { label: excluded("label"), description: excluded("description"), sortOrder: excluded("sort_order") },
      });

    await tx
      .insert(skills)
      .values(
        data.skills.map((s, i) => ({
          slug: s.slug,
          label: s.label,
          description: s.description,
          category: s.category,
          isFoundational: s.isFoundational,
          sortOrder: i,
        })),
      )
      .onConflictDoUpdate({
        target: skills.slug,
        set: {
          label: excluded("label"),
          description: excluded("description"),
          category: excluded("category"),
          isFoundational: excluded("is_foundational"),
          sortOrder: excluded("sort_order"),
        },
      });

    // Learning steps are replaced wholesale for every seeded skill.
    const skillSlugs = data.skills.map((s) => s.slug);
    await tx.delete(skillLearningSteps).where(inArray(skillLearningSteps.skillSlug, skillSlugs));
    await tx.insert(skillLearningSteps).values(
      data.skills.flatMap((s) =>
        s.learningSteps.map((step, i) => ({
          skillSlug: s.slug,
          stepOrder: i + 1,
          title: step.title,
          description: step.description,
          resourceName: step.resourceName ?? null,
          resourceUrl: step.resourceUrl ?? null,
          estimatedHours: step.estimatedHours,
        })),
      ),
    );

    await tx
      .insert(careers)
      .values(
        data.careers.map((c, i) => ({
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          description: c.description,
          responsibilities: c.responsibilities,
          educationSummary: c.educationSummary,
          workStyle: c.workStyle,
          workEnvironment: c.workEnvironment,
          firstSteps: c.firstSteps,
          sortOrder: i,
        })),
      )
      .onConflictDoUpdate({
        target: careers.slug,
        set: {
          title: excluded("title"),
          summary: excluded("summary"),
          description: excluded("description"),
          responsibilities: excluded("responsibilities"),
          educationSummary: excluded("education_summary"),
          workStyle: excluded("work_style"),
          workEnvironment: excluded("work_environment"),
          firstSteps: excluded("first_steps"),
          sortOrder: excluded("sort_order"),
          updatedAt: sql`now()`,
        },
      });

    // Career links are replaced wholesale for every seeded career.
    const careerSlugs = data.careers.map((c) => c.slug);
    await tx.delete(careerDegrees).where(inArray(careerDegrees.careerSlug, careerSlugs));
    await tx.delete(careerSkills).where(inArray(careerSkills.careerSlug, careerSlugs));
    await tx.delete(careerInterests).where(inArray(careerInterests.careerSlug, careerSlugs));
    await tx.delete(careerWorkTypes).where(inArray(careerWorkTypes.careerSlug, careerSlugs));
    await tx.delete(careerPriorities).where(inArray(careerPriorities.careerSlug, careerSlugs));

    await tx.insert(careerDegrees).values(
      data.careers.flatMap((c) =>
        Object.entries(c.degrees).map(([degreeSlug, fit]) => ({ careerSlug: c.slug, degreeSlug, fit: fit! })),
      ),
    );
    await tx.insert(careerSkills).values(
      data.careers.flatMap((c) =>
        Object.entries(c.skills).map(([skillSlug, importance]) => ({ careerSlug: c.slug, skillSlug, importance })),
      ),
    );
    await tx.insert(careerInterests).values(
      data.careers.flatMap((c) =>
        Object.entries(c.interests).map(([interestSlug, relevance]) => ({ careerSlug: c.slug, interestSlug, relevance })),
      ),
    );
    await tx.insert(careerWorkTypes).values(
      data.careers.flatMap((c) =>
        Object.entries(c.workTypes).map(([workType, relevance]) => ({
          careerSlug: c.slug,
          workType: workType as keyof CareerSeed["workTypes"],
          relevance: relevance!,
        })),
      ),
    );
    await tx.insert(careerPriorities).values(
      data.careers.flatMap((c) => c.priorities.map((priority) => ({ careerSlug: c.slug, priority }))),
    );

    // Removed skills, interests and degrees go last, once nothing links to them.
    // (A degree still used by a student profile makes this fail and the whole seed rolls back.)
    if (stale.skills.length > 0) await tx.delete(skills).where(inArray(skills.slug, stale.skills));
    if (stale.interests.length > 0) await tx.delete(interests).where(inArray(interests.slug, stale.interests));
    if (stale.degrees.length > 0) await tx.delete(degrees).where(inArray(degrees.slug, stale.degrees));
  });

  return {
    degrees: data.degrees.length,
    interests: data.interests.length,
    skills: data.skills.length,
    learningSteps: data.skills.reduce((n, s) => n + s.learningSteps.length, 0),
    careers: data.careers.length,
    pruned,
  };
}
