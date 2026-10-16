export type MinutesPromptPlayer = {
  readonly id: string;
  readonly name: string;
};

export type MinutesPromptSession = {
  readonly id: string;
  readonly title: string;
  readonly type: "MATCH" | "TRAINING" | "RECOVERY" | "OTHER";
  readonly sharedMinutes: number | null;
};

export type MinutesPromptState = {
  readonly pendingSessions: readonly MinutesPromptSession[];
  readonly players: readonly MinutesPromptPlayer[];
  readonly promptHour: number;
};
