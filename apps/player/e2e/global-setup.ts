/**
 * Global setup for Playwright E2E tests.
 *
 * Validates that required environment variables are present.
 * Database seeding is done separately via the seed-test-data.ts script.
 */

import type { FullConfig } from "@playwright/test";

async function globalSetup(_config: FullConfig): Promise<void> {
  const playerUrl =
    process.env.E2E_PLAYER_URL ||
    process.env.NEXT_PUBLIC_PLAYER_URL ||
    "https://player.loadzone.app";
  const staffUrl =
    process.env.E2E_STAFF_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://app.loadzone.app";

  console.log(`📍 Player app: ${playerUrl}`);
  console.log(`📍 Staff app:  ${staffUrl}`);
  console.log("");
  console.log("⚠️  Make sure you've seeded data first:");
  console.log(`   pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --output apps/player/e2e/seed-context.json`);
  console.log("");
}

export default globalSetup;
