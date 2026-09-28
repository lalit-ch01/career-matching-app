import { describe, expect, it } from "vitest";
import { buildAssessment } from "@/lib/assessment/questions";
import { defaultSeedData, findSeedProblems, findSeedWarnings, type SeedData } from "./seed";

// The team's agreed taxonomy. These tests fail if the seed data drifts from it.
const TEAM_SKILLS = [
  "Excel", "Communication", "Analytical Thinking", "Leadership", "Creativity", "Programming",
  "Problem Solving", "Data Analysis", "SQL", "Python", "Research", "Teamwork", "Time Management",
  "Decision Making", "Presentation", "Recruitment", "Digital Marketing", "Financial Analysis",
  "Accounting", "Project Management", "HR Management", "Business Analysis", "Critical Thinking",
  "Adaptability",
];
const TEAM_INTERESTS = [
  "Technology & Data", "Finance", "HR & People", "Marketing", "Operations", "Research",
  "Business & Management", "Consulting", "Entrepreneurship",
];
const TEAM_CAREERS: Record<string, string> = {
  "data-analyst": "technology-data",
  "business-analyst": "business-management",
  "financial-analyst": "finance",
  "hr-executive": "hr-people",
  "hr-recruiter": "hr-people",
  "marketing-executive": "marketing",
  "digital-marketing-executive": "marketing",
  "operations-executive": "operations",
  "project-coordinator": "operations",
  "research-analyst": "research",
  "management-trainee": "business-management",
  "software-developer": "technology-data",
  "business-development-executive": "business-management",
  "talent-acquisition-specialist": "hr-people",
};
/** Career -> skills, exactly as in the team's list. */
const TEAM_SKILL_MAPPINGS: Record<string, string[]> = {
  "data-analyst": ["Excel", "Data Analysis", "SQL", "Analytical Thinking", "Problem Solving"],
  "business-analyst": ["Analytical Thinking", "Excel", "Business Analysis", "Problem Solving", "Communication", "Presentation"],
  "financial-analyst": ["Excel", "Financial Analysis", "Accounting", "Analytical Thinking", "Data Analysis", "Critical Thinking"],
  "hr-executive": ["Communication", "Recruitment", "HR Management", "Teamwork", "Adaptability"],
  "hr-recruiter": ["Communication", "Recruitment", "Presentation", "Teamwork", "Adaptability"],
  "marketing-executive": ["Communication", "Creativity", "Digital Marketing", "Presentation", "Teamwork"],
  "digital-marketing-executive": ["Digital Marketing", "Creativity", "Communication", "Analytical Thinking", "Adaptability"],
  "operations-executive": ["Problem Solving", "Teamwork", "Time Management", "Decision Making", "Communication"],
  "project-coordinator": ["Project Management", "Communication", "Teamwork", "Time Management", "Problem Solving"],
  "research-analyst": ["Research", "Analytical Thinking", "Data Analysis", "Critical Thinking", "Communication"],
  "management-trainee": ["Communication", "Leadership", "Problem Solving", "Teamwork", "Adaptability", "Presentation"],
  "software-developer": ["Programming", "Problem Solving", "Python", "SQL", "Critical Thinking", "Adaptability"],
  "business-development-executive": ["Communication", "Presentation", "Problem Solving", "Adaptability", "Teamwork"],
  "talent-acquisition-specialist": ["Recruitment", "Communication", "HR Management", "Teamwork", "Presentation", "Adaptability"],
};
/** Career -> interests, exactly as in the team's list (first = main area). */
const TEAM_INTEREST_MAPPINGS: Record<string, string[]> = {
  "data-analyst": ["Technology & Data"],
  "business-analyst": ["Business & Management", "Consulting"],
  "financial-analyst": ["Finance"],
  "hr-executive": ["HR & People"],
  "hr-recruiter": ["HR & People"],
  "marketing-executive": ["Marketing"],
  "digital-marketing-executive": ["Marketing"],
  "operations-executive": ["Operations"],
  "project-coordinator": ["Operations", "Business & Management"],
  "research-analyst": ["Research"],
  "management-trainee": ["Business & Management"],
  "software-developer": ["Technology & Data"],
  "business-development-executive": ["Business & Management", "Entrepreneurship"],
  "talent-acquisition-specialist": ["HR & People"],
};

const skillLabel = (slug: string) => defaultSeedData.skills.find((s) => s.slug === slug)!.label;
const interestLabel = (slug: string) => defaultSeedData.interests.find((i) => i.slug === slug)!.label;
const career = (slug: string) => defaultSeedData.careers.find((c) => c.slug === slug)!;

describe("career database seed data matches the team's taxonomy", () => {
  it("has exactly the team's 24 skills (in any order — they're grouped by category for display)", () => {
    expect(defaultSeedData.skills.map((s) => s.label).sort()).toEqual([...TEAM_SKILLS].sort());
  });

  it("asks the Google Form's seven skills first", () => {
    expect(defaultSeedData.skills.filter((s) => s.isFoundational).map((s) => s.label)).toEqual(TEAM_SKILLS.slice(0, 7));
  });

  it("has exactly the team's 9 interests", () => {
    expect(defaultSeedData.interests.map((i) => i.label)).toEqual(TEAM_INTERESTS);
  });

  it("has exactly the team's 14 career roles, each with its main interest", () => {
    expect(defaultSeedData.careers.map((c) => c.slug).sort()).toEqual(Object.keys(TEAM_CAREERS).sort());
    for (const [slug, mainInterest] of Object.entries(TEAM_CAREERS)) {
      expect(career(slug).interests[mainInterest], slug).toBe("primary");
    }
  });

  it("uses the team's career → skill mappings for all 14 careers", () => {
    expect(Object.keys(TEAM_SKILL_MAPPINGS)).toHaveLength(14);
    for (const [slug, expected] of Object.entries(TEAM_SKILL_MAPPINGS)) {
      expect(Object.keys(career(slug).skills).map(skillLabel).sort(), slug).toEqual([...expected].sort());
    }
  });

  it("uses the team's career → interest mappings (first = primary, rest = related)", () => {
    for (const [slug, [primary, ...related]] of Object.entries(TEAM_INTEREST_MAPPINGS)) {
      const interests = career(slug).interests;
      expect(Object.keys(interests).map(interestLabel).sort(), slug).toEqual([primary, ...related].sort());
      for (const name of related) {
        const entry = Object.entries(interests).find(([s]) => interestLabel(s) === name)!;
        expect(entry[1], `${slug}: ${name}`).toBe("secondary");
      }
    }
  });

  it("weights domain skills as core (3) and transferable skills as supporting (2)", () => {
    for (const c of defaultSeedData.careers) {
      for (const [slug, importance] of Object.entries(c.skills)) {
        const kind = defaultSeedData.skills.find((s) => s.slug === slug)!.kind;
        expect(importance, `${c.slug}: ${slug}`).toBe(kind === "domain" ? 3 : 2);
      }
    }
  });
});

describe("pre-seed validation", () => {
  it("finds no blocking problems in the real data", () => {
    expect(findSeedProblems(defaultSeedData)).toEqual([]);
  });

  it("makes every skill a career requires selectable in the assessment", () => {
    const sections = buildAssessment({
      skills: defaultSeedData.skills.map(({ slug, label, category, isFoundational }) => ({ slug, label, category, isFoundational })),
      interests: defaultSeedData.interests,
    });
    const selectable = new Set(
      sections[0].questions.filter((q) => q.id.startsWith("skills")).flatMap((q) => q.options.map((o) => o.value)),
    );
    for (const c of defaultSeedData.careers) {
      for (const skill of Object.keys(c.skills)) expect(selectable, `${c.slug}: ${skill}`).toContain(skill);
    }
  });

  const withCareer = (overrides: Partial<SeedData["careers"][number]>): SeedData => ({
    ...defaultSeedData,
    careers: [{ ...defaultSeedData.careers[0], ...overrides }, ...defaultSeedData.careers.slice(1)],
  });

  it.each([
    ["an unknown skill", withCareer({ skills: { "made-up-skill": 3, excel: 3, sql: 3 } }), "unknown skill"],
    ["an unknown interest", withCareer({ interests: { astrology: "primary" } }), "unknown interest"],
    ["a bad slug", withCareer({ slug: "Data Analyst" }), "lowercase-kebab-case"],
    ["too few skills", withCareer({ skills: { excel: 3 } }), "at least 3 required skills"],
    ["no primary interest", withCareer({ interests: { "technology-data": "secondary" } }), "no primary interest"],
    [
      "a duplicate skill name",
      { ...defaultSeedData, skills: [...defaultSeedData.skills, { ...defaultSeedData.skills[0], slug: "excel-2", label: "excel" }] },
      'Duplicate skill name "excel"',
    ],
    [
      "a skill no career uses",
      { ...defaultSeedData, skills: [...defaultSeedData.skills, { ...defaultSeedData.skills[0], slug: "yoga", label: "Yoga" }] },
      'Skill "Yoga" isn\'t required by any career',
    ],
    [
      "an interest no career uses",
      { ...defaultSeedData, interests: [...defaultSeedData.interests, { slug: "sports", label: "Sports", description: "x" }] },
      'Interest "Sports" isn\'t linked to any career',
    ],
  ])("blocks %s", (_name, data, message) => {
    expect(findSeedProblems(data as SeedData)).toContainEqual(expect.stringContaining(message));
  });

  it("warns about the decisions the team still needs to make", () => {
    const warnings = findSeedWarnings(defaultSeedData).join("\n");
    expect(warnings).toContain('Interest "Consulting" is only a related');
    expect(warnings).toContain('Interest "Entrepreneurship" is only a related');
    expect(warnings).toContain('"HR Executive" and "HR Recruiter" share 4 skills');
    expect(warnings).toContain('"HR Recruiter" and "Talent Acquisition Specialist" share 5 skills');
    expect(warnings).toContain('"Management Trainee" and "Business Development Executive" share 5 skills');
    // All 14 skill mappings are confirmed by the team.
    expect(warnings).not.toContain("drafted");
  });

  it("warns while any skill mapping is still marked as drafted", () => {
    expect(findSeedWarnings(defaultSeedData, ["software-developer"]).join("\n")).toContain(
      "drafted, not taken from the team's list",
    );
  });
});
