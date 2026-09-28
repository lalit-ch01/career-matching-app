import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  CAREER_ENVIRONMENTS,
  CAREER_PRIORITIES,
  DEGREE_FITS,
  EDUCATION_LEVELS,
  RELEVANCE_LEVELS,
  SKILL_CATEGORIES,
  WORK_STYLES,
  WORK_TYPES,
} from "../../lib/taxonomy";
import type { AssessmentAnswers } from "../../lib/assessment/validation";
import type { CareerMatch } from "../../lib/matching/types";

// Database schema (Supabase Postgres, accessed only from the Next.js server).
//
// Reference data (careers, skills, interests, degrees and their links) uses
// readable slugs as primary keys, e.g. careers.slug = 'data-analyst'.
// Student data uses random UUIDs, which are safe to put in URLs.
//
// Row Level Security is enabled on every table with no policies. The app
// connects as the database owner (which bypasses RLS), while Supabase's public
// REST API (anon / authenticated roles) can read or write nothing.

// ---------- Enums ----------

export const educationLevelEnum = pgEnum("education_level", EDUCATION_LEVELS);
export const workTypeEnum = pgEnum("work_type", WORK_TYPES);
export const workStyleEnum = pgEnum("work_style", WORK_STYLES);
export const careerEnvironmentEnum = pgEnum("career_environment", CAREER_ENVIRONMENTS);
export const careerPriorityEnum = pgEnum("career_priority", CAREER_PRIORITIES);
export const relevanceEnum = pgEnum("relevance", RELEVANCE_LEVELS);
export const degreeFitEnum = pgEnum("degree_fit", DEGREE_FITS);
export const skillCategoryEnum = pgEnum("skill_category", SKILL_CATEGORIES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

// ---------- Reference data ----------

export const degrees = pgTable(
  "degrees",
  {
    slug: text("slug").primaryKey(),
    label: text("label").notNull(),
    level: educationLevelEnum("level").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
).enableRLS();

export const skills = pgTable(
  "skills",
  {
    slug: text("slug").primaryKey(),
    label: text("label").notNull(),
    description: text("description").notNull(),
    category: skillCategoryEnum("category").notNull(),
    /** Broad skills from the research Google Form (asked first in the assessment). */
    isFoundational: boolean("is_foundational").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
).enableRLS();

export const skillLearningSteps = pgTable(
  "skill_learning_steps",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    skillSlug: text("skill_slug")
      .notNull()
      .references(() => skills.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    stepOrder: smallint("step_order").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    resourceName: text("resource_name"),
    resourceUrl: text("resource_url"),
    estimatedHours: smallint("estimated_hours").notNull(),
  },
  (t) => [
    uniqueIndex("skill_learning_steps_skill_order_key").on(t.skillSlug, t.stepOrder),
    check("skill_learning_steps_hours_positive", sql`${t.estimatedHours} > 0`),
    check("skill_learning_steps_url_https", sql`${t.resourceUrl} is null or ${t.resourceUrl} like 'https://%'`),
  ],
).enableRLS();

export const interests = pgTable(
  "interests",
  {
    slug: text("slug").primaryKey(),
    label: text("label").notNull(),
    description: text("description").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
).enableRLS();

export const careers = pgTable(
  "careers",
  {
    slug: text("slug").primaryKey(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    responsibilities: text("responsibilities").array().notNull(),
    educationSummary: text("education_summary").notNull(),
    workStyle: workStyleEnum("work_style").notNull(),
    workEnvironment: careerEnvironmentEnum("work_environment").notNull(),
    /** Career-specific actions to take once the skill gaps are closing (portfolio, certifications...). */
    firstSteps: text("first_steps").array().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
).enableRLS();

export const careerDegrees = pgTable(
  "career_degrees",
  {
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    degreeSlug: text("degree_slug")
      .notNull()
      .references(() => degrees.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    fit: degreeFitEnum("fit").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.careerSlug, t.degreeSlug] }),
    index("career_degrees_degree_slug_idx").on(t.degreeSlug),
  ],
).enableRLS();

export const careerSkills = pgTable(
  "career_skills",
  {
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    skillSlug: text("skill_slug")
      .notNull()
      .references(() => skills.slug, { onDelete: "restrict", onUpdate: "cascade" }),
    /** 3 = core, 2 = supporting, 1 = nice to have */
    importance: smallint("importance").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.careerSlug, t.skillSlug] }),
    index("career_skills_skill_slug_idx").on(t.skillSlug),
    check("career_skills_importance_range", sql`${t.importance} between 1 and 3`),
  ],
).enableRLS();

export const careerInterests = pgTable(
  "career_interests",
  {
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    interestSlug: text("interest_slug")
      .notNull()
      .references(() => interests.slug, { onDelete: "restrict", onUpdate: "cascade" }),
    relevance: relevanceEnum("relevance").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.careerSlug, t.interestSlug] }),
    index("career_interests_interest_slug_idx").on(t.interestSlug),
  ],
).enableRLS();

export const careerWorkTypes = pgTable(
  "career_work_types",
  {
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    workType: workTypeEnum("work_type").notNull(),
    relevance: relevanceEnum("relevance").notNull(),
  },
  (t) => [primaryKey({ columns: [t.careerSlug, t.workType] })],
).enableRLS();

/** What each career typically offers, compared with the student's career priorities. */
export const careerPriorities = pgTable(
  "career_priorities",
  {
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    priority: careerPriorityEnum("priority").notNull(),
  },
  (t) => [primaryKey({ columns: [t.careerSlug, t.priority] })],
).enableRLS();

// ---------- Student data ----------

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    college: text("college"),
    educationLevel: educationLevelEnum("education_level").notNull(),
    degreeSlug: text("degree_slug")
      .notNull()
      .references(() => degrees.slug, { onDelete: "restrict", onUpdate: "cascade" }),
    graduationYear: smallint("graduation_year"),
    ...timestamps,
  },
  (t) => [
    index("student_profiles_degree_slug_idx").on(t.degreeSlug),
    check("student_profiles_full_name_length", sql`char_length(${t.fullName}) between 2 and 100`),
    check("student_profiles_graduation_year_range", sql`${t.graduationYear} is null or ${t.graduationYear} between 1980 and 2100`),
  ],
).enableRLS();

/** Snapshot of the profile fields used for matching, frozen at submission time. */
export interface ProfileSnapshot {
  educationLevel: (typeof EDUCATION_LEVELS)[number];
  degreeSlug: string;
  degreeLabel: string;
}

export const assessmentResponses = pgTable(
  "assessment_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => studentProfiles.id, { onDelete: "cascade" }),
    questionnaireVersion: text("questionnaire_version").notNull(),
    answers: jsonb("answers").$type<AssessmentAnswers>().notNull(),
    profileSnapshot: jsonb("profile_snapshot").$type<ProfileSnapshot>().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("assessment_responses_student_submitted_idx").on(t.studentProfileId, t.submittedAt.desc())],
).enableRLS();

/** Stored explanation for one career match (everything except the ids/rank/score columns). */
export type MatchBreakdown = Pick<
  CareerMatch,
  "band" | "factors" | "matchedSkills" | "missingSkills" | "potentialMatchPercent"
>;

export const matchResults = pgTable(
  "match_results",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    assessmentResponseId: uuid("assessment_response_id")
      .notNull()
      .references(() => assessmentResponses.id, { onDelete: "cascade" }),
    careerSlug: text("career_slug")
      .notNull()
      .references(() => careers.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    rank: smallint("rank").notNull(),
    matchPercent: smallint("match_percent").notNull(),
    breakdown: jsonb("breakdown").$type<MatchBreakdown>().notNull(),
    algorithmVersion: text("algorithm_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("match_results_response_career_key").on(t.assessmentResponseId, t.careerSlug),
    uniqueIndex("match_results_response_rank_key").on(t.assessmentResponseId, t.rank),
    index("match_results_career_slug_idx").on(t.careerSlug),
    check("match_results_percent_range", sql`${t.matchPercent} between 0 and 100`),
    check("match_results_rank_positive", sql`${t.rank} > 0`),
  ],
).enableRLS();
