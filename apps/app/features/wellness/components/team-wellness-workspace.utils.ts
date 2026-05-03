import type { PlayerStatus, RiskLevel } from "@repo/database";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";

export type DailyPlayerState = "ALERT" | "COMPLETED" | "NOT_COMPLETED";

export type TeamWellnessWorkspaceSummary = {
  alertCount: number;
  energyAverage: number | null;
  pendingCount: number;
  postCompletedCount: number;
  preCompletedCount: number;
  recoveryAverage: number | null;
  sorenessAverage: number | null;
};

export function getLatestEntry(
  player: TeamWellnessPlayer
): TeamWellnessPlayer["entries"][number] | undefined {
  return player.entries[0];
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getRiskLabel(
  riskLevel: RiskLevel | null | undefined
): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "Crítico";
    case "HIGH":
      return "Alto";
    case "MODERATE":
      return "Moderado";
    case "LOW":
      return "Bajo";
    default:
      return "Sin datos";
  }
}

export function hasCriticalRisk(
  riskLevel: RiskLevel | null | undefined
): boolean {
  return riskLevel === "CRITICAL" || riskLevel === "HIGH";
}

export function getInjuryLabel(status: PlayerStatus): string | null {
  switch (status) {
    case "INJURED":
      return "Lesionado";
    case "ILL":
      return "Enfermo";
    default:
      return null;
  }
}

export function isPlayerActiveToday(player: TeamWellnessPlayer): boolean {
  const entry = getLatestEntry(player);
  return Boolean(entry?.preFilledAt || entry?.postFilledAt);
}

export function getWellnessAlerts(
  entry: TeamWellnessPlayer["entries"][number] | undefined,
  wellnessLimits?: WellnessLimits | null
): string[] {
  if (!entry || !wellnessLimits) {
    return [];
  }

  const alerts: string[] = [];

  if (
    wellnessLimits.recovery != null &&
    entry.recovery != null &&
    entry.recovery <= wellnessLimits.recovery
  ) {
    alerts.push("Recuperación");
  }

  if (
    wellnessLimits.energy != null &&
    entry.energy != null &&
    entry.energy <= wellnessLimits.energy
  ) {
    alerts.push("Energía");
  }

  if (
    wellnessLimits.soreness != null &&
    entry.soreness != null &&
    entry.soreness >= wellnessLimits.soreness
  ) {
    alerts.push("Agujetas");
  }

  if (
    wellnessLimits.sleepHours != null &&
    entry.sleepHours != null &&
    Number(entry.sleepHours) < wellnessLimits.sleepHours
  ) {
    alerts.push("Sueño");
  }

  return alerts;
}

export function getDailyPlayerState(
  player: TeamWellnessPlayer,
  wellnessLimits?: WellnessLimits | null
): DailyPlayerState {
  const entry = getLatestEntry(player);
  const riskLevel = player.stats[0]?.riskLevel;
  const hasWellnessAlert = getWellnessAlerts(entry, wellnessLimits).length > 0;

  if (
    entry?.physioAlert ||
    riskLevel === "HIGH" ||
    riskLevel === "CRITICAL" ||
    hasWellnessAlert
  ) {
    return "ALERT";
  }

  if (entry?.preFilledAt && entry?.postFilledAt) {
    return "COMPLETED";
  }

  return "NOT_COMPLETED";
}

export function formatAverage(value: number | null): string {
  if (value == null) {
    return "—";
  }

  return value.toFixed(1);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum: number, value: number) => sum + value, 0) / values.length;
}

export function buildWellnessSummary(
  players: TeamWellnessPlayer[],
  wellnessLimits?: WellnessLimits | null
): TeamWellnessWorkspaceSummary {
  const todayEntries = players.flatMap((player) => player.entries);
  const recoveryValues = todayEntries
    .map((entry) => entry.recovery)
    .filter((value): value is number => value != null);
  const energyValues = todayEntries
    .map((entry) => entry.energy)
    .filter((value): value is number => value != null);
  const sorenessValues = todayEntries
    .map((entry) => entry.soreness)
    .filter((value): value is number => value != null);

  return {
    alertCount: players.filter((player) => {
      const state = getDailyPlayerState(player, wellnessLimits);
      return state === "ALERT";
    }).length,
    energyAverage: average(energyValues),
    pendingCount: players.filter((player) => {
      const entry = getLatestEntry(player);
      return !entry?.preFilledAt || !entry?.postFilledAt;
    }).length,
    postCompletedCount: players.filter((player) =>
      Boolean(getLatestEntry(player)?.postFilledAt)
    ).length,
    preCompletedCount: players.filter((player) =>
      Boolean(getLatestEntry(player)?.preFilledAt)
    ).length,
    recoveryAverage: average(recoveryValues),
    sorenessAverage: average(sorenessValues),
  };
}
