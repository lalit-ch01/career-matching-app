import type { FactorResult } from "@/lib/matching/types";
import { ScoreBar } from "./match-ui";

/** "Why this matched": every factor, its weight, score, points and reasons. */
export function FactorBreakdown({ factors, matchPercent }: { factors: FactorResult[]; matchPercent: number }) {
  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {factors.map((f) => (
          <li key={f.key} className="py-4 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-semibold text-slate-900">
                {f.label}{" "}
                <span className="text-sm font-normal text-slate-500">(weight {Math.round(f.weight * 100)}%)</span>
              </h3>
              <p className="text-sm text-slate-600">
                Score {Math.round(f.score * 100)}% →{" "}
                <span className="font-semibold text-slate-900">{f.points.toFixed(1)} points</span>
              </p>
            </div>
            <div className="mt-2">
              <ScoreBar value={f.score * 100} label={`${f.label} score`} size="sm" />
            </div>
            <p className="mt-2 text-slate-700">{f.summary}</p>
            {f.details.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-slate-500">
                {f.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Total: {factors.map((f) => f.points.toFixed(1)).join(" + ")} ={" "}
        <span className="font-semibold text-slate-900">{matchPercent}% match</span> (rounded).
      </p>
    </div>
  );
}
