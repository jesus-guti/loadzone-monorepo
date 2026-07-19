#!/usr/bin/env tsx
/**
 * Standalone E2E test data seeder.
 *
 * Creates a complete test environment in the database:
 * Club → Team → Season → Staff user → Players → Sessions
 *
 * Usage:
 *   pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --output <file>
 *   pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --cleanup <file>
 *
 * Requires DATABASE_URL environment variable.
 */

import { getDatabase, PrismaClient } from "@repo/database/e2e-client";

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// ── Types ───────────────────────────────────────────────────────────

export interface SeedContext {
  label: string;
  clubId: string;
  teamId: string;
  seasonId: string;
  preTemplateId: string;
  postTemplateId: string;
  players: Array<{ id: string; name: string; token: string }>;
  staffUserId: string;
  staffEmail: string;
  sessions: Array<{ id: string; day: string; type: "TRAINING" | "MATCH" }>;
}

// ── Seed ────────────────────────────────────────────────────────────

export async function seedTestData(
  playerCount: number = 3
): Promise<SeedContext> {
  const db = getDatabase();
  const timestamp = Date.now();
  const label = `e2e-${timestamp}`;
  const clubName = `E2E Test Club ${timestamp}`;
  const teamName = `E2E Test Team ${timestamp}`;

  console.log(`\n🌱 Seeding: ${clubName}`);

  // 1. Club
  const club = await db.club.create({
    data: { name: clubName, slug: slugify(clubName) },
  });

  // 2. Staff user + membership
  const staffEmail = `e2e-test-${timestamp}@loadzone.app`;
  const user = await db.user.create({
    data: {
      email: staffEmail,
      name: "E2E Test Staff",
      passwordHash: "$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Gz0q5Gz0q5Gz0q5Gz0q5G",
      platformRole: "SUPER_ADMIN",
    },
  });

  const membership = await db.membership.create({
    data: { userId: user.id, clubId: club.id, role: "COORDINATOR", hasAllTeams: true },
  });

  // 3. Team
  const team = await db.team.create({
    data: { clubId: club.id, name: teamName, category: "E2E Test", timezone: "Europe/Madrid" },
  });
  await db.membershipTeam.create({ data: { membershipId: membership.id, teamId: team.id } });

  // 4. Season
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;

  const season = await db.season.create({
    data: {
      teamId: team.id, name: `${startYear}/${endYear}`,
      startDate: new Date(Date.UTC(startYear, 6, 1)),
      endDate: new Date(Date.UTC(endYear, 5, 30)),
      preSeasonEnd: new Date(Date.UTC(startYear, 7, 31)),
    },
  });

  // 5. Form templates
  const preTemplate = await db.formTemplate.findUnique({ where: { code: "system-wellness-pre" } });
  const postTemplate = await db.formTemplate.findUnique({ where: { code: "system-rpe-post" } });

  if (!preTemplate || !postTemplate) {
    throw new Error("System form templates not found. Run: pnpm db:bootstrap");
  }

  // 6. Form assignments
  await db.formAssignment.createMany({
    data: [
      { templateId: preTemplate.id, teamId: team.id, fillMoment: "PRE_SESSION" },
      { templateId: postTemplate.id, teamId: team.id, fillMoment: "POST_SESSION" },
    ],
    skipDuplicates: true,
  });

  // 7. Players
  const players: SeedContext["players"] = [];
  for (let i = 1; i <= playerCount; i++) {
    const player = await db.player.create({
      data: { teamId: team.id, name: `E2E Player ${pad(i)}`, status: "AVAILABLE" },
    });
    players.push({ id: player.id, name: player.name, token: player.token });
  }

  // 8. Sessions for last 7 days + next 2
  const sessions: SeedContext["sessions"] = [];
  for (let dayOffset = -7; dayOffset <= 2; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();
    let type: "TRAINING" | "MATCH" | null = null;
    let hStart = 18, hEnd = 20;

    if (dow === 1 || dow === 3) type = "TRAINING";
    else if (dow === 6) { type = "MATCH"; hStart = 11; hEnd = 13; }

    if (type) {
      const startsAt = new Date(day); startsAt.setHours(hStart, 0, 0, 0);
      const endsAt = new Date(day); endsAt.setHours(hEnd, 0, 0, 0);
      const session = await db.teamSession.create({
        data: {
          clubId: club.id, teamId: team.id,
          title: `E2E ${type === "MATCH" ? "Partido" : "Entreno"} · ${day.toISOString().slice(0, 10)}`,
          type, status: endsAt.getTime() < Date.now() ? "COMPLETED" : "SCHEDULED",
          startsAt, endsAt, timezone: "Europe/Madrid",
          appliesToAllPlayers: true, createdByMembershipId: membership.id,
        },
      });
      sessions.push({ id: session.id, day: day.toISOString(), type });
    }
  }

  console.log(
    `✅ Created: 1 club, 1 team, 1 season, ${players.length} players, ${sessions.length} sessions`
  );

  return {
    label, clubId: club.id, teamId: team.id, seasonId: season.id,
    preTemplateId: preTemplate.id, postTemplateId: postTemplate.id,
    players, staffUserId: user.id, staffEmail, sessions,
  };
}

// ── Cleanup ─────────────────────────────────────────────────────────

export async function cleanupTestData(ctx: SeedContext): Promise<void> {
  const db = getDatabase();
  console.log("🧹 Cleaning up test data...");
  const playerIds = ctx.players.map((p) => p.id);

  await db.pushDispatch.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.pushSubscription.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.sessionAttendance.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.aiSuggestion.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.playerDailyStats.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.formAnswer.deleteMany({ where: { submission: { playerId: { in: playerIds } } } });
  await db.formSubmission.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.dailyEntry.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.injuryReport.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.teamSessionPlayer.deleteMany({ where: { playerId: { in: playerIds } } });
  await db.sessionExercise.deleteMany({ where: { teamSession: { teamId: ctx.teamId } } });
  await db.teamSession.deleteMany({ where: { teamId: ctx.teamId } });
  await db.player.deleteMany({ where: { teamId: ctx.teamId } });
  await db.formAssignment.deleteMany({ where: { teamId: ctx.teamId } });
  await db.membershipTeam.deleteMany({ where: { teamId: ctx.teamId } });
  await db.season.deleteMany({ where: { teamId: ctx.teamId } });
  await db.team.deleteMany({ where: { id: ctx.teamId } });
  await db.membership.deleteMany({ where: { clubId: ctx.clubId } });
  await db.user.deleteMany({ where: { id: ctx.staffUserId } });
  await db.club.deleteMany({ where: { id: ctx.clubId } });
  console.log("✅ Cleanup complete");
}

// ── CLI ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--cleanup")) {
  const idx = args.indexOf("--cleanup") + 1;
  const file = args[idx];
  if (!file) {
    console.error("Usage: pnpm tsx seed-test-data.ts --cleanup <file>");
    process.exit(1);
  }
  const { readFileSync } = await import("node:fs");
  const ctx: SeedContext = JSON.parse(readFileSync(file, "utf-8"));
  await cleanupTestData(ctx);
} else if (args.includes("--output")) {
  const idx = args.indexOf("--output") + 1;
  const outputFile = args[idx] || "seed-context.json";
  const playerCount = parseInt(process.env.E2E_PLAYER_COUNT || "3", 10);
  const ctx = await seedTestData(playerCount);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outputFile, JSON.stringify(ctx, null, 2));
  console.log(`📝 Saved to ${outputFile}`);
  console.log(`\nNow run: cd e2e && npx playwright test`);
} else {
  // Run and print JSON to stdout
  const playerCount = parseInt(process.env.E2E_PLAYER_COUNT || "3", 10);
  const ctx = await seedTestData(playerCount);
  console.log(JSON.stringify(ctx, null, 2));
}
