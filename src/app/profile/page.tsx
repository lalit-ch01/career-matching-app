import type { Metadata } from "next";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageHeader } from "@/components/page-header";
import { getDb } from "@/server/db/client";
import { listDegrees } from "@/server/repositories/reference";
import { getCurrentStudent } from "@/server/session";
import { deleteMyDataAction, signOutAction } from "./actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const [student, degrees] = await Promise.all([getCurrentStudent(), listDegrees(getDb())]);

  return (
    <div className="container-page max-w-2xl">
      <PageHeader eyebrow="Step 1 of 3" title={student ? "Your profile" : "Tell us about yourself"}>
        <p>
          Your education is one of the five factors in your career match. You don&apos;t need an account — this device
          remembers you.
        </p>
      </PageHeader>

      <ProfileForm
        degrees={degrees.map(({ slug, label, level }) => ({ slug, label, level }))}
        isExisting={Boolean(student)}
        initialValues={
          student
            ? {
                fullName: student.fullName,
                email: student.email ?? "",
                college: student.college ?? "",
                educationLevel: student.educationLevel,
                degreeSlug: student.degreeSlug,
                graduationYear: student.graduationYear?.toString() ?? "",
              }
            : {}
        }
      />

      {student && (
        <section className="mt-8 rounded-xl border border-slate-200 p-5 text-sm" aria-labelledby="privacy">
          <h2 id="privacy" className="font-semibold text-slate-900">
            Your data
          </h2>
          <p className="mt-1 text-slate-600">
            Using a shared computer? Forget this device. You can also permanently delete your profile, answers and
            results.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={signOutAction}>
              <button type="submit" className="btn-secondary">
                Forget me on this device
              </button>
            </form>
            <form action={deleteMyDataAction}>
              <ConfirmSubmitButton
                className="btn text-red-700 hover:bg-red-50"
                message="Permanently delete your profile, answers and results? This can't be undone."
              >
                Delete my data
              </ConfirmSubmitButton>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
