import { existsSync } from "node:fs";

/**
 * Loads .env.local then .env into process.env for CLI scripts (Next.js does
 * this itself for the app). Variables that are already set are never
 * overwritten, and .env.local wins over .env.
 */
export function loadLocalEnv(): void {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
