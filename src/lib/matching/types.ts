import type {
  CareerEnvironment,
  CareerPriority,
  DegreeFit,
  Relevance,
  SkillImportance,
  WorkEnvironment,
  WorkStyle,
  WorkType,
} from "@/lib/taxonomy";

/** Everything the matching engine needs to know about one career. */
export interface CareerForMatching {
  slug: string;
  title: string;
  degrees: { degreeSlug: string; fit: DegreeFit }[];
  skills: { slug: string; label: string; importance: SkillImportance }[];
  interests: { slug: string; label: string; relevance: Relevance }[];
  workTypes: { workType: WorkType; relevance: Relevance }[];
  workStyle: WorkStyle;
  workEnvironment: CareerEnvironment;
  priorities: CareerPriority[];
}

/** A student's profile + assessment answers, normalised for matching. */
export interface StudentForMatching {
  degreeSlug: string;
  degreeLabel: string;
  /** Skill slugs the student says they have ("Other" already removed). */
  skills: string[];
  /** Interest slugs ("Other" already removed). */
  interests: string[];
  workType: WorkType;
  workStyle: WorkStyle;
  workEnvironment: WorkEnvironment;
  priorities: CareerPriority[];
}

export type FactorKey = "skills" | "interests" | "education" | "workPreferences" | "careerPreferences";

export interface FactorResult {
  key: FactorKey;
  label: string;
  /** Share of the total score this factor controls (weights add up to 1). */
  weight: number;
  /** How well the student fits on this factor, from 0 to 1. */
  score: number;
  /** Contribution to the Match %, i.e. weight × score × 100 (one decimal). */
  points: number;
  /** One-sentence explanation of the score. */
  summary: string;
  /** Extra detail lines, e.g. how each sub-rule scored. */
  details: string[];
}

export interface SkillRef {
  slug: string;
  label: string;
  importance: SkillImportance;
}

export type MatchBand = "strong" | "good" | "moderate" | "low";

export interface CareerMatch {
  careerSlug: string;
  careerTitle: string;
  /** 1 = best match. */
  rank: number;
  /** Rounded 0–100 score shown to the student. */
  matchPercent: number;
  band: MatchBand;
  factors: FactorResult[];
  matchedSkills: SkillRef[];
  /** Required skills the student is missing, most important first. */
  missingSkills: SkillRef[];
  /** Match % the student would reach if they closed every skill gap. */
  potentialMatchPercent: number;
}
