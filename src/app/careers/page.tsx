import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getDb } from "@/server/db/client";
import { loadCareerDetails } from "@/server/repositories/careers";

export const metadata: Metadata = { title: "Career database" };

export default async function CareersPage() {
  const careers = await loadCareerDetails(getDb());

  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Career database"
        title={`${careers.length} careers you can be matched with`}
        actions={
          <Link href="/profile" className="btn-primary">
            Find my matches
          </Link>
        }
      >
        <p>
          Each career lists the education, skills (weighted by importance), interests and work style the matching model
          compares you against.
        </p>
      </PageHeader>

      <ul className="grid gap-4 sm:grid-cols-2">
        {careers.map((c) => (
          <li key={c.slug}>
            <Link href={`/careers/${c.slug}`} className="card flex h-full flex-col transition-colors hover:border-brand-300">
              <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{c.summary}</p>
              <p className="mt-4 text-xs text-slate-500">
                Core skills:{" "}
                <span className="text-slate-700">
                  {c.skills
                    .filter((s) => s.importance === 3)
                    .map((s) => s.label)
                    .join(" · ")}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
