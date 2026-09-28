import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { connectionOptions, isPostgresUrl } from "../src/server/db/connection";
import * as schema from "../src/server/db/schema";
import { loadLocalEnv } from "./load-env";

/** Opens a single-connection database for CLI scripts (migrate, seed). */
export function openScriptDb(): {
  db: PostgresJsDatabase<typeof schema>;
  close: () => Promise<void>;
  host: string;
} {
  loadLocalEnv();
  const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!url || !isPostgresUrl(url)) {
    console.error(
      "DATABASE_URL (or DATABASE_URL_DIRECT) is missing or invalid.\n" +
        "Copy .env.example to .env.local and set it to your Supabase connection string.",
    );
    process.exit(1);
  }
  const client = postgres(url, connectionOptions(url, 1));
  return {
    db: drizzle(client, { schema }),
    close: () => client.end({ timeout: 5 }),
    host: new URL(url).host,
  };
}
