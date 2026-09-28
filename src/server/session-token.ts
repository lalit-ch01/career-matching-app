import { createHmac, timingSafeEqual } from "node:crypto";

// A student's session is their profile id plus an HMAC signature:
//   "<uuid>.<base64url signature>"
// The signature proves the server issued the cookie, so a student can't
// change the id to see someone else's results, even if an id leaks.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function createSessionToken(studentId: string, secret: string): string {
  if (!isUuid(studentId)) throw new Error("Session tokens can only be created for UUID student ids.");
  return `${studentId}.${sign(studentId, secret)}`;
}

/** Returns the student id if the token is well-formed and correctly signed, else null. */
export function verifySessionToken(token: string | undefined, secret: string): string | null {
  if (!token) return null;
  const separator = token.indexOf(".");
  if (separator === -1) return null;

  const studentId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!isUuid(studentId)) return null;

  const expected = Buffer.from(sign(studentId, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return studentId;
}
