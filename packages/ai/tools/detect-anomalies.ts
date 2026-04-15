import { tool } from "ai";
import { database } from "@repo/database";
import { z } from "zod";

type Anomaly = {
  playerId: string;
  playerName: string;
  type: string;
  severity: "warning" | "critical";
  description: string;
};

export const detectAnomalies = tool({
  description:
    "Detect anomalies and concerning patterns in team wellness data. Checks for sustained RPE spikes, TQR drops, poor sleep, and ACWR danger zones.",
  inputSchema: z.object({
    teamId: z.string().describe("The team ID to check"),
    seasonId: z.string().describe("The season ID to filter by"),
  }),
  execute: async ({ teamId, seasonId }) => {
    const players = await database.player.findMany({
      where: { teamId, isArchived: false },
      select: {
        id: true,
        name: true,
        entries: {
          where: { seasonId },
          orderBy: { date: "desc" },
          take: 7,
          select: {
            date: true,
            recovery: true,
            energy: true,
            soreness: true,
            sleepHours: true,
            rpe: true,
            duration: true,
          },
        },
        stats: {
          where: { seasonId },
          orderBy: { date: "desc" },
          take: 3,
          select: {
            acwr: true,
            riskLevel: true,
          },
        },
      },
    });

    const anomalies: Anomaly[] = [];

    for (const player of players) {
      const recentRpe = player.entries
        .filter((e) => e.rpe != null)
        .map((e) => e.rpe as number);

      if (
        recentRpe.length >= 3 &&
        recentRpe.slice(0, 3).every((v) => v >= 8)
      ) {
        anomalies.push({
          playerId: player.id,
          playerName: player.name,
          type: "HIGH_RPE_SUSTAINED",
          severity: "critical",
          description: `RPE >= 8 durante 3+ días consecutivos (${recentRpe.slice(0, 3).join(", ")})`,
        });
      }

      const recentRecovery = player.entries
        .filter((e) => e.recovery != null)
        .map((e) => e.recovery as number);

      if (
        recentRecovery.length >= 3 &&
        recentRecovery.slice(0, 3).every((v) => v <= 4)
      ) {
        anomalies.push({
          playerId: player.id,
          playerName: player.name,
          type: "LOW_RECOVERY_SUSTAINED",
          severity: "warning",
          description: `Recuperación <= 4 durante 3+ días (${recentRecovery.slice(0, 3).join(", ")})`,
        });
      }

      const recentSleep = player.entries
        .filter((e) => e.sleepHours != null)
        .map((e) => Number(e.sleepHours));

      if (
        recentSleep.length >= 3 &&
        recentSleep.slice(0, 3).every((v) => v < 6)
      ) {
        anomalies.push({
          playerId: player.id,
          playerName: player.name,
          type: "POOR_SLEEP",
          severity: "warning",
          description: `Menos de 6 horas de sueño durante 3+ días (${recentSleep.slice(0, 3).map((v) => v.toFixed(1)).join(", ")}h)`,
        });
      }

      const acwrValues = player.stats
        .filter((s) => s.acwr != null)
        .map((s) => Number(s.acwr));

      if (acwrValues.length > 0 && acwrValues[0] >= 1.5) {
        anomalies.push({
          playerId: player.id,
          playerName: player.name,
          type: "ACWR_DANGER",
          severity: acwrValues[0] >= 2.0 ? "critical" : "warning",
          description: `ACWR en zona de riesgo: ${acwrValues[0].toFixed(2)}`,
        });
      }

      if (
        recentRpe.length >= 2 &&
        recentRecovery.length >= 2 &&
        recentRpe[0] >= 7 &&
        recentRecovery[0] <= 3
      ) {
        anomalies.push({
          playerId: player.id,
          playerName: player.name,
          type: "HIGH_LOAD_LOW_RECOVERY",
          severity: "critical",
          description: `Alta carga (RPE ${recentRpe[0]}) con baja recuperación (${recentRecovery[0]}/10)`,
        });
      }
    }

    return {
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter((a) => a.severity === "critical").length,
      warningCount: anomalies.filter((a) => a.severity === "warning").length,
      anomalies,
    };
  },
});
