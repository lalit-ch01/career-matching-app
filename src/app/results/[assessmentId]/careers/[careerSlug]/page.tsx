import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CareerFacts } from "@/components/career-facts";
import { FactorBreakdown } from "@/components/factor-breakdown";
import { LearningPathView } from "@/components/learning-path-view";
import { MatchBadge, ScoreBar } from "@/components/match-ui";
import { SkillList } from "@/components/skill-list";
import { buildLearningPath, summariseSkillGap } from "@/lib/matching/learning-path";
import { getDb } from "@/server/db/client";
import { getAssessmentResult } from "@/server/repositories/assessments";
import { getCareerDetail } from "@/server/repositories/careers";
import { getLearningSteps } from "@/server/repositories/reference";
import { isUuid } from "@/server/session-token";
import { getCurrentStudent } from "@/server/session";

type Props = PageProps<"/results/[assessmentId]/careers/[careerSlug]">;

export const metadata: Metadata = { title: "Your career match" };

export default async function CareerMatchPage({ params }: Props) {
  const { assessmentId, careerSlug } = await params;
  if (!isUuid(assessmentId)) notFound();

  const student = await getCurrentStudent();
  if (!student) redirect("/profile");

  const db = getDb();
  const [result, career] = await Promise.all([
    getAssessmentResult(db, assessmentId, student.id),
    getCareerDetail(db, careerSlug),
  ]);
  const match = result?.matches.find((m) => m.careerSlug === careerSlug);
  if (!result || !match || !career) notFound();

  const steps = await getLearningSteps(db, match.missingSkills.map((s) => s.slug));
  const path = buildLearningPath(match.missingSkills, steps);
  const gap = summariseSkillGap(match.matchedSkills, match.missingSkills, match.matchPercent, match.potentialMatchPercent);

  const index = result.matches.indexOf(match);
  const previous = result.matches[index - 1];
  const next = result.matches[index + 1];

  return (
    <div className="container-page">
      <Link href={`/results/${result.id}`} className="link text-sm">
        ← Back to all matches
      </Link>

      <header className="mt-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">
            Match #{match.rank} of {result.matches.length}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{career.title}</h1>
          <p className="mt-2 text-slate-600">{career.summary}</p>
        </div>
        <div className="w-full sm:w-56">
          <div className="flex items-end justify-between sm:justify-end sm:gap-3">
            <MatchBadge band={match.band} />
            <p className="text-4xl font-bold text-slate-900">{match.matchPercent}%</p>
          </div>
          <div className="mt-2">
            <ScoreBar value={match.matchPercent} band={match.band} label={`${career.title} match`} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section className="card" aria-labelledby="why">
            <h2 id="why" className="text-lg font-bold text-slate-900">
              Why this career matched
            </h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">
              Each factor is scored from 0–100% and multiplied by its weight. The points add up to your Match %.
            </p>
            <FactorBreakdown factors={match.factors} matchPercent={match.matchPercent} />
          </section>

          <section className="card" aria-labelledby="learning-path">
            <h2 id="learning-path" className="text-lg font-bold text-slate-900">
              Your personalised learning path
            </h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">Built only from the skills you&apos;re missing for this career.</p>
            <LearningPathView path={path} firstSteps={career.firstSteps} />
          </section>

          <section className="card" aria-labelledby="about">
            <h2 id="about" className="text-lg font-bold text-slate-900">
              About this career
            </h2>
            <p className="mt-3 text-slate-700">{career.description}</p>
            <h3 className="mt-5 font-semibold text-slate-900">What you&apos;d do</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {career.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="mt-5">
              <CareerFacts career={career} />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="card" aria-labelledby="skill-gap">
            <h2 id="skill-gap" className="text-lg font-bold text-slate-900">
              Skill gap
            </h2>
            <p className="mt-2 text-sm text-slate-600">{gap.headline}</p>
            {gap.missingCount > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                {gap.countsByImportance
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <li key={c.importance} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      {c.count} {c.label.toLowerCase()}
                    </li>
                  ))}
              </ul>
            )}

            <h3 className="mt-5 text-sm font-semibold text-slate-900">Skills you&apos;re missing</h3>
            <div className="mt-2">
              <SkillList skills={match.missingSkills} variant="missing" emptyText="None — you have them all." />
            </div>

            <h3 className="mt-5 text-sm font-semibold text-slate-900">Matching skills you have</h3>
            <div className="mt-2">
              <SkillList skills={match.matchedSkills} variant="have" emptyText="None of this career's skills yet." />
            </div>
          </section>

          <nav aria-label="Other matches" className="flex justify-between gap-2 text-sm">
            {previous ? (
              <Link href={`/results/${result.id}/careers/${previous.careerSlug}`} className="btn-secondary">
                ← #{previous.rank} {previous.careerTitle}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/results/${result.id}/careers/${next.careerSlug}`} className="btn-secondary">
                #{next.rank} {next.careerTitle} →
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
