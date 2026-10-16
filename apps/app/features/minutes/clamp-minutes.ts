import { DEFAULT_SHARED_MINUTES } from "@/features/minutes/derive";

export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 300;
export const DEFAULT_QUICK_MINUTES = DEFAULT_SHARED_MINUTES;

export function clampSessionMinutes(value: number): number {
  return Math.min(
    MAX_SESSION_MINUTES,
    Math.max(MIN_SESSION_MINUTES, Math.round(value))
  );
}

export function adjustSessionMinutes(current: number, delta: number): number {
  return clampSessionMinutes(current + delta);
}
