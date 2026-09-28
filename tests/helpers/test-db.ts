import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/server/db/schema";
import { seedReferenceData } from "@/server/db/seed";
import type { Database } from "@/server/db/types";

/**
 * A fresh in-memory Postgres (PGlite) with the real migrations applied and,
 * optionally, the real seed data loaded.
 */
export async function createTestDb(options: { seed?: boolean } = {}): Promise<{
  db: Database;
  close: () => Promise<void>;
}> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  if (options.seed ?? true) await seedReferenceData(db);
  return { db, close: () => client.close() };
}
