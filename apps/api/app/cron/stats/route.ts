import { database, determineRiskLevel } from "@repo/database";
import { resolveLoadMinutes } from "@repo/database/session-minutes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
            teamSession: {
              select: {
                type: true,
                sharedMinutes: true,
                attendance: {
                  where: { playerId: player.id },
                  select: { minutesPlayed: true },
                },
              },
            },
          },
        });

        const session = todayEntry?.teamSession ?? null;
        const minutes = resolveLoadMinutes({
          sessionType: session?.type ?? null,
          minutesPlayed: session?.attendance[0]?.minutesPlayed ?? null,
          sharedMinutes: session?.sharedMinutes ?? null,
          checkInDuration: todayEntry?.duration ?? null,
        });
        const srpe =
          todayEntry !== null && todayEntry.rpe !== null && minutes !== null
            ? todayEntry.rpe * minutes
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
          },
          select: {
            rpe: true,
            duration: true,
            teamSession: {
              select: {
                type: true,
                sharedMinutes: true,
                attendance: {
                  where: { playerId: player.id },
                  select: { minutesPlayed: true },
                },
              },
            },
          },
        });

        const chronicEntries = await database.dailyEntry.findMany({
          where: {
            playerId: player.id,
            date: { gte: twentyEightDaysAgo, lte: today },
            rpe: { not: null },
          },
          select: {
            rpe: true,
            duration: true,
            teamSession: {
              select: {
                type: true,
                sharedMinutes: true,
                attendance: {
                  where: { playerId: player.id },
                  select: { minutesPlayed: true },
                },
              },
            },
          },
        });

        const loadOf = (entry: (typeof acuteEntries)[number]): number => {
          const resolved = resolveLoadMinutes({
            sessionType: entry.teamSession?.type ?? null,
            minutesPlayed:
              entry.teamSession?.attendance[0]?.minutesPlayed ?? null,
            sharedMinutes: entry.teamSession?.sharedMinutes ?? null,
            checkInDuration: entry.duration,
          });
          if (entry.rpe === null || resolved === null) {
            return 0;
          }
          return entry.rpe * resolved;
        };

        const acuteLoad = acuteEntries.reduce(
          (sum, entry) => sum + loadOf(entry),
          0
        );

        const chronicLoad =
          chronicEntries.length > 0
            ? chronicEntries.reduce((sum, entry) => sum + loadOf(entry), 0) / 4
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
