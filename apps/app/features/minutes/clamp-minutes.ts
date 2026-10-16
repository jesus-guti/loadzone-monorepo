export const MINUTES_STEPPER_MIN = 1;
export const MINUTES_STEPPER_MAX = 300;

export function clampMinutesStepper(value: number): number {
  return Math.min(
    MINUTES_STEPPER_MAX,
    Math.max(MINUTES_STEPPER_MIN, Math.trunc(value))
  );
}

export function stepMinutesStepper(current: number, delta: number): number {
  return clampMinutesStepper(current + delta);
}

export function defaultSharedMinutesForType(
  type: "MATCH" | "TRAINING" | "RECOVERY" | "OTHER"
): number {
  return type === "MATCH" ? 95 : 80;
}
