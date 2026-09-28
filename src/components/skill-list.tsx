import type { SkillRef } from "@/lib/matching/types";
import { SKILL_IMPORTANCE_LABELS, type SkillImportance } from "@/lib/taxonomy";

const IMPORTANCE_STYLES: Record<SkillImportance, string> = {
  3: "bg-rose-50 text-rose-700 ring-rose-600/20",
  2: "bg-amber-50 text-amber-800 ring-amber-600/20",
  1: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function ImportanceTag({ importance }: { importance: SkillImportance }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${IMPORTANCE_STYLES[importance]}`}>
      {SKILL_IMPORTANCE_LABELS[importance]}
    </span>
  );
}

export function SkillList({
  skills,
  variant,
  emptyText,
}: {
  skills: SkillRef[];
  variant: "have" | "missing" | "neutral";
  emptyText: string;
}) {
  if (skills.length === 0) return <p className="text-sm text-slate-500">{emptyText}</p>;
  const icon = variant === "have" ? "✓" : variant === "missing" ? "✗" : "•";
  const iconClass = variant === "have" ? "text-emerald-600" : variant === "missing" ? "text-rose-600" : "text-slate-400";
  return (
    <ul className="space-y-2">
      {skills.map((s) => (
        <li key={s.slug} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span aria-hidden className={`font-bold ${iconClass}`}>
              {icon}
            </span>
            {s.label}
          </span>
          <ImportanceTag importance={s.importance} />
        </li>
      ))}
    </ul>
  );
}
