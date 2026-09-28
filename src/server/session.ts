import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getDb } from "@/server/db/client";
import { getServerEnv } from "@/server/env";
import { getStudentProfile, type StudentProfile } from "@/server/repositories/students";
import { createSessionToken, verifySessionToken } from "@/server/session-token";

// Students don't log in. Creating a profile sets a signed, httpOnly cookie that
// links this browser to that profile. Every page and action that shows or
// changes student data checks it through getCurrentStudent().

const COOKIE_NAME = "dtc_student";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

/** Student id from the session cookie, or null if missing/tampered. */
export async function getSessionStudentId(): Promise<string | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value, getServerEnv().SESSION_SECRET);
}

/** Only callable from Server Actions / Route Handlers. */
export async function startSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(studentId, getServerEnv().SESSION_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Only callable from Server Actions / Route Handlers. */
export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * The signed-in student's profile, or null. Cached per request, so layouts and
 * pages can both call it without extra database queries.
 */
export const getCurrentStudent = cache(async (): Promise<StudentProfile | null> => {
  const studentId = await getSessionStudentId();
  if (!studentId) return null;
  return getStudentProfile(getDb(), studentId);
});
