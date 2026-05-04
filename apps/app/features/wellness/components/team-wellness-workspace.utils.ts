import type { PlayerStatus, RiskLevel } from "@repo/database";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";

const NAME_WORD_SPLIT_PATTERN = /\s+/;

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
    .split(NAME_WORD_SPLIT_PATTERN)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getRiskLabel(riskLevel: RiskLevel | null | undefined): string {
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

/** Clases Tailwind para semáforo de riesgo (tabla resumen / chips). */
export function getRiskValueClassName(
  riskLevel: RiskLevel | null | undefined
): string {
  switch (riskLevel) {
    case "CRITICAL":
    case "HIGH":
      return "font-semibold text-danger";
    case "MODERATE":
      return "font-medium text-premium";
    case "LOW":
      return "text-success";
    default:
      return "text-text-tertiary";
  }
}

export type WellnessTrafficTone = "bad" | "good" | "neutral" | "watch";

/** Clase de valor numérico wellness (semáforo). */
export function wellnessValueClass(tone: WellnessTrafficTone): string {
  switch (tone) {
    case "good":
      return "text-success";
    case "watch":
      return "text-premium";
    case "bad":
      return "text-danger";
    case "neutral":
      return "text-text-primary";
    default:
      return "text-text-primary";
  }
}

/** Clase de etiqueta pequeña acoplada al mismo estado. */
export function wellnessLabelClass(tone: WellnessTrafficTone): string {
  switch (tone) {
    case "good":
      return "text-success/90";
    case "watch":
      return "text-premium/90";
    case "bad":
      return "text-danger/90";
    case "neutral":
      return "text-text-tertiary";
    default:
      return "text-text-tertiary";
  }
}

/** Alerta si el valor es bajo (recuperación, energía). */
export function toneForLowerIsBetter(
  value: number | null | undefined,
  alertAtOrBelow: number | null | undefined
): WellnessTrafficTone {
  if (
    value === undefined ||
    value === null ||
    alertAtOrBelow === undefined ||
    alertAtOrBelow === null
  ) {
    return "neutral";
  }

  if (value <= alertAtOrBelow) {
    return "bad";
  }

  if (value <= alertAtOrBelow + 1) {
    return "watch";
  }

  return "good";
}

/** Alerta si el valor es alto (agujetas). */
export function toneForHigherIsWorse(
  value: number | null | undefined,
  alertAtOrAbove: number | null | undefined
): WellnessTrafficTone {
  if (
    value === undefined ||
    value === null ||
    alertAtOrAbove === undefined ||
    alertAtOrAbove === null
  ) {
    return "neutral";
  }

  if (value >= alertAtOrAbove) {
    return "bad";
  }

  if (value >= alertAtOrAbove - 1) {
    return "watch";
  }

  return "good";
}

/** Ratio completados / plantilla (pre o post). */
export function toneCompletionRatio(
  completed: number,
  total: number
): WellnessTrafficTone {
  if (total === 0) {
    return "neutral";
  }

  if (completed === total) {
    return "good";
  }

  if (completed === 0) {
    return "bad";
  }

  return "watch";
}

/** Formularios aún sin cerrar (pre + post). */
export function tonePendingWorkload(
  pending: number,
  total: number
): WellnessTrafficTone {
  if (total === 0) {
    return "neutral";
  }

  if (pending === 0) {
    return "good";
  }

  if (pending <= Math.ceil(total / 2)) {
    return "watch";
  }

  return "bad";
}

/** Densidad de alertas en plantilla (resumen agregado). */
export function toneAlertDensity(
  alertCount: number,
  totalPlayers: number
): WellnessTrafficTone {
  if (totalPlayers === 0) {
    return "neutral";
  }

  if (alertCount === 0) {
    return "good";
  }

  const heavyThreshold = Math.max(1, Math.ceil(totalPlayers / 3));

  if (alertCount >= heavyThreshold) {
    return "bad";
  }

  return "watch";
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
  if (!(entry && wellnessLimits)) {
    return [];
  }

  const alerts: string[] = [];

  if (
    typeof wellnessLimits.recovery === "number" &&
    entry.recovery !== null &&
    entry.recovery <= wellnessLimits.recovery
  ) {
    alerts.push("Recuperación");
  }

  if (
    typeof wellnessLimits.energy === "number" &&
    entry.energy !== null &&
    entry.energy <= wellnessLimits.energy
  ) {
    alerts.push("Energía");
  }

  if (
    typeof wellnessLimits.soreness === "number" &&
    entry.soreness !== null &&
    entry.soreness >= wellnessLimits.soreness
  ) {
    alerts.push("Agujetas");
  }

  if (
    typeof wellnessLimits.sleepHours === "number" &&
    entry.sleepHours !== null &&
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
  if (value === null) {
    return "—";
  }

  return value.toFixed(1);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum: number, value: number) => sum + value, 0) /
    values.length
  );
}

export function buildWellnessSummary(
  players: TeamWellnessPlayer[],
  wellnessLimits?: WellnessLimits | null
): TeamWellnessWorkspaceSummary {
  const todayEntries = players.flatMap((player) => player.entries);
  const recoveryValues = todayEntries
    .map((entry) => entry.recovery)
    .filter((value): value is number => typeof value === "number");
  const energyValues = todayEntries
    .map((entry) => entry.energy)
    .filter((value): value is number => typeof value === "number");
  const sorenessValues = todayEntries
    .map((entry) => entry.soreness)
    .filter((value): value is number => typeof value === "number");

  return {
    alertCount: players.filter((player) => {
      const state = getDailyPlayerState(player, wellnessLimits);
      return state === "ALERT";
    }).length,
    energyAverage: average(energyValues),
    pendingCount: players.filter((player) => {
      const entry = getLatestEntry(player);
      return !(entry?.preFilledAt && entry?.postFilledAt);
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
