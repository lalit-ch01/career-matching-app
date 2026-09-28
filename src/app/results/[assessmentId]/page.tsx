import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MatchBadge, ScoreBar } from "@/components/match-ui";
import { PageHeader } from "@/components/page-header";
import { analyseAnswers, highImpactSkills } from "@/lib/assessment/summary";
import { EDUCATION_LEVEL_LABELS } from "@/lib/taxonomy";
import { formatDateTime, formatList } from "@/lib/format";
import { getDb } from "@/server/db/client";
import { getAssessmentResult } from "@/server/repositories/assessments";
import { getAssessmentReferenceData } from "@/server/repositories/reference";
import { isUuid } from "@/server/session-token";
import { getCurrentStudent } from "@/server/session";

export const metadata: Metadata = { title: "Your career matches" };

export default async function ResultPage({ params }: PageProps<"/results/[assessmentId]">) {
  const { assessmentId } = await params;
  if (!isUuid(assessmentId)) notFound();

  const student = await getCurrentStudent();
  if (!student) redirect("/profile");

  const db = getDb();
  const [result, reference] = await Promise.all([
    getAssessmentResult(db, assessmentId, student.id),
    getAssessmentReferenceData(db),
  ]);
  if (!result) notFound();

  const analysis = analyseAnswers(result.answers, reference);
  const boosters = highImpactSkills(result.matches);
  const [top, ...rest] = result.matches;

  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Step 3 of 3 · Your results"
        title="Your career matches"
        actions={
          <>
            <Link href="/assessment" className="btn-secondary">
              Retake assessment
            </Link>
            <Link href="/results" className="btn-ghost">
              All results
            </Link>
          </>
        }
      >
        <p>
          Based on your assessment from {formatDateTime(result.submittedAt)}. We compared your profile with{" "}
          {result.matches.length} careers. Open any career to see why it matched, your skill gaps and a learning path.
        </p>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          {top && (
            <section aria-labelledby="best-match" className="card border-brand-200 ring-1 ring-brand-100">
              <p className="eyebrow">Best match</p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="best-match" className="text-2xl font-bold text-slate-900">
                    {top.careerTitle}
                  </h2>
                  <p className="mt-1 text-slate-600">{top.careerSummary}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-slate-900">{top.matchPercent}%</p>
                  <MatchBadge band={top.band} />
                </div>
              </div>
              <div className="mt-4">
                <ScoreBar value={top.matchPercent} band={top.band} label={`${top.careerTitle} match`} />
              </div>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {top.factors.slice(0, 2).map((f) => (
                  <li key={f.key}>• {f.summary}</li>
                ))}
              </ul>
              <Link href={`/results/${result.id}/careers/${top.careerSlug}`} className="btn-primary mt-5">
                See why, skill gaps &amp; learning path
              </Link>
            </section>
          )}

          <section aria-labelledby="other-matches">
            <h2 id="other-matches" className="mt-4 mb-3 font-semibold text-slate-900">
              All careers, ranked
            </h2>
            <ol className="space-y-3">
              {rest.map((m) => (
                <li key={m.careerSlug}>
                  <Link
                    href={`/results/${result.id}/careers/${m.careerSlug}`}
                    className="card block transition-colors hover:border-brand-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          <span className="mr-2 text-slate-400">#{m.rank}</span>
                          {m.careerTitle}
                        </p>
                        <p className="truncate text-sm text-slate-500">{m.factors[0]?.summary}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold text-slate-900">{m.matchPercent}%</p>
                        <MatchBadge band={m.band} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <ScoreBar value={m.matchPercent} band={m.band} label={`${m.careerTitle} match`} size="sm" />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="card" aria-labelledby="analysis">
            <h2 id="analysis" className="font-semibold text-slate-900">
              Your profile analysis
            </h2>
            <p className="mt-1 text-sm text-slate-500">What the system understood from your answers.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-700">Education</dt>
                <dd className="text-slate-600">
                  {result.profileSnapshot.degreeLabel} ({EDUCATION_LEVEL_LABELS[result.profileSnapshot.educationLevel]})
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Skills ({analysis.skills.length})</dt>
                <dd className="text-slate-600">{analysis.skills.length ? formatList(analysis.skills) : "None selected"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Interests</dt>
                <dd className="text-slate-600">{analysis.interests.length ? formatList(analysis.interests) : "Other only"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Work preferences</dt>
                <dd className="text-slate-600">
                  {analysis.workType} work · {analysis.workStyle.toLowerCase()} · {analysis.workEnvironment.toLowerCase()}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">What matters to you</dt>
                <dd className="text-slate-600">{formatList(analysis.priorities)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Skill confidence</dt>
                <dd className="text-slate-600">{analysis.skillConfidence} / 5 (recorded for research, not scored)</dd>
              </div>
            </dl>
            {(analysis.choseOtherSkill || analysis.choseOtherInterest) && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                &ldquo;Other&rdquo; answers are saved but can&apos;t be matched against the career database, so they
                don&apos;t affect your scores.
              </p>
            )}
          </section>

          {boosters.length > 0 && (
            <section className="card" aria-labelledby="boosters">
              <h2 id="boosters" className="font-semibold text-slate-900">
                Skills that open the most doors
              </h2>
              <p className="mt-1 text-sm text-slate-500">Missing from more than one of your top 3 matches.</p>
              <ul className="mt-3 space-y-2 text-sm">
                {boosters.map((b) => (
                  <li key={b.label}>
                    <span className="font-medium text-slate-800">{b.label}</span>
                    <span className="text-slate-500"> — {formatList(b.careers)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="px-1 text-xs text-slate-500">
            Scored with the {top?.algorithmVersion} model.{" "}
            <Link href="/methodology" className="link">
              How matching works
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
