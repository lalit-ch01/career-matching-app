# NEXT_PHASE.md

Project status and remaining work. See `PROJECT_INSTRUCTIONS.md` for the rules
and `README.md` for setup.

---

## Status: prototype complete, waiting for the Supabase database

Everything in the module plan (`PROJECT_INSTRUCTIONS.md`, Section 10) is built
and tested except connecting a real Supabase project, which the project owner
does manually.

| # | Module | Status |
|---|---|---|
| 1–3 | Project setup, frontend, navigation | ✅ Next.js 16 app, TypeScript, Tailwind |
| 4 | Supabase setup | ✅ Mumbai project connected, migrated and seeded; `npm run verify` passes |
| 5 | Database schema | ✅ 13 tables, migrations in `drizzle/`, RLS on, API roles locked out |
| 6 | Career database | ✅ Team taxonomy: 14 careers, 24 skills, 9 interests, all mappings confirmed; 53 learning steps, 12 degrees |
| 7 | Assessment | ✅ 4 sections, options loaded from the DB, validated on client and server, draft autosave |
| 8 | Matching algorithm | ✅ 5 weighted factors, deterministic, versioned (`weighted-v1`) |
| 9 | Results page | ✅ Ranked matches, profile analysis, "skills that open the most doors" |
| 10 | Career details | ✅ Factor-by-factor "why it matched" with points adding up to the Match % |
| 11 | Skill gap view | ✅ Missing/matching skills by importance, potential Match % if gaps are closed |
| 12 | Learning path | ✅ Phased (core → supporting skills), steps, resources, hour estimates |
| 13 | Testing | ✅ 88 unit/integration tests + `npm run verify` against the live database (incl. checks that the seed data matches the team taxonomy); full browser journey checked on desktop and phone widths |
| 14 | UI/UX | ✅ Responsive and accessible (labels, focus handling, keyboard navigation) |
| 15 | Demo preparation | ✅ Methodology page, architecture doc and demo script (`docs/DEMO_SCRIPT.md`) done |

## Remaining steps

### 0. Career data — confirmed ✅
All 14 career → skill mappings now come from the team's list. `npm run db:seed -- --check`
still reports a few warnings worth a team discussion (none block seeding):
- Consulting and Entrepreneurship are only secondary interests (max 50% interest score).
- Some careers share most of their skills (the three HR roles; Management Trainee and
  Business Development Executive; Operations Executive and Project Coordinator), so they
  score close together. Work style, priorities and interests still separate them.

### 1. Connect Supabase (project owner)
Follow README → "Connecting Supabase": create the project, fill in
`.env.local`, run `npm run db:setup`, check `/api/health`.
**Test:** the full journey works locally against Supabase.

### 2. Deploy (when ready)
Deploy to Vercel with `DATABASE_URL` (Session pooler, port 5432),
`SESSION_SECRET` and `DATABASE_POOL_MAX=2` set in the project's environment
variables. `vercel.json` pins the app to Mumbai (`bom1`), next to the Supabase
database (South Asia / Mumbai, `ap-south-1`).
**Test:** the live URL works end to end on a phone and a laptop.

### 3. Avishkar material
- Demo script: written, see `docs/DEMO_SCRIPT.md`. Rehearse it on the deployed
  URL and on a phone, and fill in the Google Form findings it leaves as
  placeholders.
- Research methodology write-up: link the Google Form survey to the
  assessment taxonomy (mapping is documented in `src/lib/assessment/questions.ts`).
- Architecture/database diagrams: source material in `docs/ARCHITECTURE.md`.

### 4. Optional improvements
- Import Google Form responses into Supabase for research analysis (the
  taxonomies already match).
- Calibrate the weights against survey data or placement outcomes, then bump
  `ALGORITHM_VERSION`.
- Add more careers. This is data only: edit `src/server/db/seed-data/` and
  run `npm run db:seed`.
