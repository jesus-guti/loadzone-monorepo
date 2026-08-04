/**
 * Team.wellnessLimits policy + immediate wellness red-flag evaluation.
 * ACWR / sustained-load thresholds stay in risk-thresholds.ts (staff-only, never here).
 */

import { z } from "zod";

export const WELLNESS_METRICS = [
  "recovery",
  "energy",
  "soreness",
  "sleepHours",
  "sleepQuality",
] as const;

export type WellnessMetric = (typeof WELLNESS_METRICS)[number];

/** Product-locked: only soreness feeds Guardian Care Alerts (JES-47). */
export const CARE_RELEVANT_WELLNESS_METRICS = new Set<WellnessMetric>([
  "soreness",
]);

/** Settings placeholders (null remains disabled until staff opts in). */
export const WELLNESS_LIMIT_PLACEHOLDERS = {
  recovery: 4,
  energy: 2,
  soreness: 4,
  sleepHours: 6,
  sleepQuality: 2,
} as const satisfies Record<WellnessMetric, number>;

/** Optional seed on new team create so care alerts can fire without a settings visit. */
export const DEFAULT_NEW_TEAM_WELLNESS_LIMITS = {
  recovery: null,
  energy: null,
  soreness: 4,
  sleepHours: null,
  sleepQuality: null,
} as const satisfies Record<WellnessMetric, number | null>;

const optionalNullableIntInRange = (
  min: number,
  max: number
): z.ZodType<number | null | undefined> =>
  z.number().int().min(min).max(max).nullable().optional();

export const wellnessLimitsSchema = z.object({
  recovery: optionalNullableIntInRange(0, 10),
  energy: optionalNullableIntInRange(1, 5),
  soreness: optionalNullableIntInRange(1, 5),
  sleepHours: optionalNullableIntInRange(0, 24),
  sleepQuality: optionalNullableIntInRange(1, 5),
});

export type WellnessLimits = {
  recovery: number | null;
  energy: number | null;
  soreness: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
};

export type WellnessEntryMetrics = {
  recovery?: number | null;
  energy?: number | null;
  soreness?: number | null;
  sleepHours?: number | null;
  sleepQuality?: number | null;
};

export type ImmediateWellnessFlag = {
  metric: WellnessMetric;
  careRelevant: boolean;
};

export function parseWellnessLimits(input: unknown): WellnessLimits | null {
  const parsed = wellnessLimitsSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  return {
    recovery: parsed.data.recovery ?? null,
    energy: parsed.data.energy ?? null,
    soreness: parsed.data.soreness ?? null,
    sleepHours: parsed.data.sleepHours ?? null,
    sleepQuality: parsed.data.sleepQuality ?? null,
  };
}

function isConfiguredThreshold(
  value: number | null | undefined
): value is number {
  return typeof value === "number";
}

function isPresentMetric(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Pure evaluator for immediate wellness red flags against active team limits.
 * Null / missing threshold = disabled for that metric. Directions match staff alerts.
 */
export function evaluateImmediateWellnessFlags(
  entry: WellnessEntryMetrics | null | undefined,
  limits: WellnessLimits | null | undefined
): ImmediateWellnessFlag[] {
  if (!(entry && limits)) {
    return [];
  }

  const flags: ImmediateWellnessFlag[] = [];

  if (
    isConfiguredThreshold(limits.recovery) &&
    isPresentMetric(entry.recovery) &&
    entry.recovery <= limits.recovery
  ) {
    flags.push({
      metric: "recovery",
      careRelevant: CARE_RELEVANT_WELLNESS_METRICS.has("recovery"),
    });
  }

  if (
    isConfiguredThreshold(limits.energy) &&
    isPresentMetric(entry.energy) &&
    entry.energy <= limits.energy
  ) {
    flags.push({
      metric: "energy",
      careRelevant: CARE_RELEVANT_WELLNESS_METRICS.has("energy"),
    });
  }

  if (
    isConfiguredThreshold(limits.soreness) &&
    isPresentMetric(entry.soreness) &&
    entry.soreness >= limits.soreness
  ) {
    flags.push({
      metric: "soreness",
      careRelevant: CARE_RELEVANT_WELLNESS_METRICS.has("soreness"),
    });
  }

  if (
    isConfiguredThreshold(limits.sleepHours) &&
    isPresentMetric(entry.sleepHours) &&
    Number(entry.sleepHours) < limits.sleepHours
  ) {
    flags.push({
      metric: "sleepHours",
      careRelevant: CARE_RELEVANT_WELLNESS_METRICS.has("sleepHours"),
    });
  }

  if (
    isConfiguredThreshold(limits.sleepQuality) &&
    isPresentMetric(entry.sleepQuality) &&
    entry.sleepQuality <= limits.sleepQuality
  ) {
    flags.push({
      metric: "sleepQuality",
      careRelevant: CARE_RELEVANT_WELLNESS_METRICS.has("sleepQuality"),
    });
  }

  return flags;
}

export function isCareRelevantWellnessMetric(metric: WellnessMetric): boolean {
  return CARE_RELEVANT_WELLNESS_METRICS.has(metric);
}
