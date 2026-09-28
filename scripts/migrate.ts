// Applies every pending SQL migration in ./drizzle to the database.
// Usage: npm run db:migrate
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { openScriptDb } from "./db";

async function main() {
  const { db, close, host } = openScriptDb();
  console.log(`Applying migrations to ${host} ...`);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations applied.");
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
