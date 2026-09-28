import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/**
 * Any Drizzle Postgres database (or transaction) using our schema.
 * Production uses postgres-js; tests use PGlite — both satisfy this type.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
