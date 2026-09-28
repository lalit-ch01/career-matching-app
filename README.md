# From Degree to Career

An explainable career-matching web app for Indian Gen Z students, built for the
Avishkar research competition. A student creates a profile, takes a short
assessment, and gets all 14 careers ranked by Match % — with a factor-by-factor
explanation, their skill gaps, and a phased learning path for each career.

- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind) is both the frontend
  and the backend. Supabase is used **only as a Postgres database**, through
  Drizzle ORM.
- **Matching:** a transparent, rule-based weighted scoring model (not a trained
  ML model). See `/methodology` in the app or `src/lib/matching/`.
- Project rules and context: [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md).
  Status and what's left: [NEXT_PHASE.md](NEXT_PHASE.md). System and database
  design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Live demo walkthrough:
  [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Student journey

Home → Profile (education) → Assessment (skills, interests, work style, career
priorities) → Submit → Profile analysis + ranked matches with Match % → Career
details (why it matched) → Skill gap → Personalised learning path.

## Getting started

Requires Node.js 20.9+.

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and SESSION_SECRET
npm run db:setup             # create tables + load the career database
npm run dev                  # http://localhost:3000
```

### Connecting Supabase

1. Create a Supabase project and note the database password.
2. In the dashboard, open **Connect → Direct** and copy the **Session pooler**
   URI (port 5432). Put it in `.env.local` as `DATABASE_URL`, with your password.
   Don't use the Transaction pooler (port 6543): the app runs queries in
   parallel, and that pooler can mix up their results, so the app refuses it.
3. (The Direct connection works too, but only on IPv6 networks.)
4. Set `SESSION_SECRET` to a random string of 32+ characters:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
5. Run `npm run db:setup`, then `npm run verify` (a few seconds: checks the
   data, security and the full student flow against the real database), then
   `npm run dev`.

No Supabase API keys are needed, because the app never calls Supabase's APIs.

### Trying it without Supabase (local database)

```bash
npm run db:local        # terminal 1: embedded Postgres (PGlite) on port 54329, data in .pglite/
# terminal 2, with in .env.local:
#   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres
#   DATABASE_POOL_MAX=1   (PGlite handles one connection at a time)
npm run db:setup
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit + integration tests (the integration tests run against an in-memory Postgres) |
| `npm run typecheck` / `npm run lint` | Type checking / ESLint |
| `npm run check` | All of the above plus a production build |
| `npm run db:migrate` | Apply SQL migrations in `drizzle/` |
| `npm run db:seed` | Validate, then load or refresh the career database (safe to re-run; student data is never touched). `-- --check` validates only; `-- --prune` removes careers/skills deleted from the data |
| `npm run db:setup` | Migrate + seed |
| `npm run db:generate` | Generate a new migration after editing `src/server/db/schema.ts` |
| `npm run db:local` | Local embedded Postgres for development without Supabase |
| `npm run verify` | End-to-end check against the database in `.env.local`: connection, migrations, security (RLS), career data, and a full student journey with a temporary profile that is deleted afterwards |

## Project structure

```
src/
  app/                  Pages, server actions and API routes (App Router)
    profile/            Step 1: profile form + saveProfile action
    assessment/         Step 2: multi-step assessment + submit action
    results/            Step 3: ranked matches, career detail, skill gap, learning path
    careers/            Public career database pages
    methodology/        How the matching works (for students and judges)
    api/health, api/careers   JSON endpoints
  components/           Reusable UI (match bars, factor breakdown, learning path…)
  lib/                  Pure logic, no database or framework code
    matching/           Matching engine, weights/config, learning path builder
    assessment/         Questionnaire definition + validation (shared client/server)
    profile/            Profile validation schema
    taxonomy.ts         Fixed vocabularies (work types, priorities…)
  server/               Server-only code
    db/                 Drizzle schema, connection, seed data + seed routine
    repositories/       Database queries
    services/           Business logic (save profile, submit assessment)
    session.ts          Signed-cookie student session
drizzle/                SQL migrations
scripts/                migrate / seed CLI scripts
tests/                  Integration tests + test helpers
```

## Environment variables

All variables are server-side only. None use the `NEXT_PUBLIC_` prefix, so none
reach the browser. See [.env.example](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string (Supabase transaction pooler) |
| `SESSION_SECRET` | yes | Signs the student session cookie (32+ chars) |
| `DATABASE_URL_DIRECT` | no | Connection used by migrate/seed scripts |
| `DATABASE_POOL_MAX` | no | Max DB connections per server instance (default 5) |

Never commit `.env.local`.
