import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session-token";

const secret = "test-secret-that-is-at-least-32-characters";
const id = "3f1c2a9e-7b4d-4e2a-9c1f-0a1b2c3d4e5f";

describe("session tokens", () => {
  it("round-trips a student id", () => {
    expect(verifySessionToken(createSessionToken(id, secret), secret)).toBe(id);
  });

  it("rejects a token signed with a different secret", () => {
    expect(verifySessionToken(createSessionToken(id, secret), `${secret}-other`)).toBeNull();
  });

  it("rejects a token whose id was swapped", () => {
    const [, signature] = createSessionToken(id, secret).split(".");
    const otherId = "00000000-0000-4000-8000-000000000000";
    expect(verifySessionToken(`${otherId}.${signature}`, secret)).toBeNull();
  });

  it.each([undefined, "", "not-a-token", `${id}`, `${id}.`, "abc.def", `${id}.${"x".repeat(43)}`])(
    "rejects malformed token %j",
    (token) => {
      expect(verifySessionToken(token, secret)).toBeNull();
    },
  );

  it("refuses to sign non-UUID ids", () => {
    expect(() => createSessionToken("1; drop table", secret)).toThrow();
  });
});
