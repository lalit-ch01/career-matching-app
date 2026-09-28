import { profileSchema, type ProfileField, type ProfileInput } from "@/lib/profile/schema";
import { EDUCATION_LEVEL_LABELS, OTHER_OPTION } from "@/lib/taxonomy";
import type { Database } from "@/server/db/types";
import { getDegree } from "@/server/repositories/reference";
import { createStudentProfile, updateStudentProfile } from "@/server/repositories/students";

export type SaveProfileResult =
  | { ok: true; studentId: string; created: boolean }
  | { ok: false; errors: Partial<Record<ProfileField | "_form", string>> };

/**
 * Validates and saves a student profile. Creates a new profile when
 * `existingStudentId` is null (or points to a profile that no longer exists).
 */
export async function saveProfile(
  db: Database,
  existingStudentId: string | null,
  rawInput: unknown,
): Promise<SaveProfileResult> {
  const parsed = profileSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errors: Partial<Record<ProfileField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ProfileField | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    return { ok: false, errors };
  }
  const input: ProfileInput = parsed.data;

  // The degree must exist and agree with the chosen education level.
  const degree = await getDegree(db, input.degreeSlug);
  if (!degree) {
    return { ok: false, errors: { degreeSlug: "Please choose a degree from the list." } };
  }
  if (input.educationLevel !== OTHER_OPTION && degree.level !== OTHER_OPTION && degree.level !== input.educationLevel) {
    return {
      ok: false,
      errors: {
        degreeSlug: `${degree.label} is a ${EDUCATION_LEVEL_LABELS[degree.level].toLowerCase()} degree — please check your education level or degree.`,
      },
    };
  }

  if (existingStudentId && (await updateStudentProfile(db, existingStudentId, input))) {
    return { ok: true, studentId: existingStudentId, created: false };
  }
  const studentId = await createStudentProfile(db, input);
  return { ok: true, studentId, created: true };
}
