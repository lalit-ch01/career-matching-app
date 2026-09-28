import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./scripts/load-env";

loadLocalEnv();

// `npm run db:generate` turns changes in src/server/db/schema.ts into a new SQL
// migration in ./drizzle. It doesn't need a database connection.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
