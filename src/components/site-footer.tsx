import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-500">
      <div className="container-page flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>From Degree to Career — an Avishkar research project.</p>
        <p>
          Matches are guidance from a transparent, rule-based model.{" "}
          <Link href="/methodology" className="link">
            See how it works
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
