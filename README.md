# From Degree to Career

An AI-based skill & interest matching approach for Indian Gen Z — built for the
Avishkar project competition.

Full project context and development rules live in `PROJECT_INSTRUCTIONS.md`.
The current step-by-step roadmap lives in `NEXT_PHASE.md`.

## Current status: Foundation stage

At this stage, the project only has:
- A basic React (Vite) frontend that runs and shows a placeholder Home page
- The folder structure ready for components, pages, hooks, services, and data
- Placeholder files for the Supabase client and the matching service (not implemented yet)

No database, career data, assessment logic, or matching algorithm exists yet —
see `NEXT_PHASE.md` for what comes next.

## Getting started

```bash
# from the project root
npm install
npm run dev
```

Then open the local URL Vite prints in the terminal (usually `http://localhost:5173`).

## Environment variables

Copy `.env.example` to `.env` and fill in your own values once you have a
Supabase project (this isn't needed yet at the foundation stage):

```bash
cp .env.example .env
```

Never commit your real `.env` file or share your Supabase service-role key.
