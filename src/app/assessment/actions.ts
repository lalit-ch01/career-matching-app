"use server";

import { redirect } from "next/navigation";
import type { AnswerErrors } from "@/lib/assessment/validation";
import { getDb } from "@/server/db/client";
import { submitAssessment } from "@/server/services/assessment-service";
import { getSessionStudentId } from "@/server/session";

export type SubmitAssessmentState = { errors?: AnswerErrors };

/**
 * Validates the answers on the server, runs the matching engine, stores the
 * response + ranked results, then sends the student to their results page.
 */
export async function submitAssessmentAction(answers: unknown): Promise<SubmitAssessmentState> {
  const studentId = await getSessionStudentId();
  if (!studentId) redirect("/profile");

  let result;
  try {
    result = await submitAssessment(getDb(), studentId, answers);
  } catch (error) {
    console.error("[assessment] Failed to submit assessment:", error);
    return { errors: { _form: "We couldn't save your answers right now. Please try again in a moment." } };
  }

  if (result.ok) redirect(`/results/${result.assessmentId}`);
  switch (result.reason) {
    case "no-profile":
      redirect("/profile");
    case "invalid":
      return { errors: result.errors };
    case "no-careers":
      return { errors: { _form: "The career database is empty, so there is nothing to match against yet." } };
  }
}
