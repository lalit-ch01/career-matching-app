# Architecture

## System overview

```
 Browser (student)
   │  HTML pages, form submissions (Server Actions), JSON (/api/*)
   ▼
 Next.js server  ── the whole backend ─────────────────────────────┐
   app/ (pages, actions, routes)                                    │
     → server/services     business logic (save profile, submit)   │
     → lib/matching         pure matching engine + learning path   │
     → server/repositories  SQL queries via Drizzle ORM            │
     → server/session       signed httpOnly cookie (no login)      │
   │  Postgres wire protocol (TLS), session pooler, port 5432       │
   ▼                                                                 │
 Supabase Postgres  ── database only ───────────────────────────────┘
   (no Supabase Auth, Edge Functions, Storage, Realtime or REST API use)
```

- **Reads** happen in React Server Components, which query the database
  directly on the server. No data or secrets are sent to the browser beyond
  the rendered page.
- **Writes** go through Server Actions (`app/profile/actions.ts`,
  `app/assessment/actions.ts`). They re-validate every input on the server and
  check the student session before touching the database.
- **JSON API:** `GET /api/health` (DB status) and `GET /api/careers` (public
  career database).
- **Identity:** students don't log in. Saving a profile sets an HMAC-signed,
  `httpOnly`, `SameSite=Lax` cookie holding the profile id. Results are only
  shown to the browser holding that cookie. Students can forget the device or
  delete all their data from the Profile page.

## Submission pipeline

`submitAssessment()` in `src/server/services/assessment-service.ts`:

1. Load the student profile, the skill/interest options and all careers (in parallel).
2. Validate the answers against the questionnaire built from the database.
3. Convert them to a matching input (skills merged, "Other" answers dropped).
4. `calculateMatches()` scores all careers with the five weighted factors and ranks them.
5. Save the response and every career's result (score, rank and full
   explanation) in **one transaction**, along with the questionnaire version,
   algorithm version and a snapshot of the profile. Past results therefore
   stay reproducible even if the careers or the algorithm change later.

## Database

13 tables. Reference data uses readable slugs as primary keys (e.g.
`careers.slug = 'data-analyst'`), and student data uses random UUIDs.

```
degrees ─┐                          interests ─┐
         │ career_degrees (fit)                │ career_interests (relevance)
         ▼                                     ▼
       careers ◄── career_skills (importance 1–3) ──► skills ──► skill_learning_steps
         │    ◄── career_work_types (relevance)
         │    ◄── career_priorities
         │
         └──────────────► match_results ◄── assessment_responses ◄── student_profiles ──► degrees
                          (rank, match %,    (answers jsonb,          (name, education,
                           breakdown jsonb)   profile snapshot)        optional email/college)
```

| Table | Purpose |
|---|---|
| `careers` | The 14 career roles: title, summary, description, responsibilities, education summary, work style, environment, first steps |
| `skills` | The team's 24 skills, grouped by category. `is_foundational` marks the Google Form skills |
| `skill_learning_steps` | Ordered learning steps per skill (resource link + estimated hours) |
| `interests`, `degrees` | Master lists used by the profile and the assessment |
| `career_skills` | Required skills per career, with importance (3 core, 2 important, 1 nice to have) |
| `career_interests`, `career_work_types` | Primary/secondary interest areas and work types per career |
| `career_degrees` | Preferred/accepted degrees per career |
| `career_priorities` | What each career typically offers (salary, stability…) |
| `student_profiles` | One row per student |
| `assessment_responses` | Raw validated answers (jsonb) + questionnaire version + profile snapshot |
| `match_results` | One row per (response, career): rank, match %, full explanation (jsonb), algorithm version |

Integrity is enforced in the database itself:
- foreign keys (with an index on every FK column)
- enums for fixed vocabularies
- check constraints (importance 1–3, match % 0–100, https-only resource links, name length, graduation year)
- unique `(response, career)` and `(response, rank)`

**Security:** RLS is enabled on every table with no policies, and migration
`0001` revokes all privileges from Supabase's `anon` and `authenticated`
roles. The app connects as the database owner from the server only.

## Matching model

See `src/lib/matching/config.ts` (all weights and rules) and the in-app
`/methodology` page. The page is generated from the same constants, so the two
can't disagree.

| Factor | Weight | Rule |
|---|---|---|
| Skills | 35% | Importance points of skills held ÷ total (role-specific skills 3 points, transferable skills 2) |
| Interests | 25% | Best match: primary area 100%, related area 50% |
| Education | 15% | Preferred degree 100%, accepted 60%, not typical 20%, "Other" 50% |
| Work preferences | 15% | 60% type of work + 20% working style + 20% environment |
| Career preferences | 10% | Share of the student's priorities the career offers |

## Testing

- `src/lib/**/*.test.ts`: the matching engine, including rankings for four
  realistic sample students, invariants (points add up, determinism, 0–100
  range) and each individual rule; plus assessment validation.
- `src/server/**/*.test.ts`: session signing and seed-data integrity.
- `tests/integration/`: the whole backend flow (profile → assessment →
  results → learning path, access control, constraints, RLS, re-seeding)
  against an in-memory Postgres (PGlite) with the real migrations.
