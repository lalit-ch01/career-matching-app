"use client";

// Last-resort boundary for errors in the root layout itself. It replaces the
// whole document, so it can't rely on the app's CSS.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1rem", textAlign: "center", color: "#1e293b" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
        <p style={{ color: "#475569" }}>Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", borderRadius: 8, border: 0, background: "#2753e0", color: "#fff" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
