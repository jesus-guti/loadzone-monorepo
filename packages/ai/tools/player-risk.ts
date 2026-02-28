import { tool } from "ai";
import { database } from "@repo/database";
import { z } from "zod";

export const getPlayerRiskProfile = tool({
  description:
    "Get detailed risk profile for a specific player including ACWR trend, training load history, and recovery metrics.",
  parameters: z.object({
    playerId: z.string().describe("The player ID to analyze"),
  }),
  execute: async ({ playerId }) => {
    const player = await database.player.findUnique({
      where: { id: playerId },
      select: {
        name: true,
        status: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!player) return { error: "Player not found" };

    const stats = await database.playerDailyStats.findMany({
      where: { playerId },
      orderBy: { date: "desc" },
      take: 28,
      select: {
        date: true,
        srpe: true,
        acwr: true,
        acuteLoad: true,
        chronicLoad: true,
        riskLevel: true,
        tqrAvg7d: true,
        rpeAvg7d: true,
      },
    });

    const entries = await database.dailyEntry.findMany({
      where: { playerId },
      orderBy: { date: "desc" },
      take: 14,
      select: {
        date: true,
        recovery: true,
        energy: true,
        soreness: true,
        sleepHours: true,
        sleepQuality: true,
        rpe: true,
        duration: true,
        physioAlert: true,
      },
    });

    const acwrTrend = stats.slice(0, 7).map((s) => ({
      date: s.date,
      acwr: s.acwr ? Number(s.acwr) : null,
      riskLevel: s.riskLevel,
    }));

    const acwrValues = acwrTrend
      .map((s) => s.acwr)
      .filter((v): v is number => v !== null);

    const avgAcwr =
      acwrValues.length > 0
        ? acwrValues.reduce((a, b) => a + b, 0) / acwrValues.length
        : null;

    const sleepData = entries
      .filter((e) => e.sleepHours != null)
      .map((e) => Number(e.sleepHours));

    const avgSleep =
      sleepData.length > 0
        ? sleepData.reduce((a, b) => a + b, 0) / sleepData.length
        : null;

    const sorenessValues = entries
      .filter((e) => e.soreness != null)
      .map((e) => e.soreness as number);

    const highSorenessCount = sorenessValues.filter((v) => v >= 4).length;

    return {
      player: player.name,
      status: player.status,
      streak: player.currentStreak,
      longestStreak: player.longestStreak,
      currentRiskLevel: stats[0]?.riskLevel ?? "unknown",
      avgAcwr7d: avgAcwr?.toFixed(2) ?? "N/A",
      avgSleep14d: avgSleep?.toFixed(1) ?? "N/A",
      highSorenessCount14d: highSorenessCount,
      physioAlertsRecent: entries.filter((e) => e.physioAlert).length,
      acwrTrend,
      recentEntries: entries.slice(0, 7),
    };
  },
});
