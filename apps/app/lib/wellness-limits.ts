import { z } from "zod";

const optionalNullableNumber = z.number().nullable().optional();

export const wellnessLimitsSchema = z.object({
  recovery: optionalNullableNumber,
  energy: optionalNullableNumber,
  soreness: optionalNullableNumber,
  sleepHours: optionalNullableNumber,
  sleepQuality: optionalNullableNumber,
});

export type WellnessLimits = z.infer<typeof wellnessLimitsSchema>;

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
