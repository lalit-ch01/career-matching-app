"use client";

import type { Question, QuestionOption } from "@/lib/assessment/questions";

// Renders one assessment question.
//   single -> radio buttons, value is a string
//   multi  -> checkboxes, value is a string[] (optionally grouped under headings)
//   scale  -> radio buttons 1–5 in a row, value is a string
// Controlled: the parent owns the answer and receives changes via onChange.

function groupOptions(options: QuestionOption[]): { group: string | null; options: QuestionOption[] }[] {
  const groups: { group: string | null; options: QuestionOption[] }[] = [];
  for (const option of options) {
    const key = option.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.group === key) last.options.push(option);
    else groups.push({ group: key, options: [option] });
  }
  return groups;
}

export function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: Question;
  value: string | string[];
  error?: string;
  onChange: (questionId: string, value: string | string[]) => void;
}) {
  const { id, type, label, help, options, maxSelect, minLabel, maxLabel, required } = question;
  const isMulti = type === "multi";
  const isScale = type === "scale";
  const selected = isMulti ? (value as string[]) : [];
  const limitReached = isMulti && maxSelect !== undefined && selected.length >= maxSelect;

  function toggle(optionValue: string) {
    if (!isMulti) {
      onChange(id, optionValue);
      return;
    }
    if (selected.includes(optionValue)) onChange(id, selected.filter((v) => v !== optionValue));
    else if (!limitReached) onChange(id, [...selected, optionValue]);
  }

  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

  const renderOption = (option: QuestionOption) => {
    const checked = isMulti ? selected.includes(option.value) : value === option.value;
    const disabled = isMulti && limitReached && !checked;
    return (
      <label
        key={option.value}
        className={[
          "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
          isScale ? "justify-center" : "",
          checked ? "border-brand-500 bg-brand-50 text-brand-900" : "border-slate-300 bg-white hover:border-slate-400",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        <input
          type={isMulti ? "checkbox" : "radio"}
          name={id}
          value={option.value}
          checked={checked}
          disabled={disabled}
          onChange={() => toggle(option.value)}
          className="size-4 accent-brand-600"
        />
        <span>{option.label}</span>
      </label>
    );
  };

  return (
    <fieldset className="mt-8 first:mt-0" aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="font-semibold text-slate-900">
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </legend>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-sm text-slate-500">
          {help}
          {isMulti && maxSelect !== undefined && ` ${selected.length}/${maxSelect} selected.`}
        </p>
      )}

      {isScale && (minLabel || maxLabel) && (
        <div className="mt-3 flex justify-between text-xs text-slate-500" aria-hidden>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}

      {isScale ? (
        <div className="mt-2 grid grid-cols-5 gap-2">{options.map(renderOption)}</div>
      ) : (
        groupOptions(options).map((g) => (
          <div key={g.group ?? "all"} className="mt-3">
            {g.group && <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{g.group}</p>}
            <div className="grid gap-2 sm:grid-cols-2">{g.options.map(renderOption)}</div>
          </div>
        ))
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
