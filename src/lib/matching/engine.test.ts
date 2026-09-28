import { describe, expect, it } from "vitest";
import { sampleStudents, seededCareers, student } from "../../../tests/helpers/fixtures";
import { EDUCATION_SCORES, FACTOR_WEIGHTS } from "./config";
import { calculateMatches, scoreCareer } from "./engine";
import type { CareerForMatching } from "./types";

const career = (slug: string) => seededCareers.find((c) => c.slug === slug)!;
const topSlugs = (matches: ReturnType<typeof calculateMatches>, n: number) =>
  matches.slice(0, n).map((m) => m.careerSlug);

describe("factor weights", () => {
  it("add up to exactly 100%", () => {
    const total = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

describe("calculateMatches — sample students get sensible rankings", () => {
  it("ranks Data Analyst first for a data-minded BSc student", () => {
    const matches = calculateMatches(sampleStudents.dataMindedBsc, seededCareers);
    expect(matches[0].careerSlug).toBe("data-analyst");
    expect(matches[0].matchPercent).toBeGreaterThanOrEqual(75);
  });

  it("ranks HR Executive first for a people-focused BBA student", () => {
    const matches = calculateMatches(sampleStudents.peopleFocusedBba, seededCareers);
    expect(matches[0].careerSlug).toBe("hr-executive");
  });

  it("puts marketing careers on top for a creative BA student", () => {
    const matches = calculateMatches(sampleStudents.creativeBa, seededCareers);
    expect(topSlugs(matches, 2).sort()).toEqual(["digital-marketing-executive", "marketing-executive"]);
  });

  it("ranks Software Developer first for a BTech coder", () => {
    const matches = calculateMatches(sampleStudents.coderBtech, seededCareers);
    expect(matches[0].careerSlug).toBe("software-developer");
    expect(matches[0].band).toBe("strong");
  });

  it("ranks Research Analyst first for a research-minded MA student", () => {
    const matches = calculateMatches(sampleStudents.researchMindedMa, seededCareers);
    expect(matches[0].careerSlug).toBe("research-analyst");
  });
});

describe("calculateMatches — invariants", () => {
  const allResults = Object.values(sampleStudents).map((s) => calculateMatches(s, seededCareers));

  it("scores every career exactly once with ranks 1..n", () => {
    for (const matches of allResults) {
      expect(matches).toHaveLength(seededCareers.length);
      expect(matches.map((m) => m.rank)).toEqual(seededCareers.map((_, i) => i + 1));
      expect(new Set(matches.map((m) => m.careerSlug)).size).toBe(seededCareers.length);
    }
  });

  it("orders results by match % (best first)", () => {
    for (const matches of allResults) {
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].matchPercent).toBeGreaterThanOrEqual(matches[i].matchPercent);
      }
    }
  });

  it("keeps every score within 0–100 and every factor within 0–1", () => {
    for (const m of allResults.flat()) {
      expect(m.matchPercent).toBeGreaterThanOrEqual(0);
      expect(m.matchPercent).toBeLessThanOrEqual(100);
      for (const f of m.factors) {
        expect(f.score).toBeGreaterThanOrEqual(0);
        expect(f.score).toBeLessThanOrEqual(1);
      }
    }
  });

  it("explains every point: factor points add up to the Match %", () => {
    for (const m of allResults.flat()) {
      const sum = m.factors.reduce((acc, f) => acc + f.points, 0);
      // Factor points are shown to one decimal, the total is rounded to a whole number.
      expect(Math.abs(sum - m.matchPercent)).toBeLessThanOrEqual(0.5 + 0.05 * m.factors.length);
      expect(m.factors.every((f) => f.summary.length > 0)).toBe(true);
    }
  });

  it("splits required skills into matched + missing with nothing lost", () => {
    for (const m of allResults.flat()) {
      const required = career(m.careerSlug).skills.map((s) => s.slug).sort();
      expect([...m.matchedSkills, ...m.missingSkills].map((s) => s.slug).sort()).toEqual(required);
    }
  });

  it("never lowers the potential match below the current one", () => {
    for (const m of allResults.flat()) {
      expect(m.potentialMatchPercent).toBeGreaterThanOrEqual(m.matchPercent);
      if (m.missingSkills.length === 0) expect(m.potentialMatchPercent).toBe(m.matchPercent);
    }
  });

  it("is deterministic", () => {
    const s = sampleStudents.dataMindedBsc;
    expect(calculateMatches(s, seededCareers)).toEqual(calculateMatches(s, seededCareers));
  });

  it("lists missing skills most important first", () => {
    for (const m of allResults.flat()) {
      for (let i = 1; i < m.missingSkills.length; i++) {
        expect(m.missingSkills[i - 1].importance).toBeGreaterThanOrEqual(m.missingSkills[i].importance);
      }
    }
  });
});

describe("scoreCareer — individual rules", () => {
  const perfectFor = (c: CareerForMatching) =>
    student({
      degreeSlug: c.degrees.find((d) => d.fit === "preferred")!.degreeSlug,
      skills: c.skills.map((s) => s.slug),
      interests: c.interests.filter((i) => i.relevance === "primary").map((i) => i.slug),
      workType: c.workTypes.find((w) => w.relevance === "primary")!.workType,
      workStyle: c.workStyle,
      workEnvironment: c.workEnvironment === "balanced" ? "structured" : c.workEnvironment,
      priorities: c.priorities.slice(0, 3),
    });

  it("gives a perfect-fit student 100% (or 97%+ for 'balanced' environments)", () => {
    for (const c of seededCareers) {
      const m = scoreCareer(perfectFor(c), c);
      expect(m.matchPercent).toBeGreaterThanOrEqual(c.workEnvironment === "balanced" ? 97 : 100);
      expect(m.missingSkills).toHaveLength(0);
    }
  });

  it("weights skills by importance", () => {
    const se = career("software-developer");
    const coreOnly = scoreCareer(student({ degreeSlug: "btech", skills: ["programming"] }), se);
    const niceOnly = scoreCareer(student({ degreeSlug: "btech", skills: ["teamwork"] }), se);
    const skills = (m: typeof coreOnly) => m.factors.find((f) => f.key === "skills")!.score;
    expect(skills(coreOnly)).toBeGreaterThan(skills(niceOnly));
  });

  it("scores education: preferred > accepted > unlisted, and 'Other' neutrally", () => {
    const se = career("software-developer");
    const edu = (degreeSlug: string) =>
      scoreCareer(student({ degreeSlug }), se).factors.find((f) => f.key === "education")!.score;
    expect(edu("btech")).toBe(EDUCATION_SCORES.preferred);
    expect(edu("bsc")).toBe(EDUCATION_SCORES.accepted);
    expect(edu("bcom")).toBe(EDUCATION_SCORES.unlisted);
    expect(edu("other")).toBe(EDUCATION_SCORES.unknown);
  });

  it("counts a secondary interest as half a primary one", () => {
    const ba = career("business-analyst");
    const interest = (interests: string[]) =>
      scoreCareer(student({ degreeSlug: "bba", interests }), ba).factors.find((f) => f.key === "interests")!.score;
    expect(interest(["business-management"])).toBe(1);
    expect(interest(["consulting"])).toBe(0.5);
    expect(interest(["marketing"])).toBe(0);
  });

  it("refuses to score a career with malformed data instead of producing NaN", () => {
    const broken = { ...career("data-analyst"), skills: [{ slug: "excel", label: "Excel", importance: undefined as never }] };
    expect(() => scoreCareer(student({ degreeSlug: "bsc" }), broken)).toThrow(/invalid skills data/);
  });

  it("gives a student with no matching skills 0 skill points but still explains why", () => {
    const m = scoreCareer(student({ degreeSlug: "ba" }), career("financial-analyst"));
    const skills = m.factors.find((f) => f.key === "skills")!;
    expect(skills.points).toBe(0);
    expect(skills.summary).toMatch(/0 of 6 required skills/);
  });
});
