import { formatHours } from "@/lib/format";
import type { LearningPath } from "@/lib/matching/learning-path";
import { ImportanceTag } from "./skill-list";

export function LearningPathView({ path, firstSteps }: { path: LearningPath; firstSteps: string[] }) {
  return (
    <div className="space-y-6">
      {path.phases.length === 0 ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800">
          You already have every skill this career lists — focus on the career steps below to show it.
        </p>
      ) : (
        <p className="text-slate-600">
          {path.phases.length} phase{path.phases.length === 1 ? "" : "s"}, roughly{" "}
          <span className="font-semibold text-slate-900">{formatHours(path.totalHours)}</span> of focused learning in
          total. Work through the phases in order — the most important gaps come first.
        </p>
      )}

      <ol className="space-y-6">
        {path.phases.map((phase) => (
          <li key={phase.phase} className="relative border-l-2 border-brand-200 pl-5">
            <span
              aria-hidden
              className="absolute top-0 -left-[13px] grid size-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
            >
              {phase.phase}
            </span>
            <h3 className="font-semibold text-slate-900">
              Phase {phase.phase}: {phase.title}
            </h3>
            <p className="text-sm text-slate-500">
              {phase.description} About {phase.totalHours} hours.
            </p>

            <div className="mt-3 space-y-3">
              {phase.skills.map((plan) => (
                <div key={plan.skill.slug} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-900">{plan.skill.label}</h4>
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <ImportanceTag importance={plan.skill.importance} /> ~{plan.totalHours} h
                    </span>
                  </div>
                  <ol className="mt-3 space-y-3">
                    {plan.steps.map((step) => (
                      <li key={step.stepOrder} className="flex gap-3 text-sm">
                        <span aria-hidden className="mt-0.5 font-semibold text-brand-600">
                          {step.stepOrder}.
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">
                            {step.title} <span className="font-normal text-slate-400">· ~{step.estimatedHours} h</span>
                          </p>
                          <p className="text-slate-600">{step.description}</p>
                          {step.resourceUrl && (
                            <a href={step.resourceUrl} target="_blank" rel="noopener noreferrer" className="link mt-0.5 inline-block">
                              {step.resourceName ?? "Resource"}
                              <span className="sr-only"> (opens in a new tab)</span> ↗
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {firstSteps.length > 0 && (
        <div className="rounded-lg bg-brand-50 p-4">
          <h3 className="font-semibold text-brand-900">Career steps alongside your learning</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {firstSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
