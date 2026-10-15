export const SHARED_SESSION_MINUTES_DEFAULT = 80;
export const FULL_MATCH_LENGTH_DEFAULT = 95;
export const SESSION_DURATION_MIN = 1;
export const SESSION_DURATION_MAX = 240;

export type SessionDurationType = "TRAINING" | "MATCH" | "RECOVERY" | "OTHER";

export function defaultDurationMinutes(type: SessionDurationType): number {
  return type === "MATCH"
    ? FULL_MATCH_LENGTH_DEFAULT
    : SHARED_SESSION_MINUTES_DEFAULT;
}

export function displayedDurationMinutes(
  type: SessionDurationType,
  saved: number | null
): number {
  return saved ?? defaultDurationMinutes(type);
}

export function clampDurationMinutes(value: number): number {
  return Math.min(SESSION_DURATION_MAX, Math.max(SESSION_DURATION_MIN, value));
}

export function stepDurationMinutes(current: number, delta: 1 | -1): number {
  return clampDurationMinutes(current + delta);
}

export function shouldShowDurationBanner(endsAt: Date, now: Date): boolean {
  return now.getTime() > endsAt.getTime();
}
