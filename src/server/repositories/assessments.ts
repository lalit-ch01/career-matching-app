import { and, asc, desc, eq } from "drizzle-orm";
import type { AssessmentAnswers } from "@/lib/assessment/validation";
import type { CareerMatch } from "@/lib/matching/types";
import {
  assessmentResponses,
  careers,
  matchResults,
  type MatchBreakdown,
  type ProfileSnapshot,
} from "@/server/db/schema";
import type { Database } from "@/server/db/types";

export interface NewAssessment {
  studentProfileId: string;
  questionnaireVersion: string;
  answers: AssessmentAnswers;
  profileSnapshot: ProfileSnapshot;
  algorithmVersion: string;
  matches: CareerMatch[];
}

/** Saves the response and every career match atomically; returns the response id. */
export async function saveAssessmentWithMatches(db: Database, input: NewAssessment): Promise<string> {
  return db.transaction(async (tx) => {
    const [response] = await tx
      .insert(assessmentResponses)
      .values({
        studentProfileId: input.studentProfileId,
        questionnaireVersion: input.questionnaireVersion,
        answers: input.answers,
        profileSnapshot: input.profileSnapshot,
      })
      .returning({ id: assessmentResponses.id });

    if (input.matches.length > 0) {
      await tx.insert(matchResults).values(
        input.matches.map((m) => ({
          assessmentResponseId: response.id,
          careerSlug: m.careerSlug,
          rank: m.rank,
          matchPercent: m.matchPercent,
          algorithmVersion: input.algorithmVersion,
          breakdown: {
            band: m.band,
            factors: m.factors,
            matchedSkills: m.matchedSkills,
            missingSkills: m.missingSkills,
            potentialMatchPercent: m.potentialMatchPercent,
          } satisfies MatchBreakdown,
        })),
      );
    }
    return response.id;
  });
}

export interface AssessmentHistoryItem {
  id: string;
  submittedAt: string;
  topCareerTitle: string | null;
  topMatchPercent: number | null;
}

export async function listAssessmentsForStudent(db: Database, studentProfileId: string): Promise<AssessmentHistoryItem[]> {
  return db
    .select({
      id: assessmentResponses.id,
      submittedAt: assessmentResponses.submittedAt,
      topCareerTitle: careers.title,
      topMatchPercent: matchResults.matchPercent,
    })
    .from(assessmentResponses)
    .leftJoin(
      matchResults,
      and(eq(matchResults.assessmentResponseId, assessmentResponses.id), eq(matchResults.rank, 1)),
    )
    .leftJoin(careers, eq(careers.slug, matchResults.careerSlug))
    .where(eq(assessmentResponses.studentProfileId, studentProfileId))
    .orderBy(desc(assessmentResponses.submittedAt));
}

export interface StoredMatch extends MatchBreakdown {
  careerSlug: string;
  careerTitle: string;
  careerSummary: string;
  rank: number;
  matchPercent: number;
  algorithmVersion: string;
}

export interface AssessmentResult {
  id: string;
  submittedAt: string;
  questionnaireVersion: string;
  answers: AssessmentAnswers;
  profileSnapshot: ProfileSnapshot;
  matches: StoredMatch[];
}

async function getOwnedResponse(db: Database, responseId: string, studentProfileId: string) {
  const [response] = await db
    .select()
    .from(assessmentResponses)
    .where(and(eq(assessmentResponses.id, responseId), eq(assessmentResponses.studentProfileId, studentProfileId)))
    .limit(1);
  return response ?? null;
}

/**
 * A student's result for one assessment, best match first.
 * Returns null when the assessment doesn't exist *or* belongs to someone else,
 * so callers can't tell the two apart (no information leak).
 */
export async function getAssessmentResult(
  db: Database,
  responseId: string,
  studentProfileId: string,
): Promise<AssessmentResult | null> {
  const response = await getOwnedResponse(db, responseId, studentProfileId);
  if (!response) return null;

  const rows = await db
    .select({
      careerSlug: matchResults.careerSlug,
      careerTitle: careers.title,
      careerSummary: careers.summary,
      rank: matchResults.rank,
      matchPercent: matchResults.matchPercent,
      algorithmVersion: matchResults.algorithmVersion,
      breakdown: matchResults.breakdown,
    })
    .from(matchResults)
    .innerJoin(careers, eq(careers.slug, matchResults.careerSlug))
    .where(eq(matchResults.assessmentResponseId, responseId))
    .orderBy(asc(matchResults.rank));

  return {
    id: response.id,
    submittedAt: response.submittedAt,
    questionnaireVersion: response.questionnaireVersion,
    answers: response.answers,
    profileSnapshot: response.profileSnapshot,
    matches: rows.map(({ breakdown, ...rest }) => ({ ...rest, ...breakdown })),
  };
}
