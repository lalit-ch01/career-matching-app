# NEXT_PHASE.md

Planning document only — nothing in this file has been implemented yet.
Follow it step by step in future Claude Code sessions. See `PROJECT_INSTRUCTIONS.md`
for full project context and rules.

---

## 1. Current Project Status

- Foundation stage is complete: React (Vite) frontend runs, folder structure is in place.
- No database, career data, assessment, matching logic, or results page exists yet.
- Google Form (research/data collection) is separate and unaffected.

## 2. Work Completed in the Foundation Stage

- `frontend/` set up with Vite + React (`index.html`, `main.jsx`, `App.jsx`, `index.css`)
- Folder structure: `components/`, `pages/`, `hooks/`, `services/`, `data/`, `public/`
- `Home.jsx` placeholder page (confirms the app runs)
- `services/supabaseClient.js` — placeholder, reads env vars, not connected to a real project
- `services/matchingService.js` — placeholder function signature only
- `.env.example`, `.env` (blank), `.gitignore`, root `README.md`, root `package.json`

## 3. Objective of the Next Development Phase

Turn the foundation into a working prototype: real data, a real assessment,
a real (explainable) matching algorithm, and pages that show results.

---

## 4. Supabase Setup

**What:** Create the Supabase project, connect it to the app.
**Why:** Everything from here on (careers, skills, profiles, responses) needs a database.
**Files affected:** `.env` (add real URL/anon key), `frontend/src/services/supabaseClient.js` (remove placeholder warning once connected)
**Dependencies:** A free Supabase account/project (created manually by the project owner — never share the service-role key)
**How to test:** `supabase.auth.getSession()` or a trivial `select` call resolves without error in the browser console
**Expected output:** `supabaseClient.js` returns a working client, no console warning
**Before moving on:** Confirm the app can read/write at least one test row

## 5. Proposed Database Schema

**What:** Create tables: `careers`, `skills`, `career_skills`, `interests`, `career_interests`, `student_profiles`, `assessment_responses`, (optional) `match_results`.
**Why:** Structured storage for everything the matching system needs.
**Files affected:** New `supabase/migrations/` SQL files
**Dependencies:** Supabase project must exist (Step 4)
**How to test:** Tables visible in the Supabase dashboard; simple insert/select works
**Expected output:** Schema matches `PROJECT_INSTRUCTIONS.md` Section 8
**Before moving on:** All tables created with correct relationships (foreign keys)

## 6. Career Database

**What:** Seed the 10 example careers (name, education, required skills, interests, work style, description, learning path) into `careers` + related tables.
**Why:** The matching system needs real data to compare against.
**Files affected:** `supabase/seed.sql` or a one-time seed script; `frontend/src/data/` (if kept as a local fallback/reference copy)
**Dependencies:** Schema (Step 5) must exist
**How to test:** Query `careers` table and confirm 10 rows with correct related skills/interests
**Expected output:** Career database fully seeded
**Before moving on:** Every career has at least education, skills, interests, work style, description filled in

## 7. Skill Database

**What:** Master list of skills referenced by `career_skills` (and later by student profiles).
**Why:** Consistent skill names are required for matching and skill-gap comparison.
**Files affected:** `supabase/seed.sql`, `career_skills` rows
**Dependencies:** Step 5
**How to test:** Each career's required skills resolve to real rows in `skills`
**Before moving on:** No orphaned skill references

## 8. Assessment Questions

**What:** Design the in-app assessment (questions covering education, skills, interests, work style/preferences) to replace reliance on the Google Form for actual product use.
**Why:** The product needs its own assessment interface (Section 9 of `PROJECT_INSTRUCTIONS.md`).
**Files affected:** New `frontend/src/pages/Assessment.jsx`, question definitions in `frontend/src/data/`
**Dependencies:** None (can be built in parallel with Supabase work)
**How to test:** Manually complete the assessment in the browser, confirm answers are captured in component state
**Before moving on:** All planned question categories are covered

## 9. User Profile Data Structure

**What:** Define the shape of a student profile / assessment response object (matches `student_profiles` and `assessment_responses` tables).
**Why:** Matching algorithm and Supabase writes both depend on a consistent shape.
**Files affected:** `frontend/src/data/` (shared shape/types), `frontend/src/services/` (save logic)
**Dependencies:** Steps 6–8
**How to test:** Submitting the assessment writes a correctly-shaped row to Supabase
**Before moving on:** Profile data round-trips correctly (write, then read back)

## 10. Matching Algorithm

**What:** Implement `calculateMatches()` in `matchingService.js` — weighted comparison across education, skills, interests, work preferences.
**Why:** This is the core of the product.
**Files affected:** `frontend/src/services/matchingService.js`
**Dependencies:** Career database (Step 6), student profile shape (Step 9)
**How to test:** Unit-test with 2–3 sample profiles against the seeded careers; sanity-check rankings make sense
**Before moving on:** Algorithm runs end-to-end on real seeded data

## 11. Match Percentage Calculation

**What:** Convert the weighted comparison into a 0–100% score per career.
**Why:** Needed for the results page and for judge-facing explainability.
**Files affected:** `matchingService.js`
**Dependencies:** Step 10
**How to test:** Scores are stable, sensible, and correctly ordered across sample profiles
**Before moving on:** Scores documented (what weight each factor carries)

## 12. Explainable Matching System

**What:** For each match, generate a plain-language "why this matched" breakdown (which skills/interests/education aligned).
**Why:** Required for Avishkar judges — must not be a black box.
**Files affected:** `matchingService.js`, `frontend/src/pages/CareerDetail.jsx` (later)
**Dependencies:** Step 10–11
**How to test:** Manually review explanations for 2–3 sample profiles for accuracy
**Before moving on:** Explanation output is accurate and readable by a non-technical judge

## 13. Results Page

**What:** Build `frontend/src/pages/Results.jsx` — list of ranked career matches with Match %.
**Why:** First thing a student sees after submitting the assessment.
**Files affected:** New page + related components (e.g., `components/MatchCard.jsx`)
**Dependencies:** Steps 10–11
**How to test:** Submitting a sample assessment shows a correctly ranked list
**Before moving on:** Works on both desktop and mobile widths

## 14. Career Details Page

**What:** Build `frontend/src/pages/CareerDetail.jsx` — full detail for one selected career (why it matched, matching skills, missing skills, description).
**Why:** Lets a student go deeper on a specific match.
**Files affected:** New page + components
**Dependencies:** Step 12 (explainability), Step 13 (navigation from results)
**How to test:** Clicking a career from Results opens the correct detail view
**Before moving on:** All fields from Section 7 of `PROJECT_INSTRUCTIONS.md` are shown

## 15. Skill-Gap Analysis

**What:** Compare student's existing skills vs. a career's required skills; list the gap.
**Why:** Directly feeds the learning path.
**Files affected:** `matchingService.js` (or a new `skillGapService.js`), `CareerDetail.jsx`
**Dependencies:** Steps 6–9
**How to test:** Gap list is correct for sample profiles vs. sample careers
**Before moving on:** Gap logic is consistent with the matching algorithm's skill data

## 16. Personalized Learning Path

**What:** For each skill gap, suggest a simple learning path (could start as static suggestions per skill, stored in `skills` table or `data/`).
**Why:** Final step of the core user flow (Section 4 of `PROJECT_INSTRUCTIONS.md`).
**Files affected:** `frontend/src/data/`, `CareerDetail.jsx`
**Dependencies:** Step 15
**How to test:** Every skill gap shown has an associated learning suggestion
**Before moving on:** No skill gap is left without guidance

## 17. Testing

**What:** Manual end-to-end pass of the full flow (Home → Profile → Assessment → Submit → Results → Career Detail → Skill Gap → Learning Path) on desktop and mobile widths.
**Why:** Confirms the "final goal" definition of done (Section 15 of `PROJECT_INSTRUCTIONS.md`) actually works.
**Dependencies:** Steps 4–16 complete
**Before moving on:** Full flow works without errors for at least 3 different sample profiles

## 18. Deployment

**What:** Deploy the frontend (e.g., Vercel/Netlify) with environment variables configured for the live Supabase project.
**Why:** Needed for a live demo link at Avishkar.
**Dependencies:** Step 17 passing
**How to test:** Live URL works end-to-end, matches local behavior
**Before moving on:** Deployed link tested on a phone and a laptop

---

## Order of Implementation (Summary)

Supabase setup → Schema → Career DB → Skill DB → Assessment → Profile data shape →
Matching algorithm → Match % → Explainability → Results page → Career details →
Skill gap → Learning path → Testing → Deployment

## Beginner-Friendly Notes

- Do each numbered step fully (including testing) before starting the next — don't jump ahead.
- After each step, a short before/after check: does the app still run? Does the new piece work in isolation?
- If a step feels too big, it's fine to split it into smaller commits/sessions.

## How This Connects to the Avishkar Objective

Every phase maps directly to a requirement in `PROJECT_INSTRUCTIONS.md` Section 13
(working, explainable, demonstrable, mobile responsive, clear research problem,
full student journey shown). Steps 10–12 (matching + explainability) are the
most judge-facing — prioritize getting those right and clearly explainable
over visual polish (Section 14's priority order).
