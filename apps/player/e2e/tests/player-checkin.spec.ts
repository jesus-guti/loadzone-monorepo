/**
 * E2E: Complete player check-in flow
 *
 * Prerequisites:
 *   1. Seed test data: pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --output apps/player/e2e/seed-context.json
 *   2. Set DATABASE_URL, or E2E_PLAYER_URL/E2E_STAFF_URL
 *
 * Tests:
 *   - Staff app is reachable
 *   - Each player's page loads
 *   - Pre-session form submission
 *   - Post-session form submission
 *   - Data integrity via seed context
 */

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Types ───────────────────────────────────────────────────────────

interface SeedContext {
  label: string;
  clubId: string;
  teamId: string;
  seasonId: string;
  preTemplateId: string;
  postTemplateId: string;
  players: Array<{ id: string; name: string; token: string }>;
  staffUserId: string;
  staffEmail: string;
  sessions: Array<{ id: string; day: string; type: string }>;
}

// ── Load context ────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = resolve(__dirname, "..", "seed-context.json");

let ctx: SeedContext;

try {
  ctx = JSON.parse(readFileSync(SEED_FILE, "utf-8"));
  console.log(`📋 Loaded seed context: ${ctx.label}`);
  console.log(`   ${ctx.players.length} players, ${ctx.sessions.length} sessions`);
} catch {
  console.error("");
  console.error("❌ seed-context.json not found!");
  console.error("");
  console.error("Run the seeder first:");
  console.error(
    "  pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --output apps/player/e2e/seed-context.json"
  );
  console.error("");
  process.exit(1);
}

// ── Constants ───────────────────────────────────────────────────────

const STAFF_URL =
  process.env.E2E_STAFF_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://app.loadzone.app";

const PLAYER_URL =
  process.env.E2E_PLAYER_URL ||
  process.env.NEXT_PUBLIC_PLAYER_URL ||
  "https://player.loadzone.app";

// ── Tests ───────────────────────────────────────────────────────────

test.describe("Player check-in E2E", () => {
  // ═══ 1. Staff app reachable ═══════════════════════════════════════

  test("Staff app is reachable and shows sign-in page", async ({ page }) => {
    test.setTimeout(30_000);
    await page.goto(STAFF_URL, { waitUntil: "networkidle" });

    await expect(page.locator("#email")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByText("Inicia sesión")).toBeVisible();
  });

  // ═══ 2. Player app loads for each player ══════════════════════════

  for (const player of ctx.players) {
    test(`Player "${player.name}" page loads`, async ({ page }) => {
      test.setTimeout(30_000);
      const response = await page.goto(`${PLAYER_URL}/${player.token}`, {
        waitUntil: "networkidle",
      });

      expect(response?.status()).toBe(200);

      const firstName = player.name.split(" ")[0];
      await expect(page.getByText(firstName)).toBeVisible({ timeout: 10000 });

      // Should show the form tabs (pre and post session)
      await expect(page.getByText("Pre-sesión")).toBeVisible();
      await expect(page.getByText("Post-sesión")).toBeVisible();
    });
  }

  // ═══ 3. Pre-session form submission ═══════════════════════════════

  const wellnessValues = [
    { recovery: 7, energy: 4, soreness: 2, sleepHours: 8, sleepQuality: 4 },
    { recovery: 5, energy: 3, soreness: 3, sleepHours: 7, sleepQuality: 3 },
    { recovery: 8, energy: 5, soreness: 1, sleepHours: 9, sleepQuality: 5 },
  ];

  for (let i = 0; i < ctx.players.length; i++) {
    const player = ctx.players[i];
    const vals = wellnessValues[i % wellnessValues.length];

    test(`"${player.name}" submits pre-session form`, async ({ page }) => {
      test.setTimeout(45_000);

      await page.goto(`${PLAYER_URL}/${player.token}`, {
        waitUntil: "networkidle",
      });
      // Wait for form to fully render
      await page.waitForTimeout(1500);

      // The pre-session form has 5 steps controlled by sliders
      // Each step shows a range input. We set it and wait for commit.
      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();
      expect(count).toBeGreaterThan(0);

      // Step 1: Recovery (slider 0-10)
      await setSlider(sliders.first(), vals.recovery);
      await page.waitForTimeout(800);

      // Step 2: Energy (slider 1-5)
      const s2 = page.locator('input[type="range"]').first();
      await setSlider(s2, vals.energy);
      await page.waitForTimeout(800);

      // Step 3: Soreness (slider 1-5)
      const s3 = page.locator('input[type="range"]').first();
      await setSlider(s3, vals.soreness);
      await page.waitForTimeout(800);

      // Step 4: Sleep Hours (chip selector)
      const sleepChip = page.locator("button", {
        hasText: new RegExp(`${vals.sleepHours}\\s*h`),
      });
      if (await sleepChip.isVisible().catch(() => false)) {
        await sleepChip.click();
      } else {
        const numInput = page.locator('input[type="number"]');
        if (await numInput.isVisible().catch(() => false)) {
          await numInput.fill(String(vals.sleepHours));
        }
      }
      await page.waitForTimeout(600);

      // Step 5: Sleep Quality (slider 1-5)
      const s5 = page.locator('input[type="range"]').first();
      await setSlider(s5, vals.sleepQuality);
      await page.waitForTimeout(800);

      // Click submit
      const submitBtn = page.locator("button", {
        hasText: /Guardar/,
        visible: true,
      });
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
      }

      // Wait for success state
      await expect(page.getByText("Pre-sesión registrada")).toBeVisible({
        timeout: 15000,
      });
    });
  }

  // ═══ 4. Post-session form submission ══════════════════════════════

  const postValues = [
    { rpe: 6, duration: 90 },
    { rpe: 7, duration: 105 },
    { rpe: 5, duration: 75 },
  ];

  for (let i = 0; i < ctx.players.length; i++) {
    const player = ctx.players[i];
    const vals = postValues[i % postValues.length];

    test(`"${player.name}" submits post-session form`, async ({ page }) => {
      test.setTimeout(45_000);

      await page.goto(`${PLAYER_URL}/${player.token}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1000);

      // Switch to Post-sesión tab
      await page.getByText("Post-sesión").click();
      await page.waitForTimeout(1000);

      // Step 1: RPE (slider 0-10)
      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();
      expect(count).toBeGreaterThan(0);

      await setSlider(sliders.first(), vals.rpe);
      await page.waitForTimeout(800);

      // Step 2: Duration (chip selector)
      const durationChip = page.locator("button", {
        hasText: new RegExp(`${vals.duration}\\s*min`),
      });
      if (await durationChip.isVisible().catch(() => false)) {
        await durationChip.click();
      } else {
        const numInput = page.locator('input[type="number"]');
        if (await numInput.isVisible().catch(() => false)) {
          await numInput.fill(String(vals.duration));
        }
      }
      await page.waitForTimeout(600);

      // Submit
      const submitBtn = page.locator("button", {
        hasText: /Guardar/,
        visible: true,
      });
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
      }

      await expect(page.getByText("Post-sesión registrada")).toBeVisible({
        timeout: 15000,
      });
    });
  }

  // ═══ 5. Context sanity checks ═════════════════════════════════════

  test("Seed context has valid data", () => {
    expect(ctx.clubId).toBeTruthy();
    expect(ctx.teamId).toBeTruthy();
    expect(ctx.seasonId).toBeTruthy();
    expect(ctx.players.length).toBeGreaterThanOrEqual(3);
    expect(ctx.sessions.length).toBeGreaterThan(0);
    for (const player of ctx.players) {
      expect(player.token).toBeTruthy();
      expect(player.token.length).toBeGreaterThan(20); // cuid length
    }
  });
});

// ── Helpers ─────────────────────────────────────────────────────────

async function setSlider(
  slider: ReturnType<typeof page.locator>,
  value: number
) {
  await slider.evaluate((el, val) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    if (setter) {
      setter.call(input, String(val));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    }
  }, value);
}
