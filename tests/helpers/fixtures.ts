import type { CareerForMatching, StudentForMatching } from "@/lib/matching/types";
import type { WorkType } from "@/lib/taxonomy";
import { careerSeeds } from "@/server/db/seed-data/careers";
import { degreeSeeds } from "@/server/db/seed-data/degrees";
import { skillSeeds } from "@/server/db/seed-data/skills";
import { interestSeeds } from "@/server/db/seed-data/interests";

const skillLabel = (slug: string) => skillSeeds.find((s) => s.slug === slug)!.label;
const interestLabel = (slug: string) => interestSeeds.find((i) => i.slug === slug)!.label;
export const degreeLabel = (slug: string) => degreeSeeds.find((d) => d.slug === slug)!.label;

/** The real seeded careers, in the shape the matching engine expects (no DB needed). */
export const seededCareers: CareerForMatching[] = careerSeeds.map((c) => ({
  slug: c.slug,
  title: c.title,
  degrees: Object.entries(c.degrees).map(([degreeSlug, fit]) => ({ degreeSlug, fit: fit! })),
  skills: Object.entries(c.skills).map(([slug, importance]) => ({ slug, label: skillLabel(slug), importance })),
  interests: Object.entries(c.interests).map(([slug, relevance]) => ({ slug, label: interestLabel(slug), relevance })),
  workTypes: Object.entries(c.workTypes).map(([workType, relevance]) => ({
    workType: workType as WorkType,
    relevance: relevance!,
  })),
  workStyle: c.workStyle,
  workEnvironment: c.workEnvironment,
  priorities: c.priorities,
}));

export function student(overrides: Partial<StudentForMatching> & Pick<StudentForMatching, "degreeSlug">): StudentForMatching {
  return {
    degreeLabel: degreeLabel(overrides.degreeSlug),
    skills: [],
    interests: [],
    workType: "analytical",
    workStyle: "mixed",
    workEnvironment: "structured",
    priorities: [],
    ...overrides,
  };
}

/** Realistic sample students used across tests (and the demo script). */
export const sampleStudents = {
  dataMindedBsc: student({
    degreeSlug: "bsc",
    skills: ["excel", "analytical-thinking", "problem-solving", "sql", "data-analysis"],
    interests: ["technology-data", "research"],
    workType: "analytical",
    workStyle: "independent",
    workEnvironment: "structured",
    priorities: ["fast-growth", "work-life-balance"],
  }),
  peopleFocusedBba: student({
    degreeSlug: "bba",
    skills: ["communication", "leadership", "recruitment", "teamwork", "hr-management"],
    interests: ["hr-people"],
    workType: "people-oriented",
    workStyle: "team",
    workEnvironment: "structured",
    priorities: ["job-stability", "social-impact", "work-life-balance"],
  }),
  creativeBa: student({
    degreeSlug: "ba",
    skills: ["creativity", "communication", "digital-marketing", "presentation"],
    interests: ["marketing"],
    workType: "creative",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    priorities: ["creativity", "fast-growth"],
  }),
  coderBtech: student({
    degreeSlug: "btech",
    skills: ["programming", "problem-solving", "python", "sql"],
    interests: ["technology-data"],
    workType: "technical",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    priorities: ["high-salary", "fast-growth"],
  }),
  researchMindedMa: student({
    degreeSlug: "ma",
    skills: ["research", "critical-thinking", "analytical-thinking", "excel", "presentation"],
    interests: ["research"],
    workType: "analytical",
    workStyle: "independent",
    workEnvironment: "structured",
    priorities: ["work-life-balance", "job-stability"],
  }),
};
