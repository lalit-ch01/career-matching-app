import {
  CAREER_PRIORITY_LABELS,
  ENVIRONMENT_LABELS,
  OTHER_OPTION,
  SKILL_IMPORTANCE_LABELS,
  WORK_STYLE_LABELS,
  WORK_TYPE_LABELS,
} from "@/lib/taxonomy";
import { formatList } from "@/lib/format";
import {
  EDUCATION_SCORES,
  FACTOR_LABELS,
  FACTOR_ORDER,
  FACTOR_WEIGHTS,
  RELEVANCE_SCORES,
  WORK_ENVIRONMENT_SCORES,
  WORK_PREFERENCE_WEIGHTS,
  WORK_STYLE_SCORES,
  bandFor,
} from "./config";
import type {
  CareerForMatching,
  CareerMatch,
  FactorKey,
  FactorResult,
  SkillRef,
  StudentForMatching,
} from "./types";

// Rule-based, weighted matching. Each factor produces a score between 0 and 1
// plus a plain-language explanation; the Match % is the weighted sum of the
// factor scores. There is no hidden state and no trained model: the same
// inputs always give the same output, and every point can be traced to a rule
// in ./config.ts.

type FactorScore = Omit<FactorResult, "key" | "label" | "weight" | "points">;

const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (score: number) => `${Math.round(score * 100)}%`;

function byImportance(a: SkillRef, b: SkillRef) {
  return b.importance - a.importance || a.label.localeCompare(b.label);
}

export function scoreSkills(student: StudentForMatching, career: CareerForMatching) {
  const owned = new Set(student.skills);
  const matchedSkills = career.skills.filter((s) => owned.has(s.slug)).sort(byImportance);
  const missingSkills = career.skills.filter((s) => !owned.has(s.slug)).sort(byImportance);

  const totalPoints = career.skills.reduce((sum, s) => sum + s.importance, 0);
  const earnedPoints = matchedSkills.reduce((sum, s) => sum + s.importance, 0);
  const score = totalPoints === 0 ? 0 : earnedPoints / totalPoints;

  const details: string[] = [];
  if (matchedSkills.length > 0) {
    details.push(`Skills you already have: ${formatList(matchedSkills.map((s) => s.label))}.`);
  }
  const missingCore = missingSkills.filter((s) => s.importance === 3);
  if (missingCore.length > 0) {
    details.push(
      `Missing ${SKILL_IMPORTANCE_LABELS[3].toLowerCase()} skills: ${formatList(missingCore.map((s) => s.label))}.`,
    );
  }
  details.push("Core (role-specific) skills count 3 points, supporting (transferable) skills 2.");

  const result: FactorScore = {
    score,
    summary:
      `You have ${matchedSkills.length} of ${career.skills.length} required skills ` +
      `(${earnedPoints} of ${totalPoints} importance points).`,
    details,
  };
  return { result, matchedSkills, missingSkills };
}

export function scoreInterests(student: StudentForMatching, career: CareerForMatching): FactorScore {
  const chosen = new Set(student.interests);
  const matched = career.interests.filter((i) => chosen.has(i.slug));
  const primary = matched.filter((i) => i.relevance === "primary");
  const secondary = matched.filter((i) => i.relevance === "secondary");
  const careerPrimary = career.interests.filter((i) => i.relevance === "primary");

  const score = Math.max(0, ...matched.map((i) => RELEVANCE_SCORES[i.relevance]));

  let summary: string;
  if (primary.length > 0) {
    summary = `Your interest in ${formatList(primary.map((i) => i.label))} is a primary area of this career.`;
  } else if (secondary.length > 0) {
    summary =
      `Your interest in ${formatList(secondary.map((i) => i.label))} is related to this career, ` +
      `but its main area is ${formatList(careerPrimary.map((i) => i.label))}.`;
  } else {
    summary = `This career suits people interested in ${formatList(careerPrimary.map((i) => i.label))}, which you didn't pick.`;
  }

  return {
    score,
    summary,
    details: [
      `A primary interest match scores ${pct(RELEVANCE_SCORES.primary)}, a related (secondary) one ${pct(RELEVANCE_SCORES.secondary)}; the best match counts.`,
    ],
  };
}

export function scoreEducation(student: StudentForMatching, career: CareerForMatching): FactorScore {
  const degree = student.degreeLabel;
  if (student.degreeSlug === OTHER_OPTION) {
    return {
      score: EDUCATION_SCORES.unknown,
      summary: `You chose "Other" for your degree, so education is scored neutrally (${pct(EDUCATION_SCORES.unknown)}).`,
      details: [],
    };
  }

  const fit = career.degrees.find((d) => d.degreeSlug === student.degreeSlug)?.fit;
  if (fit === "preferred") {
    return {
      score: EDUCATION_SCORES.preferred,
      summary: `${degree} is one of the preferred degrees for this career.`,
      details: [],
    };
  }
  if (fit === "accepted") {
    return {
      score: EDUCATION_SCORES.accepted,
      summary: `${degree} is an accepted route into this career, though other degrees are preferred.`,
      details: [],
    };
  }
  return {
    score: EDUCATION_SCORES.unlisted,
    summary: `${degree} isn't a typical route into this career, but people do switch in with upskilling.`,
    details: [],
  };
}

export function scoreWorkPreferences(student: StudentForMatching, career: CareerForMatching): FactorScore {
  // 1. Type of work (analytical, creative, ...)
  const typeMatch = career.workTypes.find((w) => w.workType === student.workType);
  const typeScore = typeMatch ? RELEVANCE_SCORES[typeMatch.relevance] : 0;
  const mainTypes = career.workTypes.filter((w) => w.relevance === "primary").map((w) => WORK_TYPE_LABELS[w.workType]);
  const studentType = WORK_TYPE_LABELS[student.workType];
  const typeLine = !typeMatch
    ? `Type of work: you prefer ${studentType.toLowerCase()} work; this career is mainly ${formatList(mainTypes).toLowerCase()} (${pct(typeScore)}).`
    : typeMatch.relevance === "primary"
      ? `Type of work: ${studentType.toLowerCase()} work is at the heart of this career (${pct(typeScore)}).`
      : `Type of work: ${studentType.toLowerCase()} work is part of this career, but it is mainly ${formatList(mainTypes).toLowerCase()} (${pct(typeScore)}).`;

  // 2. Working alone vs in a team
  let styleScore: number = WORK_STYLE_SCORES.opposite;
  if (student.workStyle === career.workStyle) styleScore = WORK_STYLE_SCORES.same;
  else if (student.workStyle === "mixed" || career.workStyle === "mixed") styleScore = WORK_STYLE_SCORES.partial;
  const styleLine =
    `Working style: you prefer "${WORK_STYLE_LABELS[student.workStyle].toLowerCase()}"; ` +
    `this career is "${WORK_STYLE_LABELS[career.workStyle].toLowerCase()}" (${pct(styleScore)}).`;

  // 3. Structured vs fast-changing environment
  let envScore: number = WORK_ENVIRONMENT_SCORES.opposite;
  if (student.workEnvironment === career.workEnvironment) envScore = WORK_ENVIRONMENT_SCORES.same;
  else if (career.workEnvironment === "balanced") envScore = WORK_ENVIRONMENT_SCORES.balanced;
  const envLine =
    `Environment: you prefer "${ENVIRONMENT_LABELS[student.workEnvironment].toLowerCase()}"; ` +
    `this career is "${ENVIRONMENT_LABELS[career.workEnvironment].toLowerCase()}" (${pct(envScore)}).`;

  const score =
    WORK_PREFERENCE_WEIGHTS.workType * typeScore +
    WORK_PREFERENCE_WEIGHTS.workStyle * styleScore +
    WORK_PREFERENCE_WEIGHTS.workEnvironment * envScore;

  const summary =
    score >= 0.8
      ? "The way this career works closely matches how you like to work."
      : score >= 0.4
        ? "The way this career works partly matches how you like to work."
        : "The way this career works is quite different from how you like to work.";

  return {
    score,
    summary,
    details: [
      typeLine,
      styleLine,
      envLine,
      `Type of work counts for ${pct(WORK_PREFERENCE_WEIGHTS.workType)} of this factor, working style and environment ${pct(WORK_PREFERENCE_WEIGHTS.workStyle)} each.`,
    ],
  };
}

export function scoreCareerPreferences(student: StudentForMatching, career: CareerForMatching): FactorScore {
  if (student.priorities.length === 0) {
    return { score: 0.5, summary: "You didn't pick any career priorities, so this is scored neutrally.", details: [] };
  }
  const offered = new Set(career.priorities);
  const met = student.priorities.filter((p) => offered.has(p));
  const unmet = student.priorities.filter((p) => !offered.has(p));
  const score = met.length / student.priorities.length;

  const details: string[] = [];
  if (met.length > 0) details.push(`Offers: ${formatList(met.map((p) => CAREER_PRIORITY_LABELS[p]))}.`);
  if (unmet.length > 0) details.push(`Less typical of this career: ${formatList(unmet.map((p) => CAREER_PRIORITY_LABELS[p]))}.`);

  return {
    score,
    summary: `This career typically offers ${met.length} of the ${student.priorities.length} things you said matter most to you.`,
    details,
  };
}

function weightedTotal(scores: Record<FactorKey, number>): number {
  return FACTOR_ORDER.reduce((sum, key) => sum + FACTOR_WEIGHTS[key] * scores[key], 0);
}

interface UnrankedMatch extends Omit<CareerMatch, "rank"> {
  /** Unrounded total, used for stable ordering. */
  exactTotal: number;
  skillsScore: number;
}

export function scoreCareer(student: StudentForMatching, career: CareerForMatching): UnrankedMatch {
  const skills = scoreSkills(student, career);
  const factorScores: Record<FactorKey, FactorScore> = {
    skills: skills.result,
    interests: scoreInterests(student, career),
    education: scoreEducation(student, career),
    workPreferences: scoreWorkPreferences(student, career),
    careerPreferences: scoreCareerPreferences(student, career),
  };

  const factors: FactorResult[] = FACTOR_ORDER.map((key) => ({
    key,
    label: FACTOR_LABELS[key],
    weight: FACTOR_WEIGHTS[key],
    points: round1(FACTOR_WEIGHTS[key] * factorScores[key].score * 100),
    ...factorScores[key],
  }));

  const rawScores = Object.fromEntries(FACTOR_ORDER.map((k) => [k, factorScores[k].score])) as Record<FactorKey, number>;
  const exactTotal = weightedTotal(rawScores);
  // Guard against malformed career data (e.g. a skill without an importance):
  // fail loudly instead of storing or showing a meaningless score.
  const invalid = FACTOR_ORDER.filter((k) => !Number.isFinite(rawScores[k]) || rawScores[k] < 0 || rawScores[k] > 1);
  if (invalid.length > 0) {
    throw new Error(`Cannot score career "${career.slug}": invalid ${invalid.join(", ")} data.`);
  }
  const matchPercent = Math.round(exactTotal * 100);
  const potentialMatchPercent = Math.round(weightedTotal({ ...rawScores, skills: 1 }) * 100);

  return {
    careerSlug: career.slug,
    careerTitle: career.title,
    matchPercent,
    band: bandFor(matchPercent),
    factors,
    matchedSkills: skills.matchedSkills,
    missingSkills: skills.missingSkills,
    potentialMatchPercent,
    exactTotal,
    skillsScore: skills.result.score,
  };
}

/**
 * Score every career for one student and rank them best-first.
 * Ties are broken by skills fit, then alphabetically, so the order is stable.
 */
export function calculateMatches(student: StudentForMatching, careers: CareerForMatching[]): CareerMatch[] {
  return careers
    .map((career) => scoreCareer(student, career))
    .sort(
      (a, b) =>
        b.exactTotal - a.exactTotal ||
        b.skillsScore - a.skillsScore ||
        a.careerTitle.localeCompare(b.careerTitle),
    )
    .map(({ exactTotal: _exactTotal, skillsScore: _skillsScore, ...match }, index) => ({
      ...match,
      rank: index + 1,
    }));
}
