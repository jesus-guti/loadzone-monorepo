/**
 * Evaluate reminder consent gates for QA players (JES-45 helpers only).
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "../age-band-policy";
import {
  PrismaClient,
  type PlayerReminderConsentState,
} from "../generated/client";
import { keys } from "../keys";
import {
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
} from "../reminder-consent";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(packageRoot, ".env") });
loadEnv({ path: join(packageRoot, ".env.local"), override: true });

neonConfig.webSocketConstructor = ws;
const database = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: keys().DATABASE_URL }),
});

function mayDeliverFromConsent(input: {
  canSubscribeOrManage: boolean;
  state: PlayerReminderConsentState;
  hasActiveSubscription: boolean;
  uiMode: string;
}): boolean {
  // Mirror packages/push-notifications/anti-nag mayDeliverPlayerReminder:
  // needs active sub + not blocked/opted-out/OFF.
  if (!input.hasActiveSubscription) {
    return false;
  }
  if (input.state === "GUARDIAN_BLOCKED" || input.state === "OPTED_OUT") {
    return false;
  }
  if (input.uiMode === "blocked") {
    return false;
  }
  return true;
}

async function gateFor(name: string): Promise<Record<string, unknown>> {
  const player = await database.player.findFirst({
    where: { name },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      ageBandOverride: true,
      reminderConsentState: true,
      team: {
        select: {
          timezone: true,
          ageBandPolicy: true,
          reminderConsentPolicy: true,
          club: { select: { ageBandPolicy: true } },
        },
      },
      subscriptions: { select: { id: true }, take: 1 },
    },
  });
  if (!player) {
    return { name, error: "missing" };
  }

  const effectiveAge = resolveEffectiveAgeBandPolicy({
    teamPolicy: player.team.ageBandPolicy,
    clubPolicy: player.team.club.ageBandPolicy,
  });
  const resolvedAge = resolveAgeBandPolicy({
    policy: effectiveAge.policy,
    policySource: effectiveAge.source,
    dateOfBirth: player.dateOfBirth,
    ageBandOverride: player.ageBandOverride,
    teamTimezone: player.team.timezone,
  });
  const { policy: reminderConsentPolicy } =
    resolveEffectiveReminderConsentPolicy({
      teamPolicy: player.team.reminderConsentPolicy,
    });

  const hasSub = player.subscriptions.length > 0;
  const decision = resolvePushConsent({
    resolvedAge,
    reminderConsentPolicy,
    playerConsentState:
      player.reminderConsentState as PlayerReminderConsentState,
    hasActiveSubscription: hasSub,
  });
  const mayDeliver = mayDeliverFromConsent({
    canSubscribeOrManage: decision.canSubscribe || decision.canOptOut,
    state: decision.state,
    hasActiveSubscription: hasSub,
    uiMode: decision.uiMode,
  });

  return {
    name: player.name,
    consent: player.reminderConsentState,
    bandKey: decision.bandKey,
    mode: decision.mode,
    uiMode: decision.uiMode,
    hasSubscription: hasSub,
    mayDeliver,
  };
}

async function main(): Promise<void> {
  const names = [
    "QA Guided OptedIn 12",
    "QA Guided GuardianBlocked 12",
    "QA Guided OptedOut 12",
    "QA Assisted 08",
  ];
  const rows = [];
  for (const name of names) {
    rows.push(await gateFor(name));
  }
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
