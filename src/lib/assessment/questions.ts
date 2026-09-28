import {
  CAREER_PRIORITIES,
  CAREER_PRIORITY_LABELS,
  ENVIRONMENT_LABELS,
  OTHER_OPTION,
  SKILL_CATEGORY_LABELS,
  WORK_ENVIRONMENTS,
  WORK_STYLES,
  WORK_STYLE_LABELS,
  WORK_TYPES,
  WORK_TYPE_LABELS,
  type SkillCategory,
} from "@/lib/taxonomy";

// In-app career assessment.
//
// Aligned with the research Google Form so both data sources share one
// taxonomy:
//   Form Q1, Q2 (education)       -> asked on the Profile page instead
//   Form Q3 (skills)              -> `skills`
//   Form Q4 (interests)           -> `interests`
//   Form Q5 (skill confidence)    -> `skill_confidence` (recorded, not scored)
//   Form Q6 (type of work)        -> `work_type`
//   Form Q7 (career areas)        -> omitted: it's the app's output, not an input
//   Form Q8–Q11 (research-only)   -> omitted: they don't feed matching
// App-only questions that sharpen matching:
//   `skills_detail`, `work_style`, `work_environment`, `career_priorities`
//
// Skill and interest options come from the database, so adding a skill to the
// career database automatically makes it selectable here.

/** Stored with every response so old answers stay interpretable. */
export const QUESTIONNAIRE_VERSION = "2026-09-v2";

export const MAX_CAREER_PRIORITIES = 3;

export type QuestionType = "single" | "multi" | "scale";

export interface QuestionOption {
  value: string;
  label: string;
  /** Optional heading the option is grouped under. */
  group?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  required: boolean;
  /** multi only */
  maxSelect?: number;
  /** scale only */
  minLabel?: string;
  maxLabel?: string;
  options: QuestionOption[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface AssessmentReferenceData {
  skills: { slug: string; label: string; category: SkillCategory; isFoundational: boolean }[];
  interests: { slug: string; label: string }[];
}

const otherOption: QuestionOption = { value: OTHER_OPTION, label: "Other" };

export function buildAssessment(reference: AssessmentReferenceData): AssessmentSection[] {
  const foundational = reference.skills.filter((s) => s.isFoundational);
  const detailed = reference.skills.filter((s) => !s.isFoundational);

  return [
    {
      id: "skills",
      title: "Skills",
      description: "Tell us about the skills you have today. Be honest — this is only used to find your gaps.",
      questions: [
        {
          id: "skills",
          type: "multi",
          label: "Which skills do you currently have?",
          help: "Choose at least one.",
          required: true,
          options: [...foundational.map((s) => ({ value: s.slug, label: s.label })), otherOption],
        },
        {
          id: "skills_detail",
          type: "multi",
          label: "Do you have any of these more specific skills?",
          help: "Optional — pick any you could use at work or in a project.",
          required: false,
          options: detailed.map((s) => ({
            value: s.slug,
            label: s.label,
            group: SKILL_CATEGORY_LABELS[s.category],
          })),
        },
        {
          id: "skill_confidence",
          type: "scale",
          label: "How confident are you about your current skills?",
          required: true,
          minLabel: "Not confident",
          maxLabel: "Very confident",
          options: ["1", "2", "3", "4", "5"].map((v) => ({ value: v, label: v })),
        },
      ],
    },
    {
      id: "interests",
      title: "Interests",
      description: "What kinds of work or topics do you enjoy?",
      questions: [
        {
          id: "interests",
          type: "multi",
          label: "Which areas are you most interested in?",
          help: "Choose at least one.",
          required: true,
          options: [...reference.interests.map((i) => ({ value: i.slug, label: i.label })), otherOption],
        },
      ],
    },
    {
      id: "work_preferences",
      title: "Work preferences",
      description: "How do you like to work?",
      questions: [
        {
          id: "work_type",
          type: "single",
          label: "What type of work do you prefer?",
          required: true,
          options: WORK_TYPES.map((v) => ({ value: v, label: WORK_TYPE_LABELS[v] })),
        },
        {
          id: "work_style",
          type: "single",
          label: "Do you prefer working alone or with others?",
          required: true,
          options: WORK_STYLES.map((v) => ({ value: v, label: WORK_STYLE_LABELS[v] })),
        },
        {
          id: "work_environment",
          type: "single",
          label: "What kind of work environment suits you?",
          required: true,
          options: WORK_ENVIRONMENTS.map((v) => ({ value: v, label: ENVIRONMENT_LABELS[v] })),
        },
      ],
    },
    {
      id: "career_preferences",
      title: "Career preferences",
      description: "What matters most to you in a career?",
      questions: [
        {
          id: "career_priorities",
          type: "multi",
          label: "Pick the things that matter most to you in a career.",
          help: `Choose up to ${MAX_CAREER_PRIORITIES}.`,
          required: true,
          maxSelect: MAX_CAREER_PRIORITIES,
          options: CAREER_PRIORITIES.map((v) => ({ value: v, label: CAREER_PRIORITY_LABELS[v] })),
        },
      ],
    },
  ];
}
