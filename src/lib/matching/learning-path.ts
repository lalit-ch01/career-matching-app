import { SKILL_IMPORTANCE_LABELS, type SkillImportance } from "@/lib/taxonomy";
import type { SkillRef } from "./types";

export interface LearningStep {
  stepOrder: number;
  title: string;
  description: string;
  resourceName: string | null;
  resourceUrl: string | null;
  estimatedHours: number;
}

export interface SkillPlan {
  skill: SkillRef;
  steps: LearningStep[];
  totalHours: number;
}

export interface LearningPhase {
  /** 1-based phase number, in the order the student should work. */
  phase: number;
  title: string;
  description: string;
  importance: SkillImportance;
  skills: SkillPlan[];
  totalHours: number;
}

export interface LearningPath {
  phases: LearningPhase[];
  totalHours: number;
  /** Missing skills that have no learning steps in the database (should be empty). */
  skillsWithoutGuidance: SkillRef[];
}

const PHASE_COPY: Record<SkillImportance, { title: string; description: string }> = {
  3: {
    title: "Close your core gaps",
    description: "These skills are central to the role. Recruiters screen for them, so start here.",
  },
  2: {
    title: "Strengthen supporting skills",
    description: "Transferable skills that come up every day in this role and make you effective in a team.",
  },
  1: {
    title: "Round out your profile",
    description: "Nice-to-have skills that help you stand out once the basics are in place.",
  },
};

/**
 * Turn a career's missing skills into an ordered, phased learning path.
 * Personalised because it only includes the skills *this* student is missing,
 * ordered by how important each one is to the chosen career.
 */
export function buildLearningPath(
  missingSkills: SkillRef[],
  stepsBySkill: Record<string, LearningStep[]>,
): LearningPath {
  const skillsWithoutGuidance: SkillRef[] = [];
  const phases: LearningPhase[] = [];

  for (const importance of [3, 2, 1] as const) {
    const plans: SkillPlan[] = [];
    for (const skill of missingSkills.filter((s) => s.importance === importance)) {
      const steps = [...(stepsBySkill[skill.slug] ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
      if (steps.length === 0) skillsWithoutGuidance.push(skill);
      plans.push({ skill, steps, totalHours: steps.reduce((sum, s) => sum + s.estimatedHours, 0) });
    }
    if (plans.length === 0) continue;
    phases.push({
      phase: phases.length + 1,
      importance,
      ...PHASE_COPY[importance],
      skills: plans,
      totalHours: plans.reduce((sum, p) => sum + p.totalHours, 0),
    });
  }

  return {
    phases,
    totalHours: phases.reduce((sum, p) => sum + p.totalHours, 0),
    skillsWithoutGuidance,
  };
}

export interface SkillGapSummary {
  missingCount: number;
  requiredCount: number;
  countsByImportance: { importance: SkillImportance; label: string; count: number }[];
  headline: string;
}

export function summariseSkillGap(
  matchedSkills: SkillRef[],
  missingSkills: SkillRef[],
  matchPercent: number,
  potentialMatchPercent: number,
): SkillGapSummary {
  const requiredCount = matchedSkills.length + missingSkills.length;
  const countsByImportance = ([3, 2, 1] as const).map((importance) => ({
    importance,
    label: SKILL_IMPORTANCE_LABELS[importance],
    count: missingSkills.filter((s) => s.importance === importance).length,
  }));

  const headline =
    missingSkills.length === 0
      ? "You already have every skill this career asks for."
      : `You're missing ${missingSkills.length} of ${requiredCount} required skills. ` +
        `Closing these gaps would raise your match from ${matchPercent}% to ${potentialMatchPercent}%.`;

  return { missingCount: missingSkills.length, requiredCount, countsByImportance, headline };
}
