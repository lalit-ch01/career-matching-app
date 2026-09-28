import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  ALGORITHM_VERSION,
  EDUCATION_SCORES,
  FACTOR_LABELS,
  FACTOR_ORDER,
  FACTOR_WEIGHTS,
  MATCH_BANDS,
  RELEVANCE_SCORES,
  WORK_ENVIRONMENT_SCORES,
  WORK_PREFERENCE_WEIGHTS,
  WORK_STYLE_SCORES,
} from "@/lib/matching/config";
import type { FactorKey } from "@/lib/matching/types";

export const metadata: Metadata = {
  title: "How matching works",
  description: "The transparent, rule-based weighted scoring model behind every Match %.",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

// Every number on this page is read from src/lib/matching/config.ts — the same
// constants the matching engine uses — so the explanation can't drift from the code.
const FACTOR_RULES: Record<FactorKey, { question: string; rule: string[] }> = {
  skills: {
    question: "Do you already have the skills this career needs?",
    rule: [
      "Each career lists its required skills. Role-specific (domain) skills such as SQL or Recruitment are core = 3 points; transferable skills such as Communication or Teamwork are supporting = 2 points.",
      "Score = importance points of the skills you have ÷ total importance points of the career.",
    ],
  },
  interests: {
    question: "Does this career fit what you enjoy?",
    rule: [
      `Each career has primary and related (secondary) interest areas. A primary match scores ${pct(RELEVANCE_SCORES.primary)}, a related one ${pct(RELEVANCE_SCORES.secondary)}.`,
      "Your best-matching interest counts; picking more interests never lowers your score.",
    ],
  },
  education: {
    question: "Is your degree a usual route into this career?",
    rule: [
      `Preferred degree: ${pct(EDUCATION_SCORES.preferred)}. Accepted degree: ${pct(EDUCATION_SCORES.accepted)}. Not a typical route: ${pct(EDUCATION_SCORES.unlisted)} (switching is possible with upskilling, so it isn't zero).`,
      `"Other" degree: ${pct(EDUCATION_SCORES.unknown)} — neutral, because the system can't judge it.`,
    ],
  },
  workPreferences: {
    question: "Does the way this career works suit how you like to work?",
    rule: [
      `Type of work (${pct(WORK_PREFERENCE_WEIGHTS.workType)} of this factor): the career's main type of work = ${pct(RELEVANCE_SCORES.primary)}, a secondary one = ${pct(RELEVANCE_SCORES.secondary)}, otherwise 0%.`,
      `Working style (${pct(WORK_PREFERENCE_WEIGHTS.workStyle)}): same = ${pct(WORK_STYLE_SCORES.same)}, one side is "a mix" = ${pct(WORK_STYLE_SCORES.partial)}, independent vs team = ${pct(WORK_STYLE_SCORES.opposite)}.`,
      `Environment (${pct(WORK_PREFERENCE_WEIGHTS.workEnvironment)}): same = ${pct(WORK_ENVIRONMENT_SCORES.same)}, career is balanced = ${pct(WORK_ENVIRONMENT_SCORES.balanced)}, opposite = ${pct(WORK_ENVIRONMENT_SCORES.opposite)}.`,
    ],
  },
  careerPreferences: {
    question: "Does this career offer what matters most to you?",
    rule: [
      "You pick up to 3 priorities (e.g. job stability, high salary). Each career lists what it typically offers.",
      "Score = priorities the career offers ÷ priorities you picked.",
    ],
  },
};

export default function MethodologyPage() {
  return (
    <div className="container-page max-w-3xl">
      <PageHeader eyebrow="Methodology" title="How matching works">
        <p>
          From Degree to Career uses a <strong>transparent, rule-based weighted scoring model</strong>. It is not a
          trained machine-learning model: every Match % comes from the fixed rules below, the same answers always give
          the same result, and every point is explained on the results page.
        </p>
      </PageHeader>

      <div className="space-y-6">
        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">1. Five factors, fixed weights</h2>
          <p className="mt-2 text-slate-600">
            Your profile is compared with each career on five factors. Each factor gets a score from 0% to 100%, then
            the scores are combined using these weights:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-semibold">Factor</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Question it answers</th>
                  <th scope="col" className="py-2 text-right font-semibold">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FACTOR_ORDER.map((key) => (
                  <tr key={key}>
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-slate-900">{FACTOR_LABELS[key]}</th>
                    <td className="py-2.5 pr-4 text-slate-600">{FACTOR_RULES[key].question}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">{pct(FACTOR_WEIGHTS[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
            Match % = {FACTOR_ORDER.map((k) => `${FACTOR_WEIGHTS[k]} × ${FACTOR_LABELS[k]}`).join(" + ")}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Skills carry the most weight because they are what employers screen for and what a student can change
            fastest; interests come next because they predict whether a student will stay motivated.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">2. How each factor is scored</h2>
          <div className="mt-4 space-y-5">
            {FACTOR_ORDER.map((key) => (
              <div key={key}>
                <h3 className="font-semibold text-slate-900">
                  {FACTOR_LABELS[key]} <span className="font-normal text-slate-500">({pct(FACTOR_WEIGHTS[key])})</span>
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {FACTOR_RULES[key].rule.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">3. Ranking, bands and skill gaps</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>All careers are ranked by Match %. Ties go to the career where your skills fit better.</li>
            <li>
              Bands:{" "}
              {MATCH_BANDS.map((b, i) => {
                const upper = i === 0 ? 100 : MATCH_BANDS[i - 1].min - 1;
                return `${b.label} ${b.min}–${upper}%`;
              }).join(" · ")}
              .
            </li>
            <li>
              <strong>Skill gap</strong> = the career&apos;s required skills you don&apos;t have, most important first.
              We also show the Match % you would reach if you closed every gap.
            </li>
            <li>
              <strong>Learning path</strong> = your missing skills grouped into phases (core → important → nice to
              have), each with ordered learning steps, free resources and time estimates from the career database.
            </li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">4. Limitations (and why we&apos;re upfront about them)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Skills are self-reported; the model can&apos;t verify them. Skill confidence (1–5) is recorded for research but not scored.</li>
            <li>Career requirements and weights are expert judgements based on typical Indian entry-level job descriptions, not learned from outcome data.</li>
            <li>&ldquo;Other&rdquo; answers are saved but can&apos;t be matched against the career database.</li>
            <li>A Match % is guidance for exploration, not a prediction of success or a hiring decision.</li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Future scope: calibrating the weights against survey responses and real placement outcomes, and adding more
            careers — the model is data-driven, so careers and skills can be added without code changes.
          </p>
        </section>

        <p className="text-sm text-slate-500">
          Model version <code>{ALGORITHM_VERSION}</code> — stored with every result so past results stay reproducible.{" "}
          <Link href="/careers" className="link">
            Browse the career database
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
