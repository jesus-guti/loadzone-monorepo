import { defineConfig, devices } from "@playwright/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PLAYER_URL =
  process.env.E2E_PLAYER_URL ||
  process.env.NEXT_PUBLIC_PLAYER_URL ||
  "https://player.loadzone.app";

const STAFF_URL =
  process.env.E2E_STAFF_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://app.loadzone.app";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],

  use: {
    baseURL: PLAYER_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  globalSetup: resolve(__dirname, "global-setup.ts"),
});

export { PLAYER_URL, STAFF_URL };
