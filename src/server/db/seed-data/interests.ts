export interface InterestSeed {
  slug: string;
  label: string;
  description: string;
}

// The team's agreed interest taxonomy (9 areas). The first six mirror the
// research Google Form (Q4). "Other" is an assessment option only.
export const interestSeeds: InterestSeed[] = [
  {
    slug: "technology-data",
    label: "Technology & Data",
    description: "Building software, working with data, and solving problems with technology.",
  },
  {
    slug: "finance",
    label: "Finance",
    description: "Money, markets, accounts, budgeting and investment decisions.",
  },
  {
    slug: "hr-people",
    label: "HR & People",
    description: "Hiring, developing and supporting people at work.",
  },
  {
    slug: "marketing",
    label: "Marketing",
    description: "Understanding customers, building brands and promoting products.",
  },
  {
    slug: "operations",
    label: "Operations",
    description: "Running processes, teams and projects efficiently day to day.",
  },
  {
    slug: "research",
    label: "Research",
    description: "Investigating questions, analysing evidence and drawing conclusions.",
  },
  {
    slug: "business-management",
    label: "Business & Management",
    description: "How businesses run and grow: strategy, management and decision-making.",
  },
  {
    slug: "consulting",
    label: "Consulting",
    description: "Advising organisations on problems and how to solve them.",
  },
  {
    slug: "entrepreneurship",
    label: "Entrepreneurship",
    description: "Starting, building and growing new ventures and opportunities.",
  },
];
