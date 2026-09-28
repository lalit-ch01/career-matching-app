import type { SkillRef } from "@/lib/matching/types";
import type { AssessmentReferenceData } from "./questions";
import type { AssessmentAnswers } from "./validation";
import {
  CAREER_PRIORITY_LABELS,
  ENVIRONMENT_LABELS,
  OTHER_OPTION,
  WORK_STYLE_LABELS,
  WORK_TYPE_LABELS,
} from "@/lib/taxonomy";

export interface ProfileAnalysis {
  skills: string[];
  interests: string[];
  workType: string;
  workStyle: string;
  workEnvironment: string;
  priorities: string[];
  skillConfidence: number;
  choseOtherSkill: boolean;
  choseOtherInterest: boolean;
}

/** Human-readable version of stored answers ("what the system understood"). */
export function analyseAnswers(answers: AssessmentAnswers, reference: AssessmentReferenceData): ProfileAnalysis {
  const skillLabel = new Map(reference.skills.map((s) => [s.slug, s.label]));
  const interestLabel = new Map(reference.interests.map((i) => [i.slug, i.label]));
  const allSkills = [...new Set([...answers.skills, ...answers.skills_detail])];

  return {
    skills: allSkills.filter((s) => s !== OTHER_OPTION).map((s) => skillLabel.get(s) ?? s),
    interests: answers.interests.filter((i) => i !== OTHER_OPTION).map((i) => interestLabel.get(i) ?? i),
    workType: WORK_TYPE_LABELS[answers.work_type],
    workStyle: WORK_STYLE_LABELS[answers.work_style],
    workEnvironment: ENVIRONMENT_LABELS[answers.work_environment],
    priorities: answers.career_priorities.map((p) => CAREER_PRIORITY_LABELS[p]),
    skillConfidence: answers.skill_confidence,
    choseOtherSkill: answers.skills.includes(OTHER_OPTION),
    choseOtherInterest: answers.interests.includes(OTHER_OPTION),
  };
}

/**
 * Skills missing from several of the student's top matches — learning these
 * improves more than one option at once.
 */
export function highImpactSkills(
  matches: { careerTitle: string; missingSkills: SkillRef[] }[],
  topN = 3,
): { label: string; careers: string[] }[] {
  const counts = new Map<string, { label: string; careers: string[]; weight: number }>();
  for (const match of matches.slice(0, topN)) {
    for (const skill of match.missingSkills) {
      const entry = counts.get(skill.slug) ?? { label: skill.label, careers: [], weight: 0 };
      entry.careers.push(match.careerTitle);
      entry.weight += skill.importance;
      counts.set(skill.slug, entry);
    }
  }
  return [...counts.values()]
    .filter((e) => e.careers.length > 1)
    .sort((a, b) => b.careers.length - a.careers.length || b.weight - a.weight)
    .slice(0, 5)
    .map(({ label, careers }) => ({ label, careers }));
}
