import type { CareerDetail } from "@/server/repositories/careers";
import {
  CAREER_PRIORITY_LABELS,
  ENVIRONMENT_LABELS,
  WORK_STYLE_LABELS,
  WORK_TYPE_LABELS,
} from "@/lib/taxonomy";
import { formatList } from "@/lib/format";

/** Key facts about a career from the career database. */
export function CareerFacts({ career }: { career: CareerDetail }) {
  const primary = <T extends { relevance: string }>(items: T[]) => items.filter((i) => i.relevance === "primary");
  const secondary = <T extends { relevance: string }>(items: T[]) => items.filter((i) => i.relevance === "secondary");

  const preferredDegrees = career.degrees.filter((d) => d.fit === "preferred").map((d) => d.label);
  const acceptedDegrees = career.degrees.filter((d) => d.fit === "accepted").map((d) => d.label);

  const rows: { term: string; detail: string }[] = [
    { term: "Education", detail: career.educationSummary },
    { term: "Preferred degrees", detail: formatList(preferredDegrees) },
    ...(acceptedDegrees.length ? [{ term: "Also accepted", detail: formatList(acceptedDegrees) }] : []),
    {
      term: "Interest areas",
      detail:
        formatList(primary(career.interests).map((i) => i.label)) +
        (secondary(career.interests).length
          ? ` (also related: ${formatList(secondary(career.interests).map((i) => i.label))})`
          : ""),
    },
    {
      term: "Type of work",
      detail:
        formatList(primary(career.workTypes).map((w) => WORK_TYPE_LABELS[w.workType])) +
        (secondary(career.workTypes).length
          ? ` (also ${formatList(secondary(career.workTypes).map((w) => WORK_TYPE_LABELS[w.workType].toLowerCase()))})`
          : ""),
    },
    { term: "Working style", detail: WORK_STYLE_LABELS[career.workStyle] },
    { term: "Environment", detail: ENVIRONMENT_LABELS[career.workEnvironment] },
    { term: "Typically offers", detail: formatList(career.priorities.map((p) => CAREER_PRIORITY_LABELS[p])) },
  ];

  return (
    <dl className="divide-y divide-slate-100 text-sm">
      {rows.map((r) => (
        <div key={r.term} className="grid gap-1 py-2.5 sm:grid-cols-3 sm:gap-4">
          <dt className="font-semibold text-slate-700">{r.term}</dt>
          <dd className="text-slate-600 sm:col-span-2">{r.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
