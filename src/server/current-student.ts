import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { StudentProfile } from "@/server/repositories/students";
import { getCurrentStudent } from "@/server/session";

/**
 * Like getCurrentStudent(), but never throws. For UI chrome (the header, the
 * home page) that should still render when the database is unreachable or not
 * configured yet; pages that need the student use getCurrentStudent() and let
 * errors reach the error boundary.
 */
export async function getCurrentStudentSafe(): Promise<StudentProfile | null> {
  try {
    return await getCurrentStudent();
  } catch (error) {
    // Let Next.js internals (e.g. dynamic-rendering signals) through.
    unstable_rethrow(error);
    console.error("[session] Could not load the current student:", error);
    return null;
  }
}
