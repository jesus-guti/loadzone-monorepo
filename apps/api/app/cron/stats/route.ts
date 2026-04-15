import { database, type RiskLevel } from "@repo/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function determineRiskLevel(acwr: number | null): RiskLevel {
  if (acwr === null) return "LOW";
  if (acwr >= 2.0) return "CRITICAL";
  if (acwr >= 1.5) return "HIGH";
  if (acwr >= 1.3) return "MODERATE";
  return "LOW";
}

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSeasons = await database.season.findMany({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
      },
      select: {
        id: true,
        teamId: true,
      },
    });

    let processedCount = 0;

    for (const season of activeSeasons) {
      const players = await database.player.findMany({
        where: {
          teamId: season.teamId,
          isArchived: false,
          status: { not: "UNAVAILABLE" },
        },
        select: { id: true },
      });

      for (const player of players) {
        const todayEntry = await database.dailyEntry.findUnique({
          where: {
            playerId_date: { playerId: player.id, date: today },
          },
          select: {
            rpe: true,
            duration: true,
          },
        });

        const srpe =
          todayEntry?.rpe != null && todayEntry?.duration != null
            ? todayEntry.rpe * todayEntry.duration
            : null;

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const twentyEightDaysAgo = new Date(today);
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        const acuteEntries = await database.dailyEntry.findMany({
          where: {
            playerId: player.id,
            date: { gte: sevenDaysAgo, lte: today },
            rpe: { not: null },
            duration: { not: null },
          },
          select: { rpe: true, duration: true },
        });

        const chronicEntries = await database.dailyEntry.findMany({
          where: {
            playerId: player.id,
            date: { gte: twentyEightDaysAgo, lte: today },
            rpe: { not: null },
            duration: { not: null },
          },
          select: { rpe: true, duration: true },
        });

        const acuteLoad = acuteEntries.reduce(
          (sum, e) => sum + (e.rpe ?? 0) * (e.duration ?? 0),
          0
        );

        const chronicLoad =
          chronicEntries.length > 0
            ? chronicEntries.reduce(
                (sum, e) => sum + (e.rpe ?? 0) * (e.duration ?? 0),
                0
              ) / 4
            : null;

        const acwr =
          chronicLoad != null && chronicLoad > 0
            ? acuteLoad / chronicLoad
            : null;

        const tqrEntries = await database.dailyEntry.findMany({
          where: {
            playerId: player.id,
            date: { gte: sevenDaysAgo, lte: today },
            recovery: { not: null },
          },
          select: { recovery: true },
        });

        const rpeOnlyEntries = await database.dailyEntry.findMany({
          where: {
            playerId: player.id,
            date: { gte: sevenDaysAgo, lte: today },
            rpe: { not: null },
          },
          select: { rpe: true },
        });

        const tqrAvg7d =
          tqrEntries.length > 0
            ? tqrEntries.reduce((sum, e) => sum + (e.recovery ?? 0), 0) /
              tqrEntries.length
            : null;

        const rpeAvg7d =
          rpeOnlyEntries.length > 0
            ? rpeOnlyEntries.reduce((sum, e) => sum + (e.rpe ?? 0), 0) /
              rpeOnlyEntries.length
            : null;

        const riskLevel = determineRiskLevel(acwr);

        await database.playerDailyStats.upsert({
          where: {
            playerId_date: { playerId: player.id, date: today },
          },
          create: {
            date: today,
            playerId: player.id,
            seasonId: season.id,
            srpe,
            acuteLoad,
            chronicLoad,
            acwr,
            tqrAvg7d,
            rpeAvg7d,
            riskLevel,
          },
          update: {
            srpe,
            acuteLoad,
            chronicLoad,
            acwr,
            tqrAvg7d,
            rpeAvg7d,
            riskLevel,
            computedAt: new Date(),
          },
        });

        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      seasons: activeSeasons.length,
    });
  } catch (error) {
    console.error("Stats cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
