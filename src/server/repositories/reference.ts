import { asc, eq, inArray } from "drizzle-orm";
import type { AssessmentReferenceData } from "@/lib/assessment/questions";
import type { LearningStep } from "@/lib/matching/learning-path";
import { degrees, interests, skillLearningSteps, skills } from "@/server/db/schema";
import type { Database } from "@/server/db/types";

export type DegreeOption = typeof degrees.$inferSelect;

export async function listDegrees(db: Database): Promise<DegreeOption[]> {
  return db.select().from(degrees).orderBy(asc(degrees.sortOrder));
}

export async function getDegree(db: Database, slug: string): Promise<DegreeOption | null> {
  const [row] = await db.select().from(degrees).where(eq(degrees.slug, slug)).limit(1);
  return row ?? null;
}

export async function getAssessmentReferenceData(db: Database): Promise<AssessmentReferenceData> {
  const [skillRows, interestRows] = await Promise.all([
    db
      .select({ slug: skills.slug, label: skills.label, category: skills.category, isFoundational: skills.isFoundational })
      .from(skills)
      .orderBy(asc(skills.sortOrder)),
    db.select({ slug: interests.slug, label: interests.label }).from(interests).orderBy(asc(interests.sortOrder)),
  ]);
  return { skills: skillRows, interests: interestRows };
}

/** Learning steps for the given skills, grouped by skill slug and ordered. */
export async function getLearningSteps(db: Database, skillSlugs: string[]): Promise<Record<string, LearningStep[]>> {
  if (skillSlugs.length === 0) return {};
  const rows = await db
    .select()
    .from(skillLearningSteps)
    .where(inArray(skillLearningSteps.skillSlug, skillSlugs))
    .orderBy(asc(skillLearningSteps.skillSlug), asc(skillLearningSteps.stepOrder));

  const bySkill: Record<string, LearningStep[]> = {};
  for (const row of rows) {
    (bySkill[row.skillSlug] ??= []).push({
      stepOrder: row.stepOrder,
      title: row.title,
      description: row.description,
      resourceName: row.resourceName,
      resourceUrl: row.resourceUrl,
      estimatedHours: row.estimatedHours,
    });
  }
  return bySkill;
}
