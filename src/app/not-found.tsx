import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-xl text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        This page doesn&apos;t exist, or it belongs to a different student. Results can only be viewed on the device
        that created them.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/results" className="btn-secondary">
          My results
        </Link>
      </div>
    </div>
  );
}
