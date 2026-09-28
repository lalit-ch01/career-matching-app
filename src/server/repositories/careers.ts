import { asc, eq, inArray } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { CareerForMatching } from "@/lib/matching/types";
import type {
  CareerEnvironment,
  CareerPriority,
  DegreeFit,
  Relevance,
  SkillImportance,
  WorkStyle,
  WorkType,
} from "@/lib/taxonomy";
import {
  careerDegrees,
  careerInterests,
  careerPriorities,
  careerSkills,
  careerWorkTypes,
  careers,
  degrees,
  interests,
  skills,
} from "@/server/db/schema";
import type { Database } from "@/server/db/types";

export interface CareerDetail {
  slug: string;
  title: string;
  summary: string;
  description: string;
  responsibilities: string[];
  educationSummary: string;
  workStyle: WorkStyle;
  workEnvironment: CareerEnvironment;
  firstSteps: string[];
  degrees: { slug: string; label: string; fit: DegreeFit }[];
  skills: { slug: string; label: string; description: string; importance: SkillImportance }[];
  interests: { slug: string; label: string; relevance: Relevance }[];
  workTypes: { workType: WorkType; relevance: Relevance }[];
  priorities: CareerPriority[];
}

/**
 * Loads careers with all their linked data. At most six queries regardless of
 * how many careers are loaded (no N+1), run in parallel.
 */
export async function loadCareerDetails(db: Database, slugs?: string[]): Promise<CareerDetail[]> {
  const only = (column: AnyPgColumn) => (slugs ? inArray(column, slugs) : undefined);

  const [careerRows, degreeRows, skillRows, interestRows, workTypeRows, priorityRows] = await Promise.all([
    db.select().from(careers).where(only(careers.slug)).orderBy(asc(careers.sortOrder)),
    db
      .select({ careerSlug: careerDegrees.careerSlug, slug: degrees.slug, label: degrees.label, fit: careerDegrees.fit })
      .from(careerDegrees)
      .innerJoin(degrees, eq(degrees.slug, careerDegrees.degreeSlug))
      .where(only(careerDegrees.careerSlug))
      .orderBy(asc(degrees.sortOrder)),
    db
      .select({
        careerSlug: careerSkills.careerSlug,
        slug: skills.slug,
        label: skills.label,
        description: skills.description,
        importance: careerSkills.importance,
      })
      .from(careerSkills)
      .innerJoin(skills, eq(skills.slug, careerSkills.skillSlug))
      .where(only(careerSkills.careerSlug))
      .orderBy(asc(skills.sortOrder)),
    db
      .select({
        careerSlug: careerInterests.careerSlug,
        slug: interests.slug,
        label: interests.label,
        relevance: careerInterests.relevance,
      })
      .from(careerInterests)
      .innerJoin(interests, eq(interests.slug, careerInterests.interestSlug))
      .where(only(careerInterests.careerSlug))
      .orderBy(asc(interests.sortOrder)),
    db.select().from(careerWorkTypes).where(only(careerWorkTypes.careerSlug)),
    db.select().from(careerPriorities).where(only(careerPriorities.careerSlug)),
  ]);

  const group = <T extends { careerSlug: string }>(rows: T[]) => {
    const map = new Map<string, Omit<T, "careerSlug">[]>();
    for (const { careerSlug, ...rest } of rows) {
      const list = map.get(careerSlug) ?? [];
      list.push(rest);
      map.set(careerSlug, list);
    }
    return (slug: string) => map.get(slug) ?? [];
  };
  const degreesOf = group(degreeRows);
  const skillsOf = group(skillRows);
  const interestsOf = group(interestRows);
  const workTypesOf = group(workTypeRows);
  const prioritiesOf = group(priorityRows);

  const relevanceOrder = (r: Relevance) => (r === "primary" ? 0 : 1);

  return careerRows.map((c) => ({
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    description: c.description,
    responsibilities: c.responsibilities,
    educationSummary: c.educationSummary,
    workStyle: c.workStyle,
    workEnvironment: c.workEnvironment,
    firstSteps: c.firstSteps,
    degrees: degreesOf(c.slug).sort((a, b) => (a.fit === b.fit ? 0 : a.fit === "preferred" ? -1 : 1)),
    skills: skillsOf(c.slug)
      .map((s) => ({ ...s, importance: s.importance as SkillImportance }))
      .sort((a, b) => b.importance - a.importance),
    interests: interestsOf(c.slug).sort((a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance)),
    workTypes: workTypesOf(c.slug).sort((a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance)),
    priorities: prioritiesOf(c.slug).map((p) => p.priority),
  }));
}

export async function getCareerDetail(db: Database, slug: string): Promise<CareerDetail | null> {
  const [career] = await loadCareerDetails(db, [slug]);
  return career ?? null;
}

export function toCareerForMatching(career: CareerDetail): CareerForMatching {
  return {
    slug: career.slug,
    title: career.title,
    degrees: career.degrees.map((d) => ({ degreeSlug: d.slug, fit: d.fit })),
    skills: career.skills.map(({ slug, label, importance }) => ({ slug, label, importance })),
    interests: career.interests,
    workTypes: career.workTypes,
    workStyle: career.workStyle,
    workEnvironment: career.workEnvironment,
    priorities: career.priorities,
  };
}
