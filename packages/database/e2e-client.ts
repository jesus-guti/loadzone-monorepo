/**
 * E2E-safe database client.
 *
 * Same PrismaClient as `@repo/database` but without the `server-only` guard,
 * so it can be imported from Playwright tests and seed scripts.
 *
 * Uses the Neon adapter like the main client, but works outside Next.js.
 *
 * Import: import { getDatabase, PrismaClient } from "@repo/database/e2e-client";
 */

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "./generated/client";

// Re-export
export { PrismaClient, Prisma } from "./generated/client";

// WebSocket for Neon (same as main client.ts)
neonConfig.webSocketConstructor = ws;

const globalForDb = globalThis as unknown as { __e2eDb?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

export function getDatabase(): PrismaClient {
  if (!globalForDb.__e2eDb) {
    globalForDb.__e2eDb = createClient();
  }
  return globalForDb.__e2eDb;
}
