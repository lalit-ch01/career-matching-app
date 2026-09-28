import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getServerEnv } from "@/server/env";
import { connectionOptions } from "./connection";
import * as schema from "./schema";
import type { Database } from "./types";

// One connection pool per server process. It is kept on globalThis so that
// Next.js hot reloads in development don't open a new pool on every edit.
const globalForDb = globalThis as unknown as { __careerAppDb?: Database };

function createDb(): Database {
  const env = getServerEnv();
  const client = postgres(env.DATABASE_URL, connectionOptions(env.DATABASE_URL, env.DATABASE_POOL_MAX));
  return drizzle(client, { schema });
}

/** The app's database. Created lazily so builds don't need a database. */
export function getDb(): Database {
  globalForDb.__careerAppDb ??= createDb();
  return globalForDb.__careerAppDb;
}
