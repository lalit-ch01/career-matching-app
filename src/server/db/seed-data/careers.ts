import type {
  CareerEnvironment,
  CareerPriority,
  DegreeFit,
  Relevance,
  SkillImportance,
  WorkStyle,
  WorkType,
} from "../../../lib/taxonomy";
import { interestSeeds } from "./interests";
import { skillSeeds } from "./skills";

export interface CareerSeed {
  slug: string;
  title: string;
  summary: string;
  description: string;
  responsibilities: string[];
  educationSummary: string;
  workStyle: WorkStyle;
  workEnvironment: CareerEnvironment;
  firstSteps: string[];
  degrees: Partial<Record<string, DegreeFit>>;
  /** skill slug -> importance (3 = core, 2 = supporting) */
  skills: Record<string, SkillImportance>;
  interests: Record<string, Relevance>;
  workTypes: Partial<Record<WorkType, Relevance>>;
  /** What this career typically offers (compared with student priorities). */
  priorities: CareerPriority[];
}

// ---------------------------------------------------------------------------
// Skill and interest mappings are written with the display names from the
// team's agreed lists, so this file can be checked line by line against them.
// Unknown names fail immediately, so a typo can never reach the database.
// ---------------------------------------------------------------------------

/** Skill names -> { slug: importance }. Domain skills are core (3), transferable skills supporting (2). */
function skillsFor(...names: string[]): Record<string, SkillImportance> {
  const result: Record<string, SkillImportance> = {};
  for (const name of names) {
    const skill = skillSeeds.find((s) => s.label === name);
    if (!skill) throw new Error(`Unknown skill "${name}" in career seed data.`);
    if (result[skill.slug]) throw new Error(`Skill "${name}" is listed twice for one career.`);
    result[skill.slug] = skill.kind === "domain" ? 3 : 2;
  }
  return result;
}

/** First interest = the career's main (primary) area; any others are related (secondary). */
function interestsFor(primary: string, ...related: string[]): Record<string, Relevance> {
  const slugOf = (name: string) => {
    const interest = interestSeeds.find((i) => i.label === name);
    if (!interest) throw new Error(`Unknown interest "${name}" in career seed data.`);
    return interest.slug;
  };
  return Object.fromEntries([
    [slugOf(primary), "primary"],
    ...related.map((name) => [slugOf(name), "secondary"]),
  ]);
}

/**
 * Careers whose skill mapping was drafted rather than taken from the team's
 * list. The seed script prints a reminder until this list is empty.
 * All 14 mappings are currently confirmed by the team.
 */
export const DRAFTED_SKILL_MAPPINGS: string[] = [];

// The team's 14 career roles. Roles, career → skill mappings and career →
// interest mappings follow the team's agreed lists exactly.
// Descriptions, degrees, work style and priorities are editorial judgements
// based on typical Indian entry-level job descriptions — data, not code, so
// they can be refined without touching the matching engine.
export const careerSeeds: CareerSeed[] = [
  {
    slug: "data-analyst",
    title: "Data Analyst",
    summary: "Turns raw data into insights that help businesses make decisions.",
    description:
      "Data analysts collect, clean and analyse data to answer business questions — why sales dropped, which customers churn, " +
      "which campaign worked. They build reports and dashboards and explain findings to non-technical teams. The role exists in " +
      "almost every industry, from e-commerce and banking to healthcare, and is a common entry point into data careers.",
    responsibilities: [
      "Clean and prepare data from spreadsheets and databases",
      "Write SQL queries to answer business questions",
      "Build dashboards and regular reports",
      "Present findings and recommendations to managers",
    ],
    educationSummary:
      "Open to most graduates. Science, engineering, computer applications, statistics and economics backgrounds are preferred; commerce and management graduates with strong Excel/SQL skills are also hired.",
    workStyle: "independent",
    workEnvironment: "balanced",
    firstSteps: [
      "Publish 2–3 analysis case studies (e.g. on Kaggle or GitHub)",
      "Build one Power BI or Tableau dashboard you can demo in interviews",
      "Consider a recognised certificate such as Google Data Analytics",
    ],
    degrees: {
      bsc: "preferred",
      btech: "preferred",
      bca: "preferred",
      msc: "preferred",
      mca: "preferred",
      bcom: "accepted",
      bba: "accepted",
      mba: "accepted",
      ba: "accepted",
      mcom: "accepted",
      ma: "accepted",
    },
    skills: skillsFor("Excel", "Data Analysis", "SQL", "Analytical Thinking", "Problem Solving"),
    interests: interestsFor("Technology & Data"),
    workTypes: { analytical: "primary", technical: "secondary" },
    priorities: ["fast-growth", "work-life-balance"],
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    summary: "Bridges business needs and technology or operations teams to improve processes and products.",
    description:
      "Business analysts figure out what a business or its users actually need, then translate that into clear requirements for " +
      "technology or operations teams. They interview stakeholders, map processes, analyse data and check that the solution " +
      "delivered solves the original problem. The role is common in IT services, consulting, banking and product companies.",
    responsibilities: [
      "Gather and document requirements from stakeholders",
      "Map current processes and propose improvements",
      "Analyse data to support recommendations",
      "Present findings and work with delivery teams on solutions",
    ],
    educationSummary:
      "Often an MBA, BTech or BBA; commerce, science and computer-applications graduates with analytical skills are also hired.",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    firstSteps: [
      "Write a requirements document for a real process you know",
      "Learn a diagramming tool for process maps and basic SQL",
      "Look at IIBA's entry certificate (ECBA) once you have the basics",
    ],
    degrees: {
      mba: "preferred",
      btech: "preferred",
      bba: "preferred",
      bcom: "accepted",
      bsc: "accepted",
      bca: "accepted",
      mca: "accepted",
      msc: "accepted",
      mcom: "accepted",
    },
    skills: skillsFor("Analytical Thinking", "Excel", "Business Analysis", "Problem Solving", "Communication", "Presentation"),
    interests: interestsFor("Business & Management", "Consulting"),
    workTypes: { analytical: "primary", "management-oriented": "secondary" },
    priorities: ["high-salary", "fast-growth"],
  },
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    summary: "Analyses financial data to guide budgeting, investment and business decisions.",
    description:
      "Financial analysts study a company's numbers — revenue, costs, cash flow — to forecast performance and support decisions " +
      "on budgets, investments and pricing. They work in corporate finance teams, banks, investment firms and consultancies, " +
      "building models in Excel and presenting their conclusions to management.",
    responsibilities: [
      "Build and maintain financial models and forecasts",
      "Analyse financial statements and performance",
      "Prepare budgets, variance reports and presentations",
      "Research companies, industries and investment options",
    ],
    educationSummary:
      "Typically BCom, MCom, BBA or an MBA in Finance; CA/CFA/CMA progress is a strong plus. Engineering and economics graduates with finance skills are also hired.",
    workStyle: "independent",
    workEnvironment: "structured",
    firstSteps: [
      "Build a financial model of a listed Indian company",
      "Consider starting CFA Level 1 or an NISM certification",
      "Follow business news daily and practise explaining one story a week",
    ],
    degrees: {
      bcom: "preferred",
      mcom: "preferred",
      mba: "preferred",
      bba: "preferred",
      bsc: "accepted",
      btech: "accepted",
      ba: "accepted",
      msc: "accepted",
      ma: "accepted",
    },
    skills: skillsFor("Excel", "Financial Analysis", "Accounting", "Analytical Thinking", "Data Analysis", "Critical Thinking"),
    interests: interestsFor("Finance"),
    workTypes: { analytical: "primary" },
    priorities: ["high-salary", "job-stability", "fast-growth"],
  },
  {
    slug: "hr-executive",
    title: "HR Executive",
    summary: "Handles hiring, onboarding and day-to-day HR operations for employees.",
    description:
      "HR executives are the first point of contact for employees. They coordinate hiring, onboard new joiners, maintain " +
      "employee records, handle attendance and leave, support payroll and statutory compliance (PF, ESI), and help run " +
      "engagement activities. It is a broad, people-facing role that rewards organisation, empathy and clear communication.",
    responsibilities: [
      "Coordinate recruitment and onboard new employees",
      "Maintain employee records, attendance and leave",
      "Support payroll inputs and statutory compliance",
      "Answer employee queries and run HR policies and events",
    ],
    educationSummary:
      "Typically BBA, BA (Psychology or similar) or an MBA/PGDM in HR; BCom and MCom graduates are also common.",
    workStyle: "team",
    workEnvironment: "structured",
    firstSteps: [
      "Do an HR internship to see recruitment and onboarding first-hand",
      "Learn one HRMS tool and the basics of Indian labour law",
      "Build your LinkedIn profile — HR roles are often filled through it",
    ],
    degrees: { bba: "preferred", mba: "preferred", ba: "preferred", ma: "preferred", bcom: "accepted", mcom: "accepted", bsc: "accepted" },
    skills: skillsFor("Communication", "Recruitment", "HR Management", "Teamwork", "Adaptability"),
    interests: interestsFor("HR & People"),
    workTypes: { "people-oriented": "primary", "management-oriented": "secondary" },
    priorities: ["job-stability", "work-life-balance", "social-impact"],
  },
  {
    slug: "hr-recruiter",
    title: "HR Recruiter",
    summary: "Finds, screens and hires candidates for open roles.",
    description:
      "HR recruiters fill open positions. They write job posts, search job portals and LinkedIn for candidates, screen résumés, " +
      "conduct first-round interviews, coordinate with hiring managers and guide candidates through offers and joining. Many " +
      "start at recruitment agencies or in-house talent teams; it is fast-paced, target-driven and very people-facing.",
    responsibilities: [
      "Source candidates on job portals, LinkedIn and referrals",
      "Screen résumés and run first-round interviews",
      "Coordinate interviews with hiring managers",
      "Pitch roles, manage offers and follow up until joining",
    ],
    educationSummary: "Any graduate can start; BBA, BA and MBA (HR) are most common. Communication skills matter more than the degree.",
    workStyle: "team",
    workEnvironment: "dynamic",
    firstSteps: [
      "Intern with a recruitment agency or a company's hiring team",
      "Practise screening and structured interviewing",
      "Build a strong LinkedIn presence — it is your main tool",
    ],
    degrees: { bba: "preferred", mba: "preferred", ba: "preferred", ma: "preferred", bcom: "accepted", mcom: "accepted", bsc: "accepted", btech: "accepted", bca: "accepted" },
    skills: skillsFor("Communication", "Recruitment", "Presentation", "Teamwork", "Adaptability"),
    interests: interestsFor("HR & People"),
    workTypes: { "people-oriented": "primary" },
    priorities: ["fast-growth", "social-impact"],
  },
  {
    slug: "marketing-executive",
    title: "Marketing Executive",
    summary: "Plans and runs campaigns that build a brand and bring in customers.",
    description:
      "Marketing executives help plan and deliver campaigns across channels — events, print, digital and partnerships. They " +
      "work with agencies and sales teams, create campaign material, run social media and track results. It is a creative, " +
      "people-facing role in FMCG, retail, education, tech and many other sectors.",
    responsibilities: [
      "Plan and execute marketing campaigns",
      "Create or brief campaign content and material",
      "Coordinate with sales teams, agencies and vendors",
      "Track campaign results and report on them",
    ],
    educationSummary: "Typically BBA/BMS, BA or an MBA in Marketing; graduates from any stream with a strong portfolio can enter.",
    workStyle: "team",
    workEnvironment: "dynamic",
    firstSteps: [
      "Run marketing for a college fest or club and document the results",
      "Build a small portfolio of campaigns or content",
      "Apply for marketing internships at startups or agencies",
    ],
    degrees: { bba: "preferred", mba: "preferred", ba: "preferred", ma: "preferred", bcom: "accepted", bsc: "accepted", btech: "accepted", mcom: "accepted", bca: "accepted" },
    skills: skillsFor("Communication", "Creativity", "Digital Marketing", "Presentation", "Teamwork"),
    interests: interestsFor("Marketing"),
    workTypes: { creative: "primary", "people-oriented": "secondary" },
    priorities: ["creativity", "fast-growth"],
  },
  {
    slug: "digital-marketing-executive",
    title: "Digital Marketing Executive",
    summary: "Grows a brand online through SEO, social media, content and paid ads.",
    description:
      "Digital marketing executives attract and convert customers online. They plan content, optimise websites for search, " +
      "run social media and paid ad campaigns on Google and Meta, and measure what works using analytics. It is a fast-moving, " +
      "creative and data-driven field with many openings at startups, agencies and D2C brands — and for freelancing.",
    responsibilities: [
      "Plan and publish content for social media and websites",
      "Improve search rankings (SEO)",
      "Run and optimise paid campaigns on Google and Meta",
      "Track performance with analytics and report results",
    ],
    educationSummary:
      "Any graduate can enter; BBA, BA and MBA (Marketing) are most common. Certifications and a portfolio of real results matter more than the degree.",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    firstSteps: [
      "Grow a real page or blog and document the numbers",
      "Earn free Google Ads and Meta certifications",
      "Offer to run digital marketing for a small local business",
    ],
    degrees: { bba: "preferred", mba: "preferred", ba: "preferred", ma: "preferred", bcom: "accepted", bsc: "accepted", btech: "accepted", bca: "accepted", mcom: "accepted" },
    skills: skillsFor("Digital Marketing", "Creativity", "Communication", "Analytical Thinking", "Adaptability"),
    interests: interestsFor("Marketing"),
    workTypes: { creative: "primary", analytical: "secondary", technical: "secondary" },
    priorities: ["creativity", "fast-growth", "work-life-balance"],
  },
  {
    slug: "operations-executive",
    title: "Operations Executive",
    summary: "Keeps day-to-day business processes running smoothly and on time.",
    description:
      "Operations executives make sure the everyday work of a business gets done — orders processed, stock tracked, vendors " +
      "followed up, deliveries on time. They solve problems as they come up, track performance in MIS reports and suggest " +
      "process improvements. It is a common graduate entry role in logistics, e-commerce, retail, banking and services, and " +
      "leads to operations management.",
    responsibilities: [
      "Coordinate daily operations and resolve issues quickly",
      "Track orders, inventory, vendors and deliveries",
      "Prepare MIS reports on performance",
      "Suggest and implement process improvements",
    ],
    educationSummary: "Often BBA, BCom or BTech, or an MBA (Operations); graduates from most streams are hired as executives.",
    workStyle: "team",
    workEnvironment: "structured",
    firstSteps: [
      "Intern in operations at a logistics, retail or e-commerce company",
      "Learn Excel reporting (MIS) and basic process-improvement methods",
      "Take on responsibility for running something end to end",
    ],
    degrees: { bba: "preferred", mba: "preferred", btech: "preferred", bcom: "preferred", bsc: "accepted", ba: "accepted", mcom: "accepted", bca: "accepted" },
    skills: skillsFor("Problem Solving", "Teamwork", "Time Management", "Decision Making", "Communication"),
    interests: interestsFor("Operations"),
    workTypes: { "management-oriented": "primary", analytical: "secondary" },
    priorities: ["job-stability", "leadership-role"],
  },
  {
    slug: "project-coordinator",
    title: "Project Coordinator",
    summary: "Keeps projects on track by organising tasks, schedules, people and updates.",
    description:
      "Project coordinators support project managers in delivering projects on time. They maintain plans and trackers, " +
      "schedule meetings, follow up on tasks, keep documentation up to date and send status updates to stakeholders. It is " +
      "the usual entry point into project management in IT, construction, consulting and operations.",
    responsibilities: [
      "Maintain project plans, trackers and documentation",
      "Schedule meetings and follow up on action items",
      "Track progress, risks and deadlines",
      "Send status updates to the team and stakeholders",
    ],
    educationSummary: "Often BTech, BBA or an MBA; graduates from most streams can start as coordinators and grow into project managers.",
    workStyle: "team",
    workEnvironment: "dynamic",
    firstSteps: [
      "Coordinate a college event or team project with a written plan",
      "Learn a tracking tool such as Trello, Jira or Notion",
      "Consider the CAPM certification or the Google Project Management certificate",
    ],
    degrees: { btech: "preferred", bba: "preferred", mba: "preferred", bcom: "accepted", bsc: "accepted", bca: "accepted", mca: "accepted", msc: "accepted", ba: "accepted" },
    skills: skillsFor("Project Management", "Communication", "Teamwork", "Time Management", "Problem Solving"),
    interests: interestsFor("Operations", "Business & Management"),
    workTypes: { "management-oriented": "primary", "people-oriented": "secondary" },
    priorities: ["fast-growth", "leadership-role"],
  },
  {
    slug: "research-analyst",
    title: "Research Analyst",
    summary: "Researches markets, companies or policies and turns findings into clear reports.",
    description:
      "Research analysts gather and analyse information — from surveys, industry reports, financial data or interviews — and " +
      "turn it into reports and recommendations. They work in market-research firms, consulting, equity research, think " +
      "tanks and corporate strategy teams. The role suits curious, careful people who enjoy digging into questions.",
    responsibilities: [
      "Design and run primary and secondary research",
      "Analyse data from surveys, reports and databases",
      "Write reports and summaries with clear conclusions",
      "Present insights to clients or internal teams",
    ],
    educationSummary: "Often BA/MA (Economics), BSc/MSc, BCom or an MBA; strong writing and analysis matter more than the specific degree.",
    workStyle: "independent",
    workEnvironment: "structured",
    firstSteps: [
      "Publish a short research report on a topic you care about",
      "Learn survey tools and basic data analysis in Excel",
      "Apply for internships at market-research or consulting firms",
    ],
    degrees: { ba: "preferred", ma: "preferred", bsc: "preferred", msc: "preferred", mba: "preferred", bcom: "accepted", mcom: "accepted", bba: "accepted", btech: "accepted" },
    skills: skillsFor("Research", "Analytical Thinking", "Data Analysis", "Critical Thinking", "Communication"),
    interests: interestsFor("Research"),
    workTypes: { analytical: "primary" },
    priorities: ["work-life-balance", "job-stability"],
  },
  {
    slug: "management-trainee",
    title: "Management Trainee",
    summary: "Rotates across business functions in a structured programme to become a future manager.",
    description:
      "Management trainees join structured graduate programmes — common in FMCG, banking, manufacturing and conglomerates — " +
      "and rotate through departments such as sales, operations, finance and HR before taking a permanent role. They take on " +
      "real responsibility early and are assessed on leadership, decisions and results.",
    responsibilities: [
      "Rotate through business functions on real assignments",
      "Lead small teams or projects during rotations",
      "Analyse problems and present recommendations to leaders",
      "Learn how the business makes decisions and money",
    ],
    educationSummary: "Mostly MBA/PGDM graduates; some programmes hire BBA, BCom and BTech graduates directly.",
    workStyle: "team",
    workEnvironment: "dynamic",
    firstSteps: [
      "Take leadership roles in college clubs, fests or projects",
      "Prepare for group discussions and case interviews",
      "Research which companies run management trainee programmes",
    ],
    degrees: { mba: "preferred", bba: "preferred", btech: "accepted", bcom: "accepted", mcom: "accepted", ba: "accepted", bsc: "accepted" },
    skills: skillsFor("Communication", "Leadership", "Problem Solving", "Teamwork", "Adaptability", "Presentation"),
    interests: interestsFor("Business & Management"),
    workTypes: { "management-oriented": "primary", "people-oriented": "secondary" },
    priorities: ["leadership-role", "fast-growth", "high-salary"],
  },
  {
    slug: "software-developer",
    title: "Software Developer",
    summary: "Designs, builds and maintains software applications and systems.",
    description:
      "Software developers turn requirements into working software — web and mobile apps, backend services and internal tools. " +
      "Entry-level developers in India typically join IT services companies, product companies or startups, where they write " +
      "code, fix bugs, review each other's work and learn the team's systems. Strong fundamentals in programming and problem " +
      "solving matter more than any particular language.",
    responsibilities: [
      "Write, test and debug code for new features",
      "Work with databases and APIs",
      "Review teammates' code and fix bugs",
      "Maintain and improve existing systems",
    ],
    educationSummary:
      "Usually BTech/BE, BCA or MCA; BSc/MSc (Computer Science or IT) graduates are also hired, especially with a strong project portfolio.",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    firstSteps: [
      "Keep 2–3 solid projects on GitHub with clear READMEs",
      "Practise coding-interview problems weekly",
      "Apply for internships through your college placement cell, Internshala or LinkedIn",
    ],
    degrees: { btech: "preferred", bca: "preferred", mca: "preferred", bsc: "accepted", msc: "accepted" },
    skills: skillsFor("Programming", "Problem Solving", "Python", "SQL", "Critical Thinking", "Adaptability"),
    interests: interestsFor("Technology & Data"),
    workTypes: { technical: "primary", analytical: "secondary" },
    priorities: ["high-salary", "fast-growth"],
  },
  {
    slug: "business-development-executive",
    title: "Business Development Executive",
    summary: "Finds new clients, partners and opportunities to grow the business.",
    description:
      "Business development executives generate growth. They research markets and prospects, reach out to potential clients " +
      "or partners, pitch the company's offering, and follow deals through to closing. The role is target-driven and common in " +
      "startups, SaaS, edtech, financial services and B2B companies — and good preparation for starting your own venture.",
    responsibilities: [
      "Research markets and identify potential clients or partners",
      "Reach out, pitch and run meetings",
      "Prepare proposals and negotiate terms",
      "Track leads and deals and hit targets",
    ],
    educationSummary: "Any graduate can start; BBA, BCom and MBA (Marketing/Sales) are most common.",
    workStyle: "mixed",
    workEnvironment: "dynamic",
    firstSteps: [
      "Get sponsorships for a college event — it is real business development",
      "Practise pitching a product in 60 seconds",
      "Apply for sales or BD internships at startups",
    ],
    degrees: { bba: "preferred", mba: "preferred", bcom: "preferred", ba: "accepted", bsc: "accepted", btech: "accepted", mcom: "accepted", bca: "accepted" },
    skills: skillsFor("Communication", "Presentation", "Problem Solving", "Adaptability", "Teamwork"),
    interests: interestsFor("Business & Management", "Entrepreneurship"),
    workTypes: { "people-oriented": "primary", "management-oriented": "secondary" },
    priorities: ["high-salary", "fast-growth"],
  },
  {
    slug: "talent-acquisition-specialist",
    title: "Talent Acquisition Specialist",
    summary: "Plans and runs hiring strategy to attract the right people to an organisation.",
    description:
      "Talent acquisition specialists go beyond filling individual vacancies. They plan hiring with business leaders, " +
      "research where to find scarce talent, build the employer brand, manage campus and lateral hiring, and use hiring data " +
      "to improve quality and speed. It is often the next step for experienced recruiters and HR graduates.",
    responsibilities: [
      "Plan hiring needs with business leaders",
      "Research talent markets and sourcing channels",
      "Run campus and lateral hiring drives",
      "Improve the hiring process and employer brand using data",
    ],
    educationSummary: "Typically an MBA/PGDM in HR, BBA or BA; recruiters from any background often move into the role.",
    workStyle: "mixed",
    workEnvironment: "structured",
    firstSteps: [
      "Start as an HR recruiter or HR intern to learn hiring hands-on",
      "Learn LinkedIn Recruiter-style sourcing and Boolean search",
      "Track hiring metrics (time-to-hire, source of hire) on a mock drive",
    ],
    degrees: { mba: "preferred", bba: "preferred", ba: "preferred", ma: "preferred", bcom: "accepted", mcom: "accepted", bsc: "accepted", btech: "accepted" },
    skills: skillsFor("Recruitment", "Communication", "HR Management", "Teamwork", "Presentation", "Adaptability"),
    interests: interestsFor("HR & People"),
    workTypes: { "people-oriented": "primary", analytical: "secondary" },
    priorities: ["job-stability", "fast-growth", "work-life-balance"],
  },
];
