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
  const name = process.argv[2] ?? "QA Guided 12";
  const player = await database.player.findFirst({
    where: { name },
    select: {
      id: true,
      name: true,
      currentStreak: true,
      reminderConsentState: true,
    },
  });
  if (!player) {
    console.log(JSON.stringify({ error: "player not found", name }));
    return;
  }
  const [entry, alerts, pushes, injuryCount] = await Promise.all([
    database.dailyEntry.findFirst({
      where: { playerId: player.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        soreness: true,
        recovery: true,
        energy: true,
        sleepHours: true,
        sleepQuality: true,
      },
    }),
    database.careAlertDispatch.findMany({
      where: { playerId: player.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    database.pushDispatch.findMany({
      where: { playerId: player.id },
      orderBy: { sentAt: "desc" },
      take: 5,
      select: {
        id: true,
        kind: true,
        origin: true,
        sentAt: true,
      },
    }),
    database.injuryReport.count({ where: { playerId: player.id } }),
  ]);
  console.log(
    JSON.stringify({ player, entry, alerts, pushes, injuryCount }, null, 2)
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
