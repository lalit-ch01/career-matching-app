import Link from "next/link";
import { getCurrentStudentSafe } from "@/server/current-student";
import { isServerConfigured } from "@/server/env";
import { FACTOR_LABELS, FACTOR_ORDER, FACTOR_WEIGHTS } from "@/lib/matching/config";

const JOURNEY = [
  { title: "Create your profile", text: "Your education — degree and level." },
  { title: "Take the assessment", text: "Skills, interests, how you like to work and what matters to you. About 5 minutes." },
  { title: "See your matches", text: "Every career in the database ranked by Match %, with every point explained." },
  { title: "Close the gaps", text: "Your missing skills and a phased learning path for any career you choose." },
];


export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { deleted } = await searchParams;
  const configured = isServerConfigured();
  const student = configured ? await getCurrentStudentSafe() : null;

  return (
    <div className="container-page">
      {!configured && (
        <div role="status" className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Setup needed:</strong> the database isn&apos;t configured yet. Copy <code>.env.example</code> to{" "}
          <code>.env.local</code>, set <code>DATABASE_URL</code> and <code>SESSION_SECRET</code>, then run{" "}
          <code>npm run db:setup</code>. See README.md.
        </div>
      )}

      {deleted === "1" && (
        <div role="status" className="mb-8 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Your profile, answers and results have been deleted.
        </div>
      )}

      <section className="grid items-center gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="eyebrow mb-3">For Indian college students &amp; recent graduates</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Turn your degree into a career you&apos;re suited for.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Compare your education, skills, interests and work preferences with real entry-level careers. See an explainable
            Match % for each, exactly which skills you&apos;re missing, and a personalised plan to close the gap.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {student ? (
              <>
                <Link href="/assessment" className="btn-primary px-5 py-3 text-base">
                  Take the assessment
                </Link>
                <Link href="/results" className="btn-secondary px-5 py-3 text-base">
                  View my results
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="btn-primary px-5 py-3 text-base">
                  Start — it&apos;s free
                </Link>
                <Link href="/careers" className="btn-secondary px-5 py-3 text-base">
                  Browse careers
                </Link>
              </>
            )}
          </div>
          {student && (
            <p className="mt-4 text-sm text-slate-500">
              Welcome back, {student.fullName}. Not you?{" "}
              <Link href="/profile" className="link">
                Manage your profile
              </Link>
              .
            </p>
          )}
        </div>

        <aside className="card lg:col-span-2" aria-labelledby="how-scored">
          <h2 id="how-scored" className="font-semibold text-slate-900">
            How your Match % is calculated
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            A transparent, weighted scoring model — no black box. Every point on your result is explained.
          </p>
          <ul className="mt-4 space-y-2.5">
            {FACTOR_ORDER.map((key) => (
              <li key={key} className="flex items-center justify-between text-sm">
                <span>{FACTOR_LABELS[key]}</span>
                <span className="font-semibold text-slate-900">{Math.round(FACTOR_WEIGHTS[key] * 100)}%</span>
              </li>
            ))}
          </ul>
          <Link href="/methodology" className="link mt-4 inline-block text-sm">
            Read the full methodology →
          </Link>
        </aside>
      </section>

      <section className="mt-16" aria-labelledby="journey">
        <h2 id="journey" className="text-xl font-bold text-slate-900">
          Your journey
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((step, i) => (
            <li key={step.title} className="card">
              <span className="grid size-8 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
