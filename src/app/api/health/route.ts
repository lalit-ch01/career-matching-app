import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { isServerConfigured } from "@/server/env";

/** GET /api/health — is the app configured and can it reach the database? */
export async function GET() {
  if (!isServerConfigured()) {
    return NextResponse.json({ status: "error", database: "not-configured" }, { status: 503 });
  }
  try {
    const started = Date.now();
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ status: "ok", database: "up", latencyMs: Date.now() - started });
  } catch (error) {
    console.error("[health] Database check failed:", error);
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
