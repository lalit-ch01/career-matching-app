"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import type { AssessmentSection } from "@/lib/assessment/questions";
import {
  createEmptyAnswers,
  validateQuestion,
  validateSection,
  type AnswerErrors,
  type RawAnswers,
} from "@/lib/assessment/validation";
import { submitAssessmentAction } from "./actions";
import { QuestionField } from "./question-field";

// Multi-step assessment: one section per step, validated before moving on,
// validated again on the server on submit. A draft is kept in localStorage so
// a refresh or accidental navigation doesn't lose the student's answers.

const noopSubscribe = () => () => {};

function draftKey(version: string) {
  return `dtc-assessment-draft:${version}`;
}

/** Restores a saved draft, keeping only answers that are still valid options. */
function loadDraft(sections: AssessmentSection[], version: string): { answers: RawAnswers; step: number } | null {
  try {
    const raw = window.localStorage.getItem(draftKey(version));
    if (!raw) return null;
    const saved = JSON.parse(raw) as { answers?: Record<string, unknown>; step?: unknown };
    const answers = createEmptyAnswers(sections);
    for (const section of sections) {
      for (const q of section.questions) {
        const value = saved.answers?.[q.id];
        if (value !== undefined && validateQuestion({ ...q, required: false }, value) === null) {
          answers[q.id] = value as string | string[];
        }
      }
    }
    const step = typeof saved.step === "number" ? Math.min(Math.max(0, saved.step), sections.length - 1) : 0;
    return { answers, step };
  } catch {
    return null;
  }
}

function saveDraft(version: string, answers: RawAnswers, step: number) {
  try {
    window.localStorage.setItem(draftKey(version), JSON.stringify({ answers, step }));
  } catch {
    // Storage can be unavailable (private mode, quota); the form still works.
  }
}

function clearDraft(version: string) {
  try {
    window.localStorage.removeItem(draftKey(version));
  } catch {
    // ignore
  }
}

export function AssessmentForm({ sections, version }: { sections: AssessmentSection[]; version: string }) {
  // The draft lives in localStorage, which only exists in the browser. Render a
  // placeholder on the server and during hydration, then the real form.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) {
    return (
      <div className="card animate-pulse" aria-busy="true">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-6 h-32 rounded bg-slate-100" />
      </div>
    );
  }
  return <AssessmentWizard sections={sections} version={version} initial={loadDraft(sections, version)} />;
}

function AssessmentWizard({
  sections,
  version,
  initial,
}: {
  sections: AssessmentSection[];
  version: string;
  initial: { answers: RawAnswers; step: number } | null;
}) {
  const [answers, setAnswers] = useState<RawAnswers>(() => initial?.answers ?? createEmptyAnswers(sections));
  const [stepIndex, setStepIndex] = useState(initial?.step ?? 0);
  const [errors, setErrors] = useState<AnswerErrors>({});
  const [isSubmitting, startSubmit] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [showRestoredNotice, setShowRestoredNotice] = useState(Boolean(initial));

  const section = sections[stepIndex];
  const isLastStep = stepIndex === sections.length - 1;

  useEffect(() => {
    saveDraft(version, answers, stepIndex);
  }, [version, answers, stepIndex]);

  function goToStep(index: number) {
    setStepIndex(index);
    setShowRestoredNotice(false);
    // Move focus to the new section heading for keyboard and screen-reader users.
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleChange(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      if (!prev[questionId] && !prev._form) return prev;
      const { [questionId]: _removed, _form: _formError, ...rest } = prev;
      return rest;
    });
  }

  function handleNext() {
    const sectionErrors = validateSection(section, answers);
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(sectionErrors);
      return;
    }
    setErrors({});
    if (!isLastStep) {
      goToStep(stepIndex + 1);
      return;
    }

    startSubmit(async () => {
      // Clear the draft first: a successful submit navigates away immediately.
      clearDraft(version);
      const result = await submitAssessmentAction(answers);
      // Only reached if the server rejected the submission.
      saveDraft(version, answers, stepIndex);
      const serverErrors = result?.errors ?? { _form: "Something went wrong. Please try again." };
      setErrors(serverErrors);
      const firstInvalid = sections.findIndex((s) => s.questions.some((q) => serverErrors[q.id]));
      if (firstInvalid !== -1 && firstInvalid !== stepIndex) goToStep(firstInvalid);
    });
  }

  function handleStartOver() {
    if (!window.confirm("Clear all your answers and start again?")) return;
    clearDraft(version);
    setAnswers(createEmptyAnswers(sections));
    setErrors({});
    goToStep(0);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Section {stepIndex + 1} of {sections.length}
        </p>
        {showRestoredNotice && <p className="text-xs">Restored your saved answers.</p>}
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Assessment progress"
        aria-valuemin={1}
        aria-valuemax={sections.length}
        aria-valuenow={stepIndex + 1}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${((stepIndex + 1) / sections.length) * 100}%` }}
        />
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-xl font-bold text-slate-900 outline-none">
        {section.title}
      </h2>
      <p className="mt-1 text-slate-600">{section.description}</p>

      <div className="mt-6">
        {section.questions.map((q) => (
          <QuestionField key={q.id} question={q} value={answers[q.id]} error={errors[q.id]} onChange={handleChange} />
        ))}
      </div>

      {errors._form && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors._form}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setErrors({});
                goToStep(stepIndex - 1);
              }}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={handleStartOver} disabled={isSubmitting}>
            Start over
          </button>
        </div>
        <button type="button" className="btn-primary" onClick={handleNext} disabled={isSubmitting}>
          {isLastStep ? (isSubmitting ? "Matching your profile…" : "Submit and see my matches") : "Next"}
        </button>
      </div>
    </div>
  );
}
