import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { buildAssessment, QUESTIONNAIRE_VERSION } from "@/lib/assessment/questions";
import { getDb } from "@/server/db/client";
import { getAssessmentReferenceData } from "@/server/repositories/reference";
import { getCurrentStudent } from "@/server/session";
import { AssessmentForm } from "./assessment-form";

export const metadata: Metadata = { title: "Career assessment" };

export default async function AssessmentPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/profile");

  const sections = buildAssessment(await getAssessmentReferenceData(getDb()));

  return (
    <div className="container-page max-w-3xl">
      <PageHeader eyebrow="Step 2 of 3" title="Career assessment">
        <p>
          Hi {student.fullName.split(" ")[0]} — answer honestly; there are no right or wrong answers. Your answers are
          saved on this device as you go. Studying {student.degreeLabel}?{" "}
          <Link href="/profile" className="link">
            Edit your profile
          </Link>
          .
        </p>
      </PageHeader>
      <AssessmentForm sections={sections} version={QUESTIONNAIRE_VERSION} />
    </div>
  );
}
