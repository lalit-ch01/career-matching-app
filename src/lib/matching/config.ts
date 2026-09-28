import type { FactorKey, MatchBand } from "./types";

// Every number the matching algorithm uses lives in this file, so the whole
// model can be read (and defended) in one place. The /methodology page renders
// these same constants, so the explanation can never drift from the code.

/** Bump this when any rule or weight changes; it is stored with each result. */
export const ALGORITHM_VERSION = "weighted-v1";

export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  skills: 0.35,
  interests: 0.25,
  education: 0.15,
  workPreferences: 0.15,
  careerPreferences: 0.1,
};

export const FACTOR_LABELS: Record<FactorKey, string> = {
  skills: "Skills",
  interests: "Interests",
  education: "Education",
  workPreferences: "Work preferences",
  careerPreferences: "Career preferences",
};

export const FACTOR_ORDER: FactorKey[] = [
  "skills",
  "interests",
  "education",
  "workPreferences",
  "careerPreferences",
];

/** Education: score by how the student's degree fits the career. */
export const EDUCATION_SCORES = {
  preferred: 1,
  accepted: 0.6,
  /** Degree not listed for the career: switching is possible, but harder. */
  unlisted: 0.2,
  /** Student chose "Other": we can't judge, so stay neutral. */
  unknown: 0.5,
} as const;

/** Interests / work type: primary areas count fully, secondary ones half. */
export const RELEVANCE_SCORES = {
  primary: 1,
  secondary: 0.5,
} as const;

/** Work preferences are three sub-rules blended with these weights. */
export const WORK_PREFERENCE_WEIGHTS = {
  workType: 0.6,
  workStyle: 0.2,
  workEnvironment: 0.2,
} as const;

export const WORK_STYLE_SCORES = {
  same: 1,
  /** One side is "a mix of both". */
  partial: 0.5,
  /** Independent vs team. */
  opposite: 0,
} as const;

export const WORK_ENVIRONMENT_SCORES = {
  same: 1,
  /** Career offers a balance of routine and change. */
  balanced: 0.5,
  opposite: 0,
} as const;

/** Lower bound (inclusive) of each match band, checked from the top down. */
export const MATCH_BANDS: { band: MatchBand; min: number; label: string }[] = [
  { band: "strong", min: 75, label: "Strong match" },
  { band: "good", min: 55, label: "Good match" },
  { band: "moderate", min: 35, label: "Moderate match" },
  { band: "low", min: 0, label: "Low match" },
];

export function bandFor(matchPercent: number): MatchBand {
  return (MATCH_BANDS.find((b) => matchPercent >= b.min) ?? MATCH_BANDS[MATCH_BANDS.length - 1]).band;
}

export function bandLabel(band: MatchBand): string {
  return MATCH_BANDS.find((b) => b.band === band)?.label ?? band;
}
