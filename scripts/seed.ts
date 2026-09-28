// Loads the career database (careers, skills, interests, degrees, learning
// steps) into the database. Safe to re-run: existing rows are updated and
// student data is never touched.
//
// Usage:
//   npm run db:seed                # validate, then seed
//   npm run db:seed -- --check     # validate only (no database needed)
//   npm run db:seed -- --prune     # also delete careers/skills/interests/degrees removed from the seed data
import { defaultSeedData, findSeedProblems, findSeedWarnings, seedReferenceData, StaleReferenceDataError } from "../src/server/db/seed";

const args = new Set(process.argv.slice(2));

function printValidation(): boolean {
  const problems = findSeedProblems(defaultSeedData);
  const warnings = findSeedWarnings(defaultSeedData);
  console.log(
    `Seed data: ${defaultSeedData.careers.length} careers, ${defaultSeedData.skills.length} skills, ` +
      `${defaultSeedData.interests.length} interests, ${defaultSeedData.degrees.length} degrees.`,
  );
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s) — fix these before seeding:`);
    for (const p of problems) console.error(`  ✗ ${p}`);
  }
  if (warnings.length > 0) {
    console.warn(`\n${warnings.length} warning(s) — seeding can continue, but please review:`);
    for (const w of warnings) console.warn(`  ! ${w}`);
  }
  if (problems.length === 0 && warnings.length === 0) console.log("No problems found.");
  return problems.length === 0;
}

async function main() {
  const valid = printValidation();
  if (!valid) process.exit(1);
  if (args.has("--check")) return;

  const { openScriptDb } = await import("./db");
  const { db, close, host } = openScriptDb();
  console.log(`\nSeeding career database on ${host} ...`);
  try {
    const summary = await seedReferenceData(db, defaultSeedData, { prune: args.has("--prune") });
    console.log(
      `Done: ${summary.careers} careers, ${summary.skills} skills (${summary.learningSteps} learning steps), ` +
        `${summary.interests} interests, ${summary.degrees} degrees.`,
    );
    const pruned = Object.entries(summary.pruned).filter(([, list]) => list.length > 0);
    for (const [kind, list] of pruned) console.log(`Pruned ${kind}: ${list.join(", ")}`);
  } finally {
    await close();
  }
}

main().catch((error) => {
  if (error instanceof StaleReferenceDataError) {
    console.error(`\nNothing was written.\n${error.message}`);
  } else {
    console.error("Seeding failed:", error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
