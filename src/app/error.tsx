"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page max-w-xl text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn&apos;t load this page</h1>
      <p className="mt-3 text-slate-600">
        This is usually temporary — for example the database may be briefly unreachable. Your saved answers and results
        are safe.
      </p>
      {error.digest && <p className="mt-2 text-xs text-slate-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
