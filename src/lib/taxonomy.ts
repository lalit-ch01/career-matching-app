// Fixed vocabularies shared by the database schema, the assessment and the
// matching engine. These are part of the matching model itself (the algorithm
// has a rule for each value), so they live in code rather than in the
// database. Open-ended data — careers, skills, interests, degrees — lives in
// the database.

/** Marker value used by "Other" options in the profile and assessment. */
export const OTHER_OPTION = "other";

export const EDUCATION_LEVELS = ["undergraduate", "postgraduate", "other"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
};

export const WORK_TYPES = [
  "analytical",
  "creative",
  "people-oriented",
  "technical",
  "management-oriented",
] as const;
export type WorkType = (typeof WORK_TYPES)[number];
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  analytical: "Analytical",
  creative: "Creative",
  "people-oriented": "People-oriented",
  technical: "Technical",
  "management-oriented": "Management-oriented",
};

export const WORK_STYLES = ["independent", "mixed", "team"] as const;
export type WorkStyle = (typeof WORK_STYLES)[number];
export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  independent: "Mostly independently",
  mixed: "A mix of both",
  team: "Mostly in a team",
};

/** What a student can prefer. */
export const WORK_ENVIRONMENTS = ["structured", "dynamic"] as const;
export type WorkEnvironment = (typeof WORK_ENVIRONMENTS)[number];

/** What a career can offer: either one, or a balance of both. */
export const CAREER_ENVIRONMENTS = ["structured", "dynamic", "balanced"] as const;
export type CareerEnvironment = (typeof CAREER_ENVIRONMENTS)[number];
export const ENVIRONMENT_LABELS: Record<CareerEnvironment, string> = {
  structured: "Structured, with clear processes and routines",
  dynamic: "Fast-changing, with new challenges often",
  balanced: "A balance of routine and change",
};

export const CAREER_PRIORITIES = [
  "high-salary",
  "job-stability",
  "fast-growth",
  "work-life-balance",
  "creativity",
  "social-impact",
  "leadership-role",
] as const;
export type CareerPriority = (typeof CAREER_PRIORITIES)[number];
export const CAREER_PRIORITY_LABELS: Record<CareerPriority, string> = {
  "high-salary": "High salary",
  "job-stability": "Job stability",
  "fast-growth": "Fast career growth",
  "work-life-balance": "Work-life balance",
  creativity: "Creative freedom",
  "social-impact": "Making an impact on people",
  "leadership-role": "Leading a team",
};

/** How central an interest or work type is to a career. */
export const RELEVANCE_LEVELS = ["primary", "secondary"] as const;
export type Relevance = (typeof RELEVANCE_LEVELS)[number];

/** How well a degree prepares a student for a career. */
export const DEGREE_FITS = ["preferred", "accepted"] as const;
export type DegreeFit = (typeof DEGREE_FITS)[number];

/**
 * How important a skill is to a career. The seed data derives it from the
 * skill's kind: role-specific (domain) skills are core (3), transferable
 * skills are supporting (2). 1 is reserved for optional extras.
 */
export const SKILL_IMPORTANCE_LEVELS = [1, 2, 3] as const;
export type SkillImportance = (typeof SKILL_IMPORTANCE_LEVELS)[number];
export const SKILL_IMPORTANCE_LABELS: Record<SkillImportance, string> = {
  3: "Core",
  2: "Supporting",
  1: "Nice to have",
};

export const SKILL_CATEGORIES = [
  "general",
  "technology",
  "data",
  "business-finance",
  "people-management",
  "marketing",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  general: "General",
  technology: "Technology",
  data: "Data & analytics",
  "business-finance": "Business & finance",
  "people-management": "People & management",
  marketing: "Marketing",
};
