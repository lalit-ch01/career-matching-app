import Link from "next/link";
import { getCurrentStudentSafe } from "@/server/current-student";

export async function SiteHeader() {
  const student = await getCurrentStudentSafe();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
            D2C
          </span>
          <span>From Degree to Career</span>
        </Link>
        <nav aria-label="Main" className="-mx-2 flex flex-wrap items-center text-sm">
          <Link href="/careers" className="rounded-md px-2 py-1.5 font-medium text-slate-600 hover:text-slate-900">
            Careers
          </Link>
          <Link href="/methodology" className="rounded-md px-2 py-1.5 font-medium text-slate-600 hover:text-slate-900">
            How matching works
          </Link>
          {student ? (
            <>
              <Link href="/results" className="rounded-md px-2 py-1.5 font-medium text-slate-600 hover:text-slate-900">
                My results
              </Link>
              <Link href="/profile" className="rounded-md px-2 py-1.5 font-medium text-slate-600 hover:text-slate-900">
                Profile
              </Link>
            </>
          ) : (
            <Link href="/profile" className="ml-2 btn-primary py-1.5">
              Get started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
