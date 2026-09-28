const listFormatter = new Intl.ListFormat("en-IN", { style: "long", type: "conjunction" });

/** ["A", "B", "C"] -> "A, B and C" */
export function formatList(items: string[]): string {
  return listFormatter.format(items);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** Formats an ISO date string in Indian time, e.g. "27 Sept 2026, 6:40 pm". */
export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "12 hours" / "1 hour" / "about 3 weeks" style estimate for learning time. */
export function formatHours(hours: number): string {
  if (hours < 40) return `${hours} hour${hours === 1 ? "" : "s"}`;
  // Assume roughly 10 focused study hours per week for a student.
  const weeks = Math.round(hours / 10);
  return `${hours} hours (about ${weeks} weeks at 10 hours/week)`;
}
