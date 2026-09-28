import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CareerFacts } from "@/components/career-facts";
import { SkillList } from "@/components/skill-list";
import { getDb } from "@/server/db/client";
import { getCareerDetail } from "@/server/repositories/careers";

type Props = PageProps<"/careers/[careerSlug]">;

// Shared by generateMetadata and the page, so the career is loaded once per request.
const loadCareer = cache((slug: string) => getCareerDetail(getDb(), slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const career = await loadCareer((await params).careerSlug);
  return { title: career?.title ?? "Career not found", description: career?.summary };
}

export default async function CareerPage({ params }: Props) {
  const career = await loadCareer((await params).careerSlug);
  if (!career) notFound();

  return (
    <div className="container-page">
      <Link href="/careers" className="link text-sm">
        ← All careers
      </Link>

      <header className="mt-4 mb-8 max-w-2xl">
        <p className="eyebrow mb-2">Career database</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{career.title}</h1>
        <p className="mt-2 text-slate-600">{career.summary}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section className="card">
            <h2 className="text-lg font-bold text-slate-900">About this career</h2>
            <p className="mt-3 text-slate-700">{career.description}</p>
            <h3 className="mt-5 font-semibold text-slate-900">What you&apos;d do</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {career.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="text-lg font-bold text-slate-900">What the matching model compares</h2>
            <div className="mt-3">
              <CareerFacts career={career} />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="card">
            <h2 className="text-lg font-bold text-slate-900">Required skills</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">Core (role-specific) skills count 3 points, supporting (transferable) skills 2.</p>
            <SkillList skills={career.skills} variant="neutral" emptyText="No skills listed." />
          </section>
          <section className="card">
            <h2 className="font-semibold text-slate-900">How good a fit is it for you?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Take the assessment to get your Match %, skill gaps and a learning path for this career.
            </p>
            <Link href="/profile" className="btn-primary mt-4 w-full">
              Find my match
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
