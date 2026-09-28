import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { getDb } from "@/server/db/client";
import { listAssessmentsForStudent } from "@/server/repositories/assessments";
import { getCurrentStudent } from "@/server/session";

export const metadata: Metadata = { title: "My results" };

export default async function ResultsHistoryPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/profile");

  const history = await listAssessmentsForStudent(getDb(), student.id);

  return (
    <div className="container-page max-w-3xl">
      <PageHeader
        title="My results"
        actions={
          <Link href="/assessment" className="btn-primary">
            {history.length ? "Retake assessment" : "Take the assessment"}
          </Link>
        }
      >
        <p>Every assessment you take is saved, so you can see how your matches change as you learn new skills.</p>
      </PageHeader>

      {history.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-600">You haven&apos;t taken the assessment yet.</p>
          <Link href="/assessment" className="btn-primary mt-4">
            Start the assessment
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((item, i) => (
            <li key={item.id}>
              <Link
                href={`/results/${item.id}`}
                className="card flex flex-wrap items-center justify-between gap-3 transition-colors hover:border-brand-300"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatDateTime(item.submittedAt)}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        Latest
                      </span>
                    )}
                  </p>
                  {item.topCareerTitle && (
                    <p className="text-sm text-slate-600">
                      Top match: {item.topCareerTitle} — {item.topMatchPercent}%
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-brand-700">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
