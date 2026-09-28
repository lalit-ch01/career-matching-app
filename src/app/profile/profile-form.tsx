"use client";

import { useActionState, useState } from "react";
import type { ProfileField, ProfileFormState } from "@/lib/profile/schema";
import { EDUCATION_LEVELS, EDUCATION_LEVEL_LABELS, OTHER_OPTION, type EducationLevel } from "@/lib/taxonomy";
import { saveProfileAction } from "./actions";

export interface DegreeChoice {
  slug: string;
  label: string;
  level: EducationLevel;
}

export function ProfileForm({
  degrees,
  initialValues,
  isExisting,
}: {
  degrees: DegreeChoice[];
  initialValues: Partial<Record<ProfileField, string>>;
  isExisting: boolean;
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(saveProfileAction, {});
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};

  // Level and degree are controlled so the degree list can follow the level.
  const [level, setLevel] = useState(values.educationLevel ?? "");
  const [degree, setDegree] = useState(values.degreeSlug ?? "");

  const degreeOptions = degrees.filter(
    (d) => !level || level === OTHER_OPTION || d.level === level || d.level === OTHER_OPTION,
  );

  function handleLevelChange(next: string) {
    setLevel(next);
    const current = degrees.find((d) => d.slug === degree);
    if (current && next !== OTHER_OPTION && current.level !== OTHER_OPTION && current.level !== next) setDegree("");
  }

  const fieldProps = (name: ProfileField) => ({
    id: name,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const fieldError = (name: ProfileField) =>
    errors[name] ? (
      <p id={`${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form action={formAction} noValidate className="card space-y-5">
      {errors._form && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors._form}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="field-label">
          Full name
        </label>
        <input
          {...fieldProps("fullName")}
          className="field-input"
          defaultValue={values.fullName}
          autoComplete="name"
          required
          maxLength={100}
        />
        {fieldError("fullName")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="educationLevel" className="field-label">
            Current level of education
          </label>
          <select
            {...fieldProps("educationLevel")}
            className="field-input"
            value={level}
            onChange={(e) => handleLevelChange(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose…
            </option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>
                {EDUCATION_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          {fieldError("educationLevel")}
        </div>

        <div>
          <label htmlFor="degreeSlug" className="field-label">
            Degree / specialisation
          </label>
          <select
            {...fieldProps("degreeSlug")}
            className="field-input"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose…
            </option>
            {degreeOptions.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
          {fieldError("degreeSlug")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="college" className="field-label">
            College / university <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            {...fieldProps("college")}
            className="field-input"
            defaultValue={values.college}
            autoComplete="organization"
            maxLength={150}
          />
          {fieldError("college")}
        </div>
        <div>
          <label htmlFor="graduationYear" className="field-label">
            Graduation year <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            {...fieldProps("graduationYear")}
            className="field-input"
            defaultValue={values.graduationYear}
            inputMode="numeric"
            placeholder="e.g. 2026"
            maxLength={4}
          />
          {fieldError("graduationYear")}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          {...fieldProps("email")}
          type="email"
          className="field-input"
          defaultValue={values.email}
          autoComplete="email"
          aria-describedby={errors.email ? "email-error" : "email-help"}
        />
        {fieldError("email") ?? (
          <p id="email-help" className="field-help">
            Only stored with your profile. We don&apos;t send emails.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : isExisting ? "Save and continue" : "Continue to assessment"}
        </button>
      </div>
    </form>
  );
}
