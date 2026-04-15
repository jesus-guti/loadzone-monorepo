import { tool } from "ai";
import { database } from "@repo/database";
import { z } from "zod";

export const analyzeTeamWellness = tool({
  description:
    "Analyze the overall wellness status of a team for a given season. Returns player stats, risk levels, and trends.",
  inputSchema: z.object({
    teamId: z.string().describe("The team ID to analyze"),
    seasonId: z.string().describe("The season ID to filter by"),
  }),
  execute: async ({ teamId, seasonId }) => {
    const players = await database.player.findMany({
      where: { teamId, isArchived: false },
      select: {
        id: true,
        name: true,
        status: true,
        currentStreak: true,
        stats: {
          where: { seasonId },
          orderBy: { date: "desc" },
          take: 7,
          select: {
            date: true,
            acwr: true,
            riskLevel: true,
            tqrAvg7d: true,
            rpeAvg7d: true,
            srpe: true,
          },
        },
        entries: {
          where: { seasonId },
          orderBy: { date: "desc" },
          take: 1,
          select: {
            date: true,
            recovery: true,
            energy: true,
            soreness: true,
            sleepHours: true,
            sleepQuality: true,
            rpe: true,
            physioAlert: true,
          },
        },
      },
    });

    const summary = players.map((player) => {
      const latestStats = player.stats[0];
      const latestEntry = player.entries[0];

      return {
        name: player.name,
        status: player.status,
        streak: player.currentStreak,
        riskLevel: latestStats?.riskLevel ?? "unknown",
        acwr: latestStats?.acwr ? Number(latestStats.acwr) : null,
        tqrAvg7d: latestStats?.tqrAvg7d ? Number(latestStats.tqrAvg7d) : null,
        rpeAvg7d: latestStats?.rpeAvg7d ? Number(latestStats.rpeAvg7d) : null,
        lastRecovery: latestEntry?.recovery,
        lastEnergy: latestEntry?.energy,
        lastSoreness: latestEntry?.soreness,
        lastSleepHours: latestEntry?.sleepHours
          ? Number(latestEntry.sleepHours)
          : null,
        physioAlert: latestEntry?.physioAlert ?? false,
      };
    });

    const highRiskCount = summary.filter(
      (p) => p.riskLevel === "high" || p.riskLevel === "critical"
    ).length;

    const physioAlerts = summary.filter((p) => p.physioAlert).length;

    return {
      totalPlayers: players.length,
      highRiskCount,
      physioAlerts,
      players: summary,
    };
  },
});
