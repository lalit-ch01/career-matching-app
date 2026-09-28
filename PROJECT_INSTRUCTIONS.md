# PROJECT_INSTRUCTIONS.md

> This file is the primary context/instruction document for Claude Code while developing this project.
> Read this file fully before making any changes. Follow the development approach in Section 10 — build incrementally, one module at a time, and do not generate the entire application in one step.

---

## 1. Project Overview

**Title:** From Degree to Career: An Explainable Skill & Interest Matching Approach for Indian Gen Z

**Purpose:**
Indian Gen Z students frequently struggle to translate their academic background, skills, and interests into clear, realistic career paths. This project builds a web application that analyzes a student's profile (education, skills, interests, work preferences) and matches them against a structured career database, producing explainable career recommendations with a match percentage, skill gap analysis, and a personalized learning path.

**Target Users:**
Indian college students / recent graduates (Gen Z) exploring career options.

**Problem Statement:**
Students often choose careers based on peer pressure, family expectations, or incomplete information, rather than a structured understanding of how their skills and interests align with real career paths. There is a lack of accessible, explainable tools that connect a student's profile to concrete, actionable career guidance.

**Proposed Solution:**
An explainable, rule-based weighted matching system that:
- Collects a student's profile and assessment responses
- Compares them against a structured career database
- Produces ranked career matches with a transparent match percentage
- Shows skill gaps and a personalized learning path for each matched career

**Key Objectives:**
- Build a working, explainable, demonstrable prototype
- Make the matching logic transparent enough to explain to judges
- Keep the system mobile responsive and usable end-to-end
- Show the complete student journey from profile to learning path

---

## 2. Current Project Status

- A **Google Form** has already been created and is being used for **research/data collection only**.
- The **final product is a separate working web application** — the Google Form is not the product.
- **Figma will NOT be used** for design. UI/UX decisions happen directly in code.
- Development happens **directly in VS Code using Claude Code**.
- The full prototype is built (Next.js app, database schema, seed data, matching engine, all pages, tests). The remaining step is connecting a real Supabase project — see `NEXT_PHASE.md`.

---

## 3. Technology Stack

Use this stack. Do not introduce additional technologies/frameworks unless there is a clear, specific reason — ask before adding anything not listed here.

- **Frontend + backend:** Next.js (App Router, React, TypeScript). Next.js is the whole backend: Server Components read data, Server Actions handle mutations, Route Handlers serve `/api/*`.
- **Database:** Supabase **Postgres only**, accessed from the Next.js server with Drizzle ORM over a direct Postgres connection. Do **not** use Supabase Auth, Edge Functions, Storage, Realtime or `supabase-js`.
- **Styling:** Tailwind CSS
- **Data:** Skills data / Career Database (stored in Supabase)
- **APIs/plugins:** Only when genuinely useful — avoid adding integrations "just in case"
- **AI/ML:** Used where it genuinely improves matching or explanation, not for its own sake

---

## 4. Core User Flow

```
Student
  → Home Page
  → Student Profile
  → Career Assessment
  → Submit
  → Profile Analysis
  → Career Matching
  → Match Percentage
  → Career Details
  → Skill Gap
  → Personalized Learning Path
```

---

## 5. Career Database

The career database follows the team's agreed taxonomy (24 skills, 9 interests, 14 career roles, and career → skill / career → interest mappings), stored in `src/server/db/seed-data/`:

1. Data Analyst
2. Business Analyst
3. Financial Analyst
4. HR Executive
5. HR Recruiter
6. Marketing Executive
7. Digital Marketing Executive
8. Operations Executive
9. Project Coordinator
10. Research Analyst
11. Management Trainee
12. Software Developer
13. Business Development Executive
14. Talent Acquisition Specialist

Run `npm run db:seed -- --check` to validate the data before seeding (blocking problems + warnings that need a team decision).

Each career record should support:
- Career name
- Education/background required
- Required skills
- Relevant interests
- Work style / preferences
- Career description
- Learning path (for skill gaps)

---

## 6. Matching System

Build an **explainable** matching approach — not a black-box model.

Factors to consider:
- Education compatibility
- Skills overlap
- Interests overlap
- Work preferences
- Career preferences

**Output:** A calculated **Match %** per career, with a clear, auditable breakdown of how it was derived (e.g., weighted scoring across the factors above).

**Important:** If the initial prototype uses a rule-based or weighted algorithm (not a trained ML model), do not describe it as "advanced AI." Describe it accurately so it can be defended in front of Avishkar judges.

---

## 7. Result Page

Show multiple ranked career matches, e.g.:

```
Data Analyst — 84% Match
Research Analyst — 78% Match
Business Analyst — 75% Match
```

When a student selects a specific career, show:
- Why the career matched (factor-level explanation)
- Matching skills
- Missing/required skills
- Skill gap summary
- Learning path
- Career description

---

## 8. Supabase — Database Structure

Design a clean schema. Suggested tables (adjust as needed, but avoid unnecessary tables):

- `careers` — career records (name, education, description, work style)
- `skills` — master list of skills
- `career_skills` — many-to-many: career ↔ required skills (with importance/weight if useful)
- `interests` — master list of interests
- `career_interests` — many-to-many: career ↔ relevant interests
- `student_profiles` — student profile data
- `assessment_responses` — raw responses from the in-app assessment
- `match_results` — (optional) stored match results per student, if persistence is needed

Implemented schema: see `src/server/db/schema.ts` and `docs/ARCHITECTURE.md` (adds `degrees`, `career_degrees`, `career_work_types`, `career_priorities` and `skill_learning_steps`, which the matching model needs).

Keep secrets in server-side environment variables (`DATABASE_URL`, `SESSION_SECRET`). The browser never talks to Supabase directly: no Supabase keys are used in the frontend at all. Row Level Security is enabled on every table with no policies, and the `anon`/`authenticated` roles have their table privileges revoked, so Supabase's auto-generated public API exposes nothing.

---

## 9. Google Form

- The existing Google Form remains useful for ongoing research/data collection — it is not being replaced.
- The web application must have its **own in-app assessment interface** so students never need to use the Google Form to use the actual product.
- If importing existing Google Form responses into Supabase would be useful (e.g., as seed/training data), propose a practical approach when relevant — but this is **not a blocker** for the initial working prototype.

---

## 10. Development Approach

**Do NOT generate the entire application in one step.**

**First:**
1. Inspect the current project structure (what already exists, if anything).
2. Identify what's already in place.
3. Propose a development plan.
4. Ask for confirmation only when a decision genuinely needs my input (e.g., irreversible choices, costs, naming). Otherwise, make sensible decisions and proceed.

**Then build one module at a time**, in this order:

1. Project setup
2. React frontend scaffold
3. Basic UI/navigation
4. Supabase setup
5. Database schema
6. Career Database (seed data)
7. Assessment module
8. Matching algorithm
9. Results page
10. Career details page
11. Skill gap view
12. Learning path view
13. Testing
14. UI/UX improvements
15. Final demo preparation

---

## 11. Code Quality

- Keep code clean and modular.
- Use reusable React components.
- Use meaningful file and variable names.
- Avoid unnecessary complexity.
- Add comments where they aid understanding (not excessive).
- Validate user inputs.
- Handle errors properly (no silent failures).
- Keep the application responsive across mobile and laptop screens.
- Don't hardcode data that belongs in Supabase.
- Keep all secrets/API keys in environment variables.
- Never expose database credentials or any Supabase key in frontend code (nothing is prefixed `NEXT_PUBLIC_`).

---

## 12. Beginner-Friendly Explanations

I am learning while building this project. Whenever an important technical change is made, briefly explain:
- What changed
- Why it changed
- Which files were affected
- How to test it

Keep explanations concise — don't overwhelm with unnecessary detail.

---

## 13. Avishkar Competition Requirements

The system must be:
- Working
- Explainable
- Demonstrable
- Mobile responsive
- Grounded in a clear research problem
- Able to show the complete student journey end-to-end

When we reach the relevant stage, also help prepare:
- System architecture (diagram/description)
- Database architecture
- Matching methodology (write-up)
- Research methodology
- Future scope
- Demo flow/script

---

## 14. Development Priority Rule

Before implementing any feature, check whether it's actually necessary for the current prototype.

**Priority order:**
```
FUNCTIONALITY → CORRECTNESS → EXPLAINABILITY → UI POLISH
```

Do not spend significant time on visual design before the core matching system works end-to-end.

---

## 15. Final Goal — Definition of Done

A student should be able to:
1. Open the website
2. Create/enter their profile
3. Complete the career assessment
4. Submit their responses
5. Have the system analyze their skills/interests/preferences
6. Compare their profile against the Career Database
7. Receive multiple career matches with Match %
8. Open a specific career
9. See matching skills
10. See skill gaps
11. Receive a personalized learning path

---

## Working Agreement for Claude Code

- Always re-read this file at the start of a new session if unsure of project context.
- Confirm before making destructive changes (deleting data, major refactors, irreversible Supabase schema changes).
- Otherwise, proceed autonomously through the module order in Section 10.
- After each module, summarize per Section 12's format.
