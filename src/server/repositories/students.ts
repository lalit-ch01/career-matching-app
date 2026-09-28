import { eq } from "drizzle-orm";
import type { ProfileInput } from "@/lib/profile/schema";
import type { EducationLevel } from "@/lib/taxonomy";
import { degrees, studentProfiles } from "@/server/db/schema";
import type { Database } from "@/server/db/types";

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string | null;
  college: string | null;
  educationLevel: EducationLevel;
  degreeSlug: string;
  degreeLabel: string;
  graduationYear: number | null;
  createdAt: string;
  updatedAt: string;
}

function toRow(input: ProfileInput) {
  return {
    fullName: input.fullName,
    email: input.email ?? null,
    college: input.college ?? null,
    educationLevel: input.educationLevel,
    degreeSlug: input.degreeSlug,
    graduationYear: input.graduationYear ?? null,
  };
}

export async function getStudentProfile(db: Database, id: string): Promise<StudentProfile | null> {
  const [row] = await db
    .select({
      id: studentProfiles.id,
      fullName: studentProfiles.fullName,
      email: studentProfiles.email,
      college: studentProfiles.college,
      educationLevel: studentProfiles.educationLevel,
      degreeSlug: studentProfiles.degreeSlug,
      degreeLabel: degrees.label,
      graduationYear: studentProfiles.graduationYear,
      createdAt: studentProfiles.createdAt,
      updatedAt: studentProfiles.updatedAt,
    })
    .from(studentProfiles)
    .innerJoin(degrees, eq(degrees.slug, studentProfiles.degreeSlug))
    .where(eq(studentProfiles.id, id))
    .limit(1);
  return row ?? null;
}

export async function createStudentProfile(db: Database, input: ProfileInput): Promise<string> {
  const [row] = await db.insert(studentProfiles).values(toRow(input)).returning({ id: studentProfiles.id });
  return row.id;
}

/** Deletes a profile and (via ON DELETE CASCADE) all of its responses and results. */
export async function deleteStudentProfile(db: Database, id: string): Promise<void> {
  await db.delete(studentProfiles).where(eq(studentProfiles.id, id));
}

/** Returns false if the profile no longer exists. */
export async function updateStudentProfile(db: Database, id: string, input: ProfileInput): Promise<boolean> {
  const rows = await db
    .update(studentProfiles)
    .set(toRow(input))
    .where(eq(studentProfiles.id, id))
    .returning({ id: studentProfiles.id });
  return rows.length > 0;
}
