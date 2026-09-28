import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { loadCareerDetails } from "@/server/repositories/careers";

/**
 * GET /api/careers — the public career database as JSON (careers with their
 * degrees, weighted skills, interests, work style and priorities). Contains no
 * student data.
 */
export async function GET() {
  try {
    const careers = await loadCareerDetails(getDb());
    return NextResponse.json(
      { careers },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[api/careers] Failed to load careers:", error);
    return NextResponse.json({ error: "Could not load the career database." }, { status: 500 });
  }
}
