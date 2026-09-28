import type { SkillCategory } from "../../../lib/taxonomy";

export interface LearningStepSeed {
  title: string;
  description: string;
  resourceName?: string;
  resourceUrl?: string;
  estimatedHours: number;
}

/**
 * domain       = role-specific skill (SQL, Recruitment…) -> core for a career (3 points)
 * transferable = general skill (Communication, Teamwork…) -> supporting (2 points)
 */
export type SkillKind = "domain" | "transferable";

export interface SkillSeed {
  slug: string;
  /** Display name — exactly as in the team's agreed skill list. */
  label: string;
  description: string;
  category: SkillCategory;
  kind: SkillKind;
  /** True for the broad skills listed in the research Google Form (Q3). */
  isFoundational: boolean;
  /** Ordered steps: learn the basics -> practise -> prove it. */
  learningSteps: LearningStepSeed[];
}

// The team's agreed skill taxonomy (24 skills). The first seven are the
// research Google Form's skills (Q3) and are asked first in the assessment.
// Resource links use top-level pages of well-known, free or low-cost
// providers. Hours are rough estimates for a student starting from scratch.
export const skillSeeds: SkillSeed[] = [
  // ---------- Foundational (Google Form Q3) ----------
  {
    slug: "excel",
    label: "Excel",
    description: "Spreadsheets: formulas, lookups, pivot tables and charts.",
    category: "data",
    kind: "domain",
    isFoundational: true,
    learningSteps: [
      {
        title: "Learn core Excel",
        description: "Formulas, cell references, sorting/filtering, XLOOKUP/VLOOKUP, IF and basic charts.",
        resourceName: "Microsoft Excel help & learning",
        resourceUrl: "https://support.microsoft.com/en-us/excel",
        estimatedHours: 12,
      },
      {
        title: "Master pivot tables",
        description: "Summarise a large dataset with pivot tables and slicers; build a one-page summary.",
        estimatedHours: 8,
      },
      {
        title: "Build a real tracker",
        description: "Create a monthly budget or attendance tracker with validation, conditional formatting and a dashboard sheet.",
        estimatedHours: 6,
      },
    ],
  },
  {
    slug: "communication",
    label: "Communication",
    description: "Explaining ideas clearly in writing and in conversation.",
    category: "general",
    kind: "transferable",
    isFoundational: true,
    learningSteps: [
      {
        title: "Practise structured writing",
        description: "Write short emails and summaries using the 'main point first' structure; ask someone to review them.",
        estimatedHours: 6,
      },
      {
        title: "Practise speaking regularly",
        description: "Join a public-speaking club or college society and speak at least once a week.",
        resourceName: "Toastmasters International",
        resourceUrl: "https://www.toastmasters.org/",
        estimatedHours: 15,
      },
    ],
  },
  {
    slug: "analytical-thinking",
    label: "Analytical Thinking",
    description: "Breaking problems down, spotting patterns and reasoning with evidence.",
    category: "general",
    kind: "transferable",
    isFoundational: true,
    learningSteps: [
      {
        title: "Practise case-style problems",
        description: "Work through guesstimates and business case questions; write out your reasoning step by step.",
        estimatedHours: 10,
      },
      {
        title: "Analyse a real question",
        description: "Pick a question (e.g. 'why do students drop a course?'), gather evidence, and write a one-page conclusion.",
        estimatedHours: 8,
      },
    ],
  },
  {
    slug: "leadership",
    label: "Leadership",
    description: "Guiding a group towards a goal and taking responsibility for outcomes.",
    category: "people-management",
    kind: "transferable",
    isFoundational: true,
    learningSteps: [
      {
        title: "Lead something small",
        description: "Take charge of a college event, club activity or group project from planning to delivery.",
        estimatedHours: 20,
      },
      {
        title: "Reflect and get feedback",
        description: "Ask your team what worked and what didn't; write down three things you'll do differently.",
        estimatedHours: 3,
      },
    ],
  },
  {
    slug: "creativity",
    label: "Creativity",
    description: "Coming up with original ideas and presenting them in engaging ways.",
    category: "general",
    kind: "transferable",
    isFoundational: true,
    learningSteps: [
      {
        title: "Create regularly",
        description: "Make one small creative piece a week — a post, design, video or campaign idea — for a month.",
        estimatedHours: 12,
      },
      {
        title: "Build a portfolio",
        description: "Collect your best 5–6 pieces in a simple online portfolio with a line on the idea behind each.",
        estimatedHours: 8,
      },
    ],
  },
  {
    slug: "programming",
    label: "Programming",
    description: "Writing code to solve problems (e.g. Java, C++, JavaScript).",
    category: "technology",
    kind: "domain",
    isFoundational: true,
    learningSteps: [
      {
        title: "Learn programming fundamentals",
        description: "Variables, conditions, loops, functions, debugging and basic data structures in one language.",
        resourceName: "Harvard CS50x (free)",
        resourceUrl: "https://cs50.harvard.edu/x/",
        estimatedHours: 40,
      },
      {
        title: "Practise problem solving in code",
        description: "Solve coding problems weekly, starting easy; revisit the ones you got wrong.",
        resourceName: "LeetCode",
        resourceUrl: "https://leetcode.com/",
        estimatedHours: 30,
      },
      {
        title: "Build and publish two projects",
        description: "e.g. a quiz app and an expense tracker; put both on GitHub with a clear README.",
        resourceName: "freeCodeCamp",
        resourceUrl: "https://www.freecodecamp.org/learn",
        estimatedHours: 30,
      },
    ],
  },
  {
    slug: "problem-solving",
    label: "Problem Solving",
    description: "Working through unfamiliar problems methodically to a solution.",
    category: "general",
    kind: "transferable",
    isFoundational: true,
    learningSteps: [
      {
        title: "Practise regularly",
        description: "Solve a few logic or case problems every week, starting easy and increasing difficulty.",
        resourceName: "HackerRank",
        resourceUrl: "https://www.hackerrank.com/",
        estimatedHours: 15,
      },
      {
        title: "Explain your approach",
        description: "For each problem, write how you broke it down and what you'd try next if stuck.",
        estimatedHours: 5,
      },
    ],
  },

  // ---------- Data & technology ----------
  {
    slug: "data-analysis",
    label: "Data Analysis",
    description: "Cleaning, exploring and drawing conclusions from data, and presenting them in charts and dashboards.",
    category: "data",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn the analysis workflow",
        description: "Ask → prepare → clean → analyse → share, using spreadsheets and SQL or Python.",
        resourceName: "Google Data Analytics Certificate",
        resourceUrl: "https://grow.google/certificates/data-analytics/",
        estimatedHours: 60,
      },
      {
        title: "Learn basic statistics and dashboards",
        description: "Averages, distributions and correlation; build one dashboard in Power BI or Tableau.",
        resourceName: "Khan Academy — Statistics & probability",
        resourceUrl: "https://www.khanacademy.org/math/statistics-probability",
        estimatedHours: 25,
      },
      {
        title: "Complete a case study",
        description: "Analyse a public dataset end to end and publish your findings as a short report.",
        resourceName: "Kaggle Learn & datasets",
        resourceUrl: "https://www.kaggle.com/learn",
        estimatedHours: 20,
      },
    ],
  },
  {
    slug: "sql",
    label: "SQL",
    description: "Querying and joining data in relational databases.",
    category: "data",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn SQL queries",
        description: "SELECT, WHERE, GROUP BY, JOINs and subqueries through interactive lessons.",
        resourceName: "SQLBolt",
        resourceUrl: "https://sqlbolt.com/",
        estimatedHours: 10,
      },
      {
        title: "Practise on real problems",
        description: "Solve 30+ SQL problems, then answer 5 business questions on a public dataset.",
        resourceName: "HackerRank",
        resourceUrl: "https://www.hackerrank.com/",
        estimatedHours: 15,
      },
    ],
  },
  {
    slug: "python",
    label: "Python",
    description: "Programming in Python for software, automation and data work.",
    category: "technology",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn Python basics",
        description: "Syntax, data types, functions, files and modules.",
        resourceName: "The official Python tutorial",
        resourceUrl: "https://docs.python.org/3/tutorial/",
        estimatedHours: 25,
      },
      {
        title: "Use Python on real tasks",
        description: "Automate a repetitive task and analyse a dataset with pandas; publish both on GitHub.",
        resourceName: "Kaggle Learn (Python, pandas)",
        resourceUrl: "https://www.kaggle.com/learn",
        estimatedHours: 25,
      },
    ],
  },
  {
    slug: "research",
    label: "Research",
    description: "Finding, evaluating and summarising information from surveys, reports and data.",
    category: "data",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn research methodology",
        description: "Framing questions, primary vs secondary research, survey design, sampling and citing sources.",
        resourceName: "NPTEL (IIT courses, free)",
        resourceUrl: "https://nptel.ac.in/",
        estimatedHours: 25,
      },
      {
        title: "Run a mini study",
        description: "Survey 50 people on a question you care about and write a 2-page report with charts and conclusions.",
        estimatedHours: 12,
      },
    ],
  },

  // ---------- Business & finance ----------
  {
    slug: "financial-analysis",
    label: "Financial Analysis",
    description: "Analysing financial statements, ratios and forecasts to support decisions.",
    category: "business-finance",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn financial analysis and modelling",
        description: "Ratio analysis, forecasting, three-statement models and valuation basics (DCF).",
        resourceName: "Corporate Finance Institute (free courses)",
        resourceUrl: "https://corporatefinanceinstitute.com/",
        estimatedHours: 30,
      },
      {
        title: "Analyse a listed company",
        description: "Build a simple model of an NSE/BSE-listed company from its annual report and write a one-page view.",
        estimatedHours: 25,
      },
    ],
  },
  {
    slug: "accounting",
    label: "Accounting",
    description: "Recording transactions and reading financial statements.",
    category: "business-finance",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn accounting fundamentals",
        description: "Double-entry, journals, ledgers, and reading a balance sheet, P&L and cash-flow statement.",
        resourceName: "Khan Academy — Finance & capital markets",
        resourceUrl: "https://www.khanacademy.org/economics-finance-domain/core-finance",
        estimatedHours: 25,
      },
      {
        title: "Analyse real statements",
        description: "Read two companies' annual reports and compare their key ratios.",
        estimatedHours: 10,
      },
    ],
  },
  {
    slug: "business-analysis",
    label: "Business Analysis",
    description: "Understanding business needs, mapping processes and writing clear requirements.",
    category: "business-finance",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn business analysis techniques",
        description: "Stakeholder interviews, process mapping, user stories and acceptance criteria.",
        resourceName: "IIBA (International Institute of Business Analysis)",
        resourceUrl: "https://www.iiba.org/",
        estimatedHours: 20,
      },
      {
        title: "Write a requirements document",
        description: "Interview 3 users of a college process (e.g. fee payment), map it, and write user stories to improve it.",
        estimatedHours: 12,
      },
    ],
  },
  {
    slug: "digital-marketing",
    label: "Digital Marketing",
    description: "SEO, social media, content and paid ads (Google/Meta) to grow a brand online.",
    category: "marketing",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn digital marketing fundamentals",
        description: "SEO, social media, content, email and paid ads, and how to measure results.",
        resourceName: "Google Digital Marketing & E-commerce Certificate",
        resourceUrl: "https://grow.google/certificates/digital-marketing-ecommerce/",
        estimatedHours: 40,
      },
      {
        title: "Get platform certifications",
        description: "Free Google Ads and Meta certifications cover search, display, video and social campaigns.",
        resourceName: "Google Skillshop",
        resourceUrl: "https://skillshop.withgoogle.com/",
        estimatedHours: 15,
      },
      {
        title: "Grow a real page",
        description: "Run a club's or small business's page for two months, including a small ad campaign; report the numbers.",
        estimatedHours: 20,
      },
    ],
  },

  // ---------- People & management ----------
  {
    slug: "teamwork",
    label: "Teamwork",
    description: "Working well with others towards a shared goal.",
    category: "people-management",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Work on team projects",
        description: "Join a hackathon, fest committee or group project and take on a clear role.",
        estimatedHours: 20,
      },
      {
        title: "Practise giving feedback",
        description: "Hold a short retrospective after each project: what went well, what to change.",
        estimatedHours: 3,
      },
    ],
  },
  {
    slug: "recruitment",
    label: "Recruitment",
    description: "Sourcing, screening and interviewing candidates.",
    category: "people-management",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn the hiring process",
        description: "Job descriptions, sourcing on LinkedIn and job portals, screening and structured interviews.",
        resourceName: "SHRM resources",
        resourceUrl: "https://www.shrm.org/",
        estimatedHours: 15,
      },
      {
        title: "Run a mock hiring round",
        description: "Write a job description, screen sample résumés and run two structured mock interviews.",
        estimatedHours: 8,
      },
    ],
  },
  {
    slug: "hr-management",
    label: "HR Management",
    description: "Core HR: onboarding, attendance, payroll inputs, PF/ESI, policies and employee relations.",
    category: "people-management",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn Indian labour basics",
        description: "The labour codes, PF, ESI, gratuity and what they mean for employees and employers.",
        resourceName: "Ministry of Labour & Employment",
        resourceUrl: "https://labour.gov.in/",
        estimatedHours: 15,
      },
      {
        title: "Learn HR processes and tools",
        description: "Onboarding checklists, attendance/leave, payroll inputs, employee queries and an HRMS tool.",
        resourceName: "SWAYAM (free government courses)",
        resourceUrl: "https://swayam.gov.in/",
        estimatedHours: 20,
      },
    ],
  },
  {
    slug: "project-management",
    label: "Project Management",
    description: "Planning tasks, timelines and resources, and tracking a project to completion.",
    category: "people-management",
    kind: "domain",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn project management basics",
        description: "Scope, work breakdown, scheduling, risks, tracking, and Agile/Scrum.",
        resourceName: "Google Project Management Certificate",
        resourceUrl: "https://grow.google/certificates/project-management/",
        estimatedHours: 50,
      },
      {
        title: "Plan and run a real project",
        description: "Use a free tool (Trello, Notion) to plan an event or project end to end, then write a short review.",
        estimatedHours: 15,
      },
      {
        title: "Consider an entry-level certification",
        description: "PMI's CAPM is recognised by employers and suits students.",
        resourceName: "PMI — CAPM certification",
        resourceUrl: "https://www.pmi.org/certifications/certified-associate-capm",
        estimatedHours: 35,
      },
    ],
  },

  // ---------- General / transferable ----------
  {
    slug: "time-management",
    label: "Time Management",
    description: "Planning and prioritising work to meet deadlines reliably.",
    category: "general",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Plan your week",
        description: "Use a weekly plan and a to-do system (e.g. priority matrix); review what slipped every Sunday.",
        estimatedHours: 4,
      },
      {
        title: "Deliver to deadlines",
        description: "Take on a commitment with fixed deadlines (a club role, a freelance task) and track how often you hit them.",
        estimatedHours: 10,
      },
    ],
  },
  {
    slug: "decision-making",
    label: "Decision Making",
    description: "Weighing options and evidence to make sound, timely decisions.",
    category: "general",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn decision frameworks",
        description: "Pros/cons with weights, cost–benefit, and separating reversible from irreversible decisions.",
        estimatedHours: 5,
      },
      {
        title: "Practise and review decisions",
        description: "Keep a decision journal for a month: the options, your reasoning, and how it turned out.",
        estimatedHours: 6,
      },
    ],
  },
  {
    slug: "presentation",
    label: "Presentation",
    description: "Presenting ideas and data clearly to an audience.",
    category: "general",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn to structure a deck",
        description: "One message per slide, a clear storyline, and simple charts.",
        estimatedHours: 5,
      },
      {
        title: "Present often",
        description: "Present in class, at club meetings or record yourself; ask for one piece of feedback each time.",
        resourceName: "Toastmasters International",
        resourceUrl: "https://www.toastmasters.org/",
        estimatedHours: 10,
      },
    ],
  },
  {
    slug: "critical-thinking",
    label: "Critical Thinking",
    description: "Questioning assumptions and judging the quality of evidence and arguments.",
    category: "general",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Learn to evaluate arguments",
        description: "Spot assumptions, logical fallacies and weak evidence in news articles and reports.",
        estimatedHours: 8,
      },
      {
        title: "Practise weekly",
        description: "Each week, critique one business or news claim in a short written note: what's the evidence, what's missing?",
        estimatedHours: 8,
      },
    ],
  },
  {
    slug: "adaptability",
    label: "Adaptability",
    description: "Adjusting quickly to new tools, people, priorities and situations.",
    category: "general",
    kind: "transferable",
    isFoundational: false,
    learningSteps: [
      {
        title: "Step outside your comfort zone",
        description: "Take on a role or project in an unfamiliar area (a new tool, team or domain) for a month.",
        estimatedHours: 15,
      },
      {
        title: "Learn something new quickly",
        description: "Pick a new tool, learn it in two weeks and use it on a real task; note what helped you learn fast.",
        estimatedHours: 10,
      },
    ],
  },
];
