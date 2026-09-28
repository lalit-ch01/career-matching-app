import type { Options } from "postgres";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * postgres-js options for a connection URL.
 *
 * - `prepare: false` keeps the app compatible with connection poolers.
 * - SSL is required for any non-local host (Supabase), unless the URL sets
 *   its own `sslmode`.
 *
 * Use Supabase's Session pooler (port 5432) or a direct connection, not the
 * Transaction pooler (port 6543): the app runs several queries in parallel,
 * and the driver pipelines them on a connection, which a transaction pooler
 * can route to different backends — mixing up results between queries.
 * `isSupabaseTransactionPooler` lets the app refuse that setup at startup.
 */
export function connectionOptions(databaseUrl: string, maxConnections: number): Options<Record<string, never>> {
  const url = new URL(databaseUrl);
  const isLocal = LOCAL_HOSTS.has(url.hostname);
  const hasSslMode = url.searchParams.has("sslmode");

  return {
    prepare: false,
    max: maxConnections,
    idle_timeout: 20,
    connect_timeout: 15,
    ...(hasSslMode ? {} : { ssl: isLocal ? false : "require" }),
    onnotice: () => {},
  };
}

export function isPostgresUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "postgres:" || protocol === "postgresql:";
  } catch {
    return false;
  }
}

/** True for Supabase's Transaction pooler URL (`*.pooler.supabase.com:6543`). */
export function isSupabaseTransactionPooler(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543";
  } catch {
    return false;
  }
}
