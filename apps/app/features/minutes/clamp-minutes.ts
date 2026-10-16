export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 300;

export function clampSessionMinutes(value: number): number {
  return Math.min(
    MAX_SESSION_MINUTES,
    Math.max(MIN_SESSION_MINUTES, Math.round(value)),
  );
}

export function adjustSessionMinutes(
  current: number,
  delta: number,
): number {
  return clampSessionMinutes(current + delta);
}
