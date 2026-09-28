import type { EducationLevel } from "../../../lib/taxonomy";

export interface DegreeSeed {
  slug: string;
  label: string;
  level: EducationLevel;
}

// The first options mirror the research Google Form (Q2). BCA, MCA, MSc, MCom
// and MA were added because they are common in India and otherwise fall
// under "Other", which the matching engine can only score neutrally.
export const degreeSeeds: DegreeSeed[] = [
  { slug: "bsc", label: "BSc", level: "undergraduate" },
  { slug: "bcom", label: "BCom", level: "undergraduate" },
  { slug: "bba", label: "BBA / BMS", level: "undergraduate" },
  { slug: "ba", label: "BA", level: "undergraduate" },
  { slug: "btech", label: "BTech / BE", level: "undergraduate" },
  { slug: "bca", label: "BCA", level: "undergraduate" },
  { slug: "mba", label: "MBA / PGDM", level: "postgraduate" },
  { slug: "mca", label: "MCA", level: "postgraduate" },
  { slug: "msc", label: "MSc", level: "postgraduate" },
  { slug: "mcom", label: "MCom", level: "postgraduate" },
  { slug: "ma", label: "MA", level: "postgraduate" },
  { slug: "other", label: "Other", level: "other" },
];
