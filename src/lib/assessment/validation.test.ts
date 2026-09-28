import { describe, expect, it } from "vitest";
import { skillSeeds } from "@/server/db/seed-data/skills";
import { interestSeeds } from "@/server/db/seed-data/interests";
import { buildAssessment } from "./questions";
import { createEmptyAnswers, toStudentForMatching, validateAssessment, validateSection } from "./validation";

const sections = buildAssessment({
  skills: skillSeeds.map(({ slug, label, category, isFoundational }) => ({ slug, label, category, isFoundational })),
  interests: interestSeeds.map(({ slug, label }) => ({ slug, label })),
});

const validAnswers = {
  skills: ["excel", "other"],
  skills_detail: ["sql"],
  skill_confidence: "4",
  interests: ["technology-data", "other"],
  work_type: "analytical",
  work_style: "mixed",
  work_environment: "structured",
  career_priorities: ["fast-growth", "high-salary"],
};

describe("buildAssessment", () => {
  it("offers every foundational skill in the first question and the rest as detail", () => {
    const [skillsQ, detailQ] = sections[0].questions;
    const foundational = skillSeeds.filter((s) => s.isFoundational).map((s) => s.slug);
    expect(skillsQ.options.map((o) => o.value)).toEqual([...foundational, "other"]);
    expect(detailQ.options).toHaveLength(skillSeeds.length - foundational.length);
    expect(detailQ.options.every((o) => o.group)).toBe(true);
  });
});

describe("validateAssessment", () => {
  it("accepts a complete, valid submission and normalises types", () => {
    const result = validateAssessment(sections, validAnswers);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.answers.skill_confidence).toBe(4);
  });

  it("allows the optional detailed-skills question to be skipped", () => {
    expect(validateAssessment(sections, { ...validAnswers, skills_detail: [] }).ok).toBe(true);
    const { skills_detail: _omit, ...withoutDetail } = validAnswers;
    expect(validateAssessment(sections, withoutDetail).ok).toBe(true);
  });

  it.each([
    ["missing required answer", { skills: [] }, "skills"],
    ["unknown option", { work_type: "astronaut" }, "work_type"],
    ["unknown skill slug", { skills_detail: ["hacking"] }, "skills_detail"],
    ["too many priorities", { career_priorities: ["high-salary", "job-stability", "fast-growth", "creativity"] }, "career_priorities"],
    ["duplicate choices", { interests: ["finance", "finance"] }, "interests"],
    ["wrong type", { skills: "excel" }, "skills"],
    ["out-of-range scale", { skill_confidence: "9" }, "skill_confidence"],
  ])("rejects %s", (_name, override, field) => {
    const result = validateAssessment(sections, { ...validAnswers, ...override });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBeTruthy();
  });

  it.each([null, "answers", 42, []])("rejects a malformed payload (%j)", (payload) => {
    expect(validateAssessment(sections, payload).ok).toBe(false);
  });
});

describe("validateSection", () => {
  it("reports every unanswered required question in a section", () => {
    const errors = validateSection(sections[2], createEmptyAnswers(sections));
    expect(Object.keys(errors).sort()).toEqual(["work_environment", "work_style", "work_type"]);
  });
});

describe("toStudentForMatching", () => {
  it("merges broad and detailed skills and drops 'Other'", () => {
    const result = validateAssessment(sections, { ...validAnswers, skills_detail: ["sql", "python"] });
    if (!result.ok) throw new Error("expected valid");
    const s = toStudentForMatching({ slug: "bsc", label: "BSc" }, result.answers);
    expect(s.skills.sort()).toEqual(["excel", "python", "sql"]);
    expect(s.interests).toEqual(["technology-data"]);
  });
});
