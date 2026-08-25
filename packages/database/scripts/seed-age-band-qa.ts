/**
 * Idempotent QA seed for Age Band / parental / consent / care / streak manual testing.
 *
 * Targets whatever DATABASE_URL is in packages/database/.env(.local) — use a Neon
 * staging branch, never production.
 *
 * Usage:
 *   pnpm --filter @repo/database seed-age-band-qa
 *
 * Writes machine-readable context to:
 *   .scratch/qa-age-band/context.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import {
  DEFAULT_AGE_BAND_POLICY,
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
  type AgeBand,
} from "../age-band-policy";
import { ensureBaseFormTemplatesWithDb } from "../bootstrap/base-form-templates";
import { PrismaClient, type PlayerReminderConsentState } from "../generated/client";
import { keys } from "../keys";
import {
  DEFAULT_REMINDER_CONSENT_POLICY,
  reminderConsentBandKeyFor,
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
} from "../reminder-consent";
import { DEFAULT_NEW_TEAM_WELLNESS_LIMITS } from "../wellness-limits";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");
const repoRoot = join(packageRoot, "..", "..");

loadEnv({ path: join(packageRoot, ".env") });
loadEnv({ path: join(packageRoot, ".env.local"), override: true });

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: keys().DATABASE_URL });
const database = new PrismaClient({ adapter });

const CLUB_SLUG = "qa-age-band-staging";
const CLUB_NAME = "QA Age Band Staging";
const TEAM_NAME = "QA Parental Matrix";
const STAFF_EMAIL = "qa-staging@loadzone.local";
const STAFF_PASSWORD = "LoadZoneQa!staging1";
const STAFF_NAME = "QA Staging Staff";
const SESSION_TITLE_PREFIX = "[qa-age-band]";
const PLAYER_BASE_URL =
  process.env.QA_PLAYER_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3003";
const APP_BASE_URL =
  process.env.QA_APP_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/** Team policy: package defaults + youth Independent supervision ON for parental tests. */
const TEAM_AGE_BAND_POLICY = {
  ...DEFAULT_AGE_BAND_POLICY,
  independentYouthSupervisionEnabled: true,
};

type SeedPlayerSpec = {
  key: string;
  name: string;
  /** Whole years of age today; null → no DOB. */
  ageYears: number | null;
  ageBandOverride: AgeBand | null;
  reminderConsentState: PlayerReminderConsentState;
  /** Optional dorsal; cromo seal omitted when we leave this unset — always set in QA. */
  shirtNumber: number;
  /**
   * Recoverable streak days. `assisted` is 30 so local cromo shows stamp + holo
   * (Oro+). `guided` stays 3 for checklist D1 (Plata = plate, not holo).
   */
  currentStreak: number;
  longestStreak: number;
  caseIds: string[];
  notes: string;
};

const PLAYER_SPECS: SeedPlayerSpec[] = [
  {
    key: "assisted",
    name: "QA Assisted 08",
    ageYears: 8,
    ageBandOverride: null,
    reminderConsentState: "ELIGIBLE",
    shirtNumber: 10,
    currentStreak: 30,
    longestStreak: 30,
    caseIds: ["A1", "C1"],
    notes:
      "Assisted copy + presence; GUARDIAN_CONSENTS reminders. Cromo: dorsal 10 + Esmeralda/holo (30d).",
  },
  {
    key: "guided",
    name: "QA Guided 12",
    ageYears: 12,
    ageBandOverride: null,
    reminderConsentState: "ELIGIBLE",
    shirtNumber: 12,
    currentStreak: 3,
    longestStreak: 5,
    caseIds: ["A2", "C2", "B1", "B4"],
    notes: "Guided default; opt-in required for player push. Cromo: dorsal 12 + Plata/plate (3d).",
  },
  {
    key: "guided-opted-in",
    name: "QA Guided OptedIn 12",
    ageYears: 12,
    ageBandOverride: null,
    reminderConsentState: "OPTED_IN",
    shirtNumber: 8,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["C3", "C6"],
    notes: "Cron / anti-nag eligible once push subscribed",
  },
  {
    key: "guided-opted-out",
    name: "QA Guided OptedOut 12",
    ageYears: 12,
    ageBandOverride: null,
    reminderConsentState: "OPTED_OUT",
    shirtNumber: 22,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["C4"],
    notes: "No player reminders",
  },
  {
    key: "guided-blocked",
    name: "QA Guided GuardianBlocked 12",
    ageYears: 12,
    ageBandOverride: null,
    reminderConsentState: "GUARDIAN_BLOCKED",
    shirtNumber: 5,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["C4"],
    notes: "Guardian blocked ledger state",
  },
  {
    key: "independent-youth",
    name: "QA Independent Youth 15",
    ageYears: 15,
    ageBandOverride: null,
    reminderConsentState: "ELIGIBLE",
    shirtNumber: 15,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["A3", "C5-youth"],
    notes: "Independent 14–15; parental supervision ON via team policy",
  },
  {
    key: "independent-majority",
    name: "QA Independent Majority 18",
    ageYears: 18,
    ageBandOverride: null,
    reminderConsentState: "ELIGIBLE",
    shirtNumber: 9,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["A4", "C5"],
    notes: "Independent majority; no care silent note; guardian miss off",
  },
  {
    key: "override-assisted",
    name: "QA Override Assisted",
    ageYears: 12,
    ageBandOverride: "ASSISTED",
    reminderConsentState: "ASSISTED_GUARDIAN_GRANTED",
    shirtNumber: 1,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["A5"],
    notes: "DOB guided-age + ASSISTED override",
  },
  {
    key: "unassigned",
    name: "QA Unassigned NoDOB",
    ageYears: null,
    ageBandOverride: null,
    reminderConsentState: "ELIGIBLE",
    shirtNumber: 99,
    currentStreak: 0,
    longestStreak: 0,
    caseIds: ["A6"],
    notes: "UNASSIGNED → Focus fallback guided",
  },
];

function getSeasonWindow(now: Date): {
  seasonName: string;
  startDate: Date;
  endDate: Date;
  preSeasonEnd: Date;
} {
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return {
    seasonName: `${startYear}/${endYear}`,
    startDate: new Date(Date.UTC(startYear, 6, 1)),
    endDate: new Date(Date.UTC(endYear, 5, 30)),
    preSeasonEnd: new Date(Date.UTC(startYear, 7, 31)),
  };
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Civil calendar YYYY-MM-DD in local timezone (matches startOfLocalDay). */
function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDateTime(day: Date, hour: number, minute: number): Date {
  const x = new Date(day);
  x.setHours(hour, minute, 0, 0);
  return x;
}

/** Calendar DOB for `ageYears` complete as of `today` (local). */
function dateOfBirthForAge(ageYears: number, today: Date): Date {
  const y = today.getFullYear() - ageYears;
  const m = today.getMonth();
  const d = Math.min(today.getDate(), 28);
  return new Date(Date.UTC(y, m, d));
}

async function main(): Promise<void> {
  const now = new Date();
  const today = startOfLocalDay(now);

  await ensureBaseFormTemplatesWithDb(database);

  const club = await database.club.upsert({
    where: { slug: CLUB_SLUG },
    create: {
      name: CLUB_NAME,
      slug: CLUB_SLUG,
      ageBandPolicy: DEFAULT_AGE_BAND_POLICY,
    },
    update: {
      name: CLUB_NAME,
      ageBandPolicy: DEFAULT_AGE_BAND_POLICY,
    },
    select: { id: true, name: true, slug: true },
  });

  const passwordHash = await hash(STAFF_PASSWORD, 12);
  const staffUser = await database.user.upsert({
    where: { email: STAFF_EMAIL },
    create: {
      email: STAFF_EMAIL,
      name: STAFF_NAME,
      passwordHash,
      platformRole: "USER",
    },
    update: {
      name: STAFF_NAME,
      passwordHash,
    },
    select: { id: true, email: true },
  });

  const membership = await database.membership.upsert({
    where: {
      userId_clubId_role: {
        userId: staffUser.id,
        clubId: club.id,
        role: "COORDINATOR",
      },
    },
    create: {
      userId: staffUser.id,
      clubId: club.id,
      role: "COORDINATOR",
      hasAllTeams: true,
    },
    update: {
      hasAllTeams: true,
    },
    select: { id: true },
  });

  const team = await database.team.upsert({
    where: {
      clubId_name: {
        clubId: club.id,
        name: TEAM_NAME,
      },
    },
    create: {
      clubId: club.id,
      name: TEAM_NAME,
      category: "QA · age bands / parental / care",
      timezone: "Europe/Madrid",
      wellnessLimits: DEFAULT_NEW_TEAM_WELLNESS_LIMITS,
      ageBandPolicy: TEAM_AGE_BAND_POLICY,
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
    },
    update: {
      category: "QA · age bands / parental / care",
      timezone: "Europe/Madrid",
      wellnessLimits: DEFAULT_NEW_TEAM_WELLNESS_LIMITS,
      ageBandPolicy: TEAM_AGE_BAND_POLICY,
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
    },
    select: { id: true, name: true },
  });

  await database.membershipTeam.upsert({
    where: {
      membershipId_teamId: {
        membershipId: membership.id,
        teamId: team.id,
      },
    },
    create: {
      membershipId: membership.id,
      teamId: team.id,
    },
    update: {},
  });

  const { seasonName, startDate, endDate, preSeasonEnd } = getSeasonWindow(now);
  const season = await database.season.upsert({
    where: {
      teamId_name: {
        teamId: team.id,
        name: seasonName,
      },
    },
    create: {
      teamId: team.id,
      name: seasonName,
      startDate,
      endDate,
      preSeasonEnd,
    },
    update: {
      startDate,
      endDate,
      preSeasonEnd,
    },
    select: { id: true, name: true },
  });

  const [preTemplate, postTemplate] = await Promise.all([
    database.formTemplate.findUnique({
      where: { code: "system-wellness-pre" },
      select: { id: true },
    }),
    database.formTemplate.findUnique({
      where: { code: "system-rpe-post" },
      select: { id: true },
    }),
  ]);

  if (!preTemplate || !postTemplate) {
    throw new Error("System form templates missing after ensureBaseFormTemplatesWithDb");
  }

  for (const fillMoment of ["PRE_SESSION", "POST_SESSION"] as const) {
    const templateId =
      fillMoment === "PRE_SESSION" ? preTemplate.id : postTemplate.id;
    const existing = await database.formAssignment.findFirst({
      where: { teamId: team.id, fillMoment },
      select: { id: true },
    });
    if (!existing) {
      await database.formAssignment.create({
        data: { teamId: team.id, templateId, fillMoment },
      });
    }
  }

  const effectiveAge = resolveEffectiveAgeBandPolicy({
    teamPolicy: TEAM_AGE_BAND_POLICY,
    clubPolicy: DEFAULT_AGE_BAND_POLICY,
  });
  const { policy: reminderPolicy } = resolveEffectiveReminderConsentPolicy({
    teamPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
  });

  const playersOut: Array<{
    key: string;
    id: string;
    name: string;
    token: string;
    url: string;
    dateOfBirth: string | null;
    ageBandOverride: AgeBand | null;
    reminderConsentState: PlayerReminderConsentState;
    resolvedAgeBand: string;
    parentalSupervisionActive: boolean;
    consentBandKey: string;
    pushUiMode: string;
    caseIds: string[];
    notes: string;
  }> = [];

  for (const spec of PLAYER_SPECS) {
    const dob =
      spec.ageYears === null ? null : dateOfBirthForAge(spec.ageYears, today);

    const existing = await database.player.findFirst({
      where: { teamId: team.id, name: spec.name },
      select: { id: true, token: true },
    });

    const row = existing
      ? await database.player.update({
          where: { id: existing.id },
          data: {
            dateOfBirth: dob,
            ageBandOverride: spec.ageBandOverride,
            reminderConsentState: spec.reminderConsentState,
            isArchived: false,
            status: "AVAILABLE",
            streakSeasonId: season.id,
            shirtNumber: spec.shirtNumber,
            currentStreak: spec.currentStreak,
            longestStreak: spec.longestStreak,
          },
          select: {
            id: true,
            name: true,
            token: true,
            dateOfBirth: true,
            ageBandOverride: true,
            reminderConsentState: true,
          },
        })
      : await database.player.create({
          data: {
            teamId: team.id,
            name: spec.name,
            dateOfBirth: dob,
            ageBandOverride: spec.ageBandOverride,
            reminderConsentState: spec.reminderConsentState,
            status: "AVAILABLE",
            streakSeasonId: season.id,
            shirtNumber: spec.shirtNumber,
            currentStreak: spec.currentStreak,
            longestStreak: spec.longestStreak,
          },
          select: {
            id: true,
            name: true,
            token: true,
            dateOfBirth: true,
            ageBandOverride: true,
            reminderConsentState: true,
          },
        });

    const resolved = resolveAgeBandPolicy({
      policy: effectiveAge.policy,
      policySource: effectiveAge.source,
      teamTimezone: "Europe/Madrid",
      dateOfBirth: row.dateOfBirth,
      ageBandOverride: row.ageBandOverride as AgeBand | null,
      now: today,
    });

    const consent = resolvePushConsent({
      resolvedAge: resolved,
      reminderConsentPolicy: reminderPolicy,
      playerConsentState: row.reminderConsentState as PlayerReminderConsentState,
      hasActiveSubscription: false,
    });

    playersOut.push({
      key: spec.key,
      id: row.id,
      name: row.name,
      token: row.token,
      url: `${PLAYER_BASE_URL}/${row.token}`,
      dateOfBirth: row.dateOfBirth
        ? row.dateOfBirth.toISOString().slice(0, 10)
        : null,
      ageBandOverride: row.ageBandOverride as AgeBand | null,
      reminderConsentState:
        row.reminderConsentState as PlayerReminderConsentState,
      resolvedAgeBand: resolved.ageBand,
      parentalSupervisionActive: resolved.parentalSupervisionActive,
      consentBandKey: reminderConsentBandKeyFor(
        resolved.ageBand,
        resolved.ageYearsComplete,
        resolved.policy
      ),
      pushUiMode: consent.uiMode,
      caseIds: spec.caseIds,
      notes: spec.notes,
    });
  }

  await database.teamSession.deleteMany({
    where: {
      teamId: team.id,
      title: { startsWith: SESSION_TITLE_PREFIX },
    },
  });

  const plannedDays = [0, 1, -2, -4, -7].map((offset) => {
    const day = startOfLocalDay(today);
    day.setDate(day.getDate() + offset);
    return day;
  });

  const sessionsOut: Array<{ id: string; day: string; title: string }> = [];
  for (const day of plannedDays) {
    const isPast = day.getTime() < today.getTime();
    const isToday = day.getTime() === today.getTime();
    const startsAt = localDateTime(day, isToday ? 18 : 18, 0);
    const endsAt = localDateTime(day, 20, 0);
    const title = `${SESSION_TITLE_PREFIX} Entreno · ${formatLocalYmd(day)}`;
    const session = await database.teamSession.create({
      data: {
        clubId: club.id,
        teamId: team.id,
        title,
        type: "TRAINING",
        status: isPast ? "COMPLETED" : "SCHEDULED",
        startsAt,
        endsAt,
        timezone: "Europe/Madrid",
        appliesToAllPlayers: true,
      },
      select: { id: true, title: true, startsAt: true },
    });
    sessionsOut.push({
      id: session.id,
      day: formatLocalYmd(day),
      title: session.title,
    });
  }

  const outDir = join(repoRoot, ".scratch", "qa-age-band");
  mkdirSync(outDir, { recursive: true });

  const context = {
    seededAt: now.toISOString(),
    club: { id: club.id, name: club.name, slug: club.slug },
    team: { id: team.id, name: team.name },
    season: { id: season.id, name: season.name },
    staff: {
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
      appSignInUrl: `${APP_BASE_URL}/sign-in`,
      appHomeUrl: APP_BASE_URL,
    },
    urls: {
      app: APP_BASE_URL,
      player: PLAYER_BASE_URL,
      settings: `${APP_BASE_URL}/settings`,
      players: `${APP_BASE_URL}/players`,
      wellness: `${APP_BASE_URL}/wellness`,
    },
    policy: {
      ageBand: TEAM_AGE_BAND_POLICY,
      reminderConsent: DEFAULT_REMINDER_CONSENT_POLICY,
      wellnessLimits: DEFAULT_NEW_TEAM_WELLNESS_LIMITS,
    },
    sessions: sessionsOut,
    players: playersOut,
    checklist: [
      "A1 Assisted token → presence + short copy",
      "A2 Guided token → plain copy, no assisted presence",
      "A3 Independent youth → denser copy; parentalSupervisionActive true",
      "A4 Independent majority → no care silent note on high soreness",
      "A5 Override Assisted → behaves Assisted despite DOB 12y",
      "A6 Unassigned → Focus guided fallback",
      "B1 Guided: soreness ≥4 → care note + CareAlertDispatch CARE_RELEVANT_WELLNESS",
      "B2 Injury report path → INJURY_PAIN ledger",
      "B3 Repeat B1 same day → rate-limited (one per class)",
      "B4 Green check-in → no care alert",
      "C2/C3 Push prompt modes per consent state",
      "D1 Guided player has currentStreak=3 chip",
      "D2 Assisted player cromo: dorsal 10 + Esmeralda holographic foil (30d)",
      "E1 Staff /settings age-band + reminder consent fields",
      "E2 Staff /players edit shows DOB / override / resolved band",
    ],
  };

  const contextPath = join(outDir, "context.json");
  writeFileSync(contextPath, `${JSON.stringify(context, null, 2)}\n`, "utf8");

  const sessionMd = `# QA Age Band staging session

Seeded: ${context.seededAt}
Club: **${club.name}** (\`${club.slug}\`) · Team: **${team.name}** · Season: ${season.name}

## Staff login

- URL: ${APP_BASE_URL}/sign-in
- Email: \`${STAFF_EMAIL}\`
- Password: \`${STAFF_PASSWORD}\`

## Player URLs

| Key | Cases | Resolved | URL |
|---|---|---|---|
${playersOut
  .map(
    (p) =>
      `| ${p.key} | ${p.caseIds.join(", ")} | ${p.resolvedAgeBand} | ${p.url} |`
  )
  .join("\n")}

## Machine context

Tokens + full matrix: \`.scratch/qa-age-band/context.json\` (gitignored).

Re-seed:

\`\`\`bash
pnpm --filter @repo/database seed-age-band-qa
\`\`\`
`;

  writeFileSync(join(outDir, "SESSION.md"), sessionMd, "utf8");

  console.log("\n✅ QA age-band seed ready");
  console.log(`   Club: ${club.name} (${club.slug})`);
  console.log(`   Team: ${team.name}`);
  console.log(`   Staff: ${STAFF_EMAIL} / ${STAFF_PASSWORD}`);
  console.log(`   App:   ${APP_BASE_URL}/sign-in`);
  console.log(`   Context: ${contextPath}`);
  console.log("\nPlayers:");
  for (const p of playersOut) {
    console.log(
      `   - [${p.caseIds.join(",")}] ${p.name} → ${p.resolvedAgeBand} · ${p.url}`
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
