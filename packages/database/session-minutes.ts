export type SessionKind = "MATCH" | "TRAINING" | "RECOVERY" | "OTHER";

/** Minutes that multiply a player's RPE. Match minutes win, then shared session minutes, then check-in duration. */
export function resolveLoadMinutes(input: {
  readonly sessionType: SessionKind | null;
  readonly minutesPlayed: number | null;
  readonly sharedMinutes: number | null;
  readonly checkInDuration: number | null;
}): number | null {
  if (input.sessionType === "MATCH" && input.minutesPlayed !== null) {
    return input.minutesPlayed;
  }
  if (
    input.sessionType !== null &&
    input.sessionType !== "MATCH" &&
    input.sharedMinutes !== null
  ) {
    return input.sharedMinutes;
  }
  return input.checkInDuration;
}
