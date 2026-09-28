import { buildAssessment, QUESTIONNAIRE_VERSION } from "@/lib/assessment/questions";
import { toStudentForMatching, validateAssessment, type AnswerErrors } from "@/lib/assessment/validation";
import { ALGORITHM_VERSION } from "@/lib/matching/config";
import { calculateMatches } from "@/lib/matching/engine";
import type { Database } from "@/server/db/types";
import { saveAssessmentWithMatches } from "@/server/repositories/assessments";
import { loadCareerDetails, toCareerForMatching } from "@/server/repositories/careers";
import { getAssessmentReferenceData } from "@/server/repositories/reference";
import { getStudentProfile } from "@/server/repositories/students";

export type SubmitAssessmentResult =
  | { ok: true; assessmentId: string }
  | { ok: false; reason: "no-profile" }
  | { ok: false; reason: "invalid"; errors: AnswerErrors }
  | { ok: false; reason: "no-careers" };

/**
 * The full "Submit → Profile analysis → Career matching → Match %" pipeline:
 * validate the answers against the current questionnaire, score every career,
 * and store the response with its ranked, explained matches.
 */
export async function submitAssessment(
  db: Database,
  studentId: string,
  rawAnswers: unknown,
): Promise<SubmitAssessmentResult> {
  const [profile, reference, careerDetails] = await Promise.all([
    getStudentProfile(db, studentId),
    getAssessmentReferenceData(db),
    loadCareerDetails(db),
  ]);
  if (!profile) return { ok: false, reason: "no-profile" };
  if (careerDetails.length === 0) return { ok: false, reason: "no-careers" };

  const validation = validateAssessment(buildAssessment(reference), rawAnswers);
  if (!validation.ok) return { ok: false, reason: "invalid", errors: validation.errors };

  const student = toStudentForMatching({ slug: profile.degreeSlug, label: profile.degreeLabel }, validation.answers);
  const matches = calculateMatches(student, careerDetails.map(toCareerForMatching));

  const assessmentId = await saveAssessmentWithMatches(db, {
    studentProfileId: profile.id,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    answers: validation.answers,
    profileSnapshot: {
      educationLevel: profile.educationLevel,
      degreeSlug: profile.degreeSlug,
      degreeLabel: profile.degreeLabel,
    },
    algorithmVersion: ALGORITHM_VERSION,
    matches,
  });
  return { ok: true, assessmentId };
}
