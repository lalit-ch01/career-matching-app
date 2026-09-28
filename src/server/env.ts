import "server-only";
import { z } from "zod";
import { isPostgresUrl, isSupabaseTransactionPooler } from "@/server/db/connection";

// Server-side environment variables, validated once on first use. Nothing here
// is prefixed with NEXT_PUBLIC_, so none of it can reach the browser bundle.

const envSchema = z.object({
  DATABASE_URL: z
    .string({ error: "DATABASE_URL is not set." })
    .refine(isPostgresUrl, { error: "DATABASE_URL must be a postgres:// or postgresql:// connection string." })
    .refine((url) => !isSupabaseTransactionPooler(url), {
      error:
        "DATABASE_URL points to Supabase's Transaction pooler (port 6543), which can mix up results of parallel queries. " +
        "Use the Session pooler URI (same host, port 5432) instead.",
    }),
  SESSION_SECRET: z
    .string({ error: "SESSION_SECRET is not set." })
    .min(32, { error: "SESSION_SECRET must be at least 32 characters long." }),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | undefined;

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/** True when every required variable is present and valid. */
export function isServerConfigured(): boolean {
  return envSchema.safeParse(process.env).success;
}

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.message}`).join("\n");
    throw new ConfigurationError(
      `Invalid server configuration:\n${problems}\nCopy .env.example to .env.local and fill it in (see README.md).`,
    );
  }
  cached = parsed.data;
  return cached;
}
