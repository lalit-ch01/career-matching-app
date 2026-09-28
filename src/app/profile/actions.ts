"use server";

import { redirect } from "next/navigation";
import type { ProfileField, ProfileFormState } from "@/lib/profile/schema";
import { getDb } from "@/server/db/client";
import { deleteStudentProfile } from "@/server/repositories/students";
import { saveProfile } from "@/server/services/profile-service";
import { endSession, getSessionStudentId, startSession } from "@/server/session";

const FIELDS: ProfileField[] = ["fullName", "email", "college", "educationLevel", "degreeSlug", "graduationYear"];

export async function saveProfileAction(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const values: Partial<Record<ProfileField, string>> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }

  let result;
  try {
    const existingId = await getSessionStudentId();
    result = await saveProfile(getDb(), existingId, values);
    if (result.ok && result.created) await startSession(result.studentId);
  } catch (error) {
    console.error("[profile] Failed to save profile:", error);
    return { values, errors: { _form: "We couldn't save your profile right now. Please try again in a moment." } };
  }

  if (!result.ok) return { values, errors: result.errors };
  // Outside try/catch: redirect() works by throwing.
  redirect("/assessment");
}

/** Forget this browser's session. The profile and results stay in the database. */
export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

/** Permanently delete the student's profile, responses and results. */
export async function deleteMyDataAction(): Promise<void> {
  const studentId = await getSessionStudentId();
  if (studentId) {
    await deleteStudentProfile(getDb(), studentId);
  }
  await endSession();
  redirect("/?deleted=1");
}
