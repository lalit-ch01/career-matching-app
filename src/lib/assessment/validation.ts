import {
  CAREER_PRIORITIES,
  OTHER_OPTION,
  WORK_ENVIRONMENTS,
  WORK_STYLES,
  WORK_TYPES,
  type CareerPriority,
  type WorkEnvironment,
  type WorkStyle,
  type WorkType,
} from "@/lib/taxonomy";
import type { StudentForMatching } from "@/lib/matching/types";
import type { AssessmentSection, Question } from "./questions";

// One validator for both sides: the browser uses it for instant feedback, and
// the server runs it again on submit (never trust the client).

/** Answers as held by the form: a string for single/scale, an array for multi. */
export type RawAnswers = Record<string, string | string[]>;

export type AnswerErrors = Record<string, string>;

/** Validated, typed answers — the shape stored in assessment_responses.answers. */
export interface AssessmentAnswers {
  skills: string[];
  skills_detail: string[];
  skill_confidence: number;
  interests: string[];
  work_type: WorkType;
  work_style: WorkStyle;
  work_environment: WorkEnvironment;
  career_priorities: CareerPriority[];
}

export function createEmptyAnswers(sections: AssessmentSection[]): RawAnswers {
  const answers: RawAnswers = {};
  for (const section of sections) {
    for (const q of section.questions) answers[q.id] = q.type === "multi" ? [] : "";
  }
  return answers;
}

/** Returns an error message for one question, or null if the answer is valid. */
export function validateQuestion(question: Question, value: unknown): string | null {
  const allowed = new Set(question.options.map((o) => o.value));

  if (question.type === "multi") {
    if (value === undefined || value === null) value = [];
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) return "Invalid answer.";
    if (question.required && value.length === 0) return "Please choose at least one option.";
    if (value.some((v) => !allowed.has(v))) return "Please choose only from the options shown.";
    if (new Set(value).size !== value.length) return "Each option can only be chosen once.";
    if (question.maxSelect && value.length > question.maxSelect) {
      return `Please choose at most ${question.maxSelect} options.`;
    }
    return null;
  }

  if (value === undefined || value === null) value = "";
  if (typeof value !== "string") return "Invalid answer.";
  if (value === "") return question.required ? "Please answer this question to continue." : null;
  if (!allowed.has(value)) return "Please choose one of the options shown.";
  return null;
}

export function validateSection(section: AssessmentSection, answers: RawAnswers): AnswerErrors {
  const errors: AnswerErrors = {};
  for (const q of section.questions) {
    const error = validateQuestion(q, answers[q.id]);
    if (error) errors[q.id] = error;
  }
  return errors;
}

export type ValidationResult =
  | { ok: true; answers: AssessmentAnswers }
  | { ok: false; errors: AnswerErrors };

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/** Validate a complete submission (untrusted input) against the questionnaire. */
export function validateAssessment(sections: AssessmentSection[], input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: { _form: "The submission was empty or malformed." } };
  }
  const raw = input as Record<string, unknown>;

  const errors: AnswerErrors = {};
  for (const section of sections) {
    for (const q of section.questions) {
      const error = validateQuestion(q, raw[q.id]);
      if (error) errors[q.id] = error;
    }
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // Every question passed, so values are known option values. The checks below
  // narrow the types (and guard against a questionnaire/type mismatch).
  const confidence = Number(raw.skill_confidence);
  const priorities = (raw.career_priorities ?? []) as string[];
  if (
    !Number.isInteger(confidence) ||
    confidence < 1 ||
    confidence > 5 ||
    !isOneOf(WORK_TYPES, raw.work_type) ||
    !isOneOf(WORK_STYLES, raw.work_style) ||
    !isOneOf(WORK_ENVIRONMENTS, raw.work_environment) ||
    !priorities.every((p) => isOneOf(CAREER_PRIORITIES, p))
  ) {
    return { ok: false, errors: { _form: "The submission doesn't match the current questionnaire." } };
  }

  return {
    ok: true,
    answers: {
      skills: (raw.skills ?? []) as string[],
      skills_detail: (raw.skills_detail ?? []) as string[],
      skill_confidence: confidence,
      interests: (raw.interests ?? []) as string[],
      work_type: raw.work_type,
      work_style: raw.work_style,
      work_environment: raw.work_environment,
      career_priorities: priorities as CareerPriority[],
    },
  };
}

/** Combine the profile's degree with validated answers into the matching input. */
export function toStudentForMatching(
  degree: { slug: string; label: string },
  answers: AssessmentAnswers,
): StudentForMatching {
  const withoutOther = (values: string[]) => values.filter((v) => v !== OTHER_OPTION);
  return {
    degreeSlug: degree.slug,
    degreeLabel: degree.label,
    skills: [...new Set(withoutOther([...answers.skills, ...answers.skills_detail]))],
    interests: withoutOther(answers.interests),
    workType: answers.work_type,
    workStyle: answers.work_style,
    workEnvironment: answers.work_environment,
    priorities: answers.career_priorities,
  };
}
