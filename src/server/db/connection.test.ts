import { describe, expect, it } from "vitest";
import { isSupabaseTransactionPooler } from "./connection";

describe("isSupabaseTransactionPooler", () => {
  it("flags Supabase's Transaction pooler (port 6543), which mixes up parallel query results", () => {
    expect(isSupabaseTransactionPooler("postgresql://postgres.ref:pw@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres")).toBe(true);
  });

  it.each([
    "postgresql://postgres.ref:pw@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:pw@db.ref.supabase.co:5432/postgres",
    "postgres://postgres:postgres@127.0.0.1:54329/postgres",
    "not a url",
  ])("accepts %s", (url) => {
    expect(isSupabaseTransactionPooler(url)).toBe(false);
  });
});
