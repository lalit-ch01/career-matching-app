import { bandLabel } from "@/lib/matching/config";
import type { MatchBand } from "@/lib/matching/types";

const BAND_STYLES: Record<MatchBand, { badge: string; bar: string }> = {
  strong: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", bar: "bg-emerald-500" },
  good: { badge: "bg-brand-50 text-brand-800 ring-brand-600/20", bar: "bg-brand-500" },
  moderate: { badge: "bg-amber-50 text-amber-800 ring-amber-600/20", bar: "bg-amber-500" },
  low: { badge: "bg-slate-100 text-slate-700 ring-slate-500/20", bar: "bg-slate-400" },
};

export function MatchBadge({ band }: { band: MatchBand }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BAND_STYLES[band].badge}`}>
      {bandLabel(band)}
    </span>
  );
}

/** Horizontal 0–100 bar. `label` is read by screen readers. */
export function ScoreBar({
  value,
  band,
  label,
  size = "md",
}: {
  value: number;
  band?: MatchBand;
  label: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={`w-full overflow-hidden rounded-full bg-slate-200 ${size === "sm" ? "h-1.5" : "h-2.5"}`}
    >
      <div
        className={`h-full rounded-full ${band ? BAND_STYLES[band].bar : "bg-brand-500"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
