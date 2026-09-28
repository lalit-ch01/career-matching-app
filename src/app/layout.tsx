import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Every page shows per-student data (at least the header), and all data lives
// in the database, so render on each request rather than at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "From Degree to Career",
    template: "%s · From Degree to Career",
  },
  description:
    "Explainable career matching for Indian Gen Z students: compare your education, skills, interests and work preferences with real careers, see your skill gaps and get a personalised learning path.",
};

export const viewport: Viewport = {
  themeColor: "#2753e0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1 py-8 sm:py-12">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
