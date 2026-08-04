/**
 * Prepare reminder cron QA: fake PushSubscription + move today's session
 * into the pre-reminder lookback window. Does not send real web-push crypto.
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";
import { PrismaClient } from "../generated/client";
import { keys } from "../keys";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(packageRoot, ".env") });
loadEnv({ path: join(packageRoot, ".env.local"), override: true });

neonConfig.webSocketConstructor = ws;
const database = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: keys().DATABASE_URL }),
});

async function main(): Promise<void> {
  const optedIn = await database.player.findFirst({
    where: { name: "QA Guided OptedIn 12" },
    select: { id: true, reminderConsentState: true, token: true },
  });
  const blocked = await database.player.findFirst({
    where: { name: "QA Guided GuardianBlocked 12" },
    select: { id: true, reminderConsentState: true },
  });
  if (!optedIn || !blocked) {
    throw new Error("QA players missing — run seed-age-band-qa first");
  }

  await database.player.update({
    where: { id: optedIn.id },
    data: { reminderConsentState: "OPTED_IN" },
  });

  const endpoint = `https://qa.local/push/${optedIn.id}`;
  await database.pushSubscription.upsert({
    where: { endpoint },
    create: {
      playerId: optedIn.id,
      endpoint,
      p256dh: "qa-p256dh",
      auth: "qa-auth",
    },
    update: {
      playerId: optedIn.id,
      p256dh: "qa-p256dh",
      auth: "qa-auth",
    },
  });

  // Blocked player also gets a subscription so consent gate is the only blocker.
  const blockedEndpoint = `https://qa.local/push/${blocked.id}`;
  await database.pushSubscription.upsert({
    where: { endpoint: blockedEndpoint },
    create: {
      playerId: blocked.id,
      endpoint: blockedEndpoint,
      p256dh: "qa-p256dh",
      auth: "qa-auth",
    },
    update: { playerId: blocked.id },
  });

  const session = await database.teamSession.findFirst({
    where: {
      title: { startsWith: "[qa-age-band]" },
      status: "SCHEDULED",
    },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, startsAt: true, teamId: true },
  });
  if (!session) {
    throw new Error("No QA scheduled session");
  }

  // Pre-reminder default 120 min; place startsAt ~115 min ahead so due now.
  const now = new Date();
  const startsAt = new Date(now.getTime() + 115 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  await database.teamSession.update({
    where: { id: session.id },
    data: { startsAt, endsAt },
  });

  // Clear prior automated dispatches for clean cron.
  await database.pushDispatch.deleteMany({
    where: { teamSessionId: session.id, origin: "AUTOMATED" },
  });

  console.log(
    JSON.stringify(
      {
        optedInId: optedIn.id,
        blockedId: blocked.id,
        sessionId: session.id,
        sessionTitle: session.title,
        startsAt: startsAt.toISOString(),
      },
      null,
      2
    )
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
