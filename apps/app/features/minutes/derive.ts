export const DEFAULT_SHARED_MINUTES = 80;
export const UNLOGGED_MATCH_MINUTES = 95;
export const DEFAULT_PROMPT_HOUR = 20;

export const FORMATIONS = [
  "F_4_3_3",
  "F_4_4_2",
  "F_4_2_3_1",
  "F_3_5_2",
  "F_5_3_2",
] as const;

export type Formation = (typeof FORMATIONS)[number];

export const FORMATION_LABEL: Record<Formation, string> = {
  F_4_3_3: "4-3-3",
  F_4_4_2: "4-4-2",
  F_4_2_3_1: "4-2-3-1",
  F_3_5_2: "3-5-2",
  F_5_3_2: "5-3-2",
};

export type SubstitutionInput = {
  readonly minute: number;
  readonly playerOutId: string;
  readonly playerInId: string | null;
};

export type LineupMinutesInput = {
  readonly starterIds: readonly string[];
  readonly benchIds: readonly string[];
  readonly substitutions: readonly SubstitutionInput[];
  readonly stoppageFirst: number;
  readonly stoppageSecond: number;
  readonly extraTime: boolean;
  readonly stoppageExtraFirst: number;
  readonly stoppageExtraSecond: number;
};

const HALF_ENDS = [45, 90, 105, 120] as const;

function regulationEnd(extraTime: boolean): number {
  return extraTime ? 120 : 90;
}

function stoppageCredit(
  entered: number,
  exited: number | null,
  extraTime: boolean,
  stops: readonly number[]
): number {
  let extra = 0;
  for (const [index, halfEnd] of HALF_ENDS.entries()) {
    if (!extraTime && halfEnd > 90) {
      continue;
    }
    if (entered < halfEnd && (exited === null || exited > halfEnd)) {
      extra += stops[index] ?? 0;
    }
  }
  return extra;
}

function onePlayerMinutes(
  playerId: string,
  input: LineupMinutesInput,
  end: number
): number {
  const starter = input.starterIds.includes(playerId);
  let entered: number | null = starter ? 0 : null;
  let exited: number | null = null;
  for (const change of input.substitutions) {
    if (change.playerInId === playerId && entered === null) {
      entered = change.minute;
    }
    if (
      change.playerOutId === playerId &&
      entered !== null &&
      exited === null
    ) {
      exited = change.minute;
    }
  }
  if (entered === null) {
    return 0;
  }
  const leave = exited ?? end;
  const open = Math.max(0, Math.min(leave, end) - Math.min(entered, end));
  return (
    open +
    stoppageCredit(entered, exited, input.extraTime, [
      input.stoppageFirst,
      input.stoppageSecond,
      input.extraTime ? input.stoppageExtraFirst : 0,
      input.extraTime ? input.stoppageExtraSecond : 0,
    ])
  );
}

/** Open-play minutes plus stoppage for players still on at each whistle. */
export function minutesPlayedByPlayer(
  input: LineupMinutesInput
): Readonly<Record<string, number>> {
  const end = regulationEnd(input.extraTime);
  const result: Record<string, number> = {};
  for (const playerId of [...input.starterIds, ...input.benchIds]) {
    result[playerId] = onePlayerMinutes(playerId, input, end);
  }
  return result;
}

export function fullMatchLength(input: LineupMinutesInput): number {
  const open = input.extraTime ? 120 : 90;
  return (
    open +
    input.stoppageFirst +
    input.stoppageSecond +
    (input.extraTime ? input.stoppageExtraFirst + input.stoppageExtraSecond : 0)
  );
}

export type DaySessionMinutes = {
  readonly type: "MATCH" | "TRAINING" | "RECOVERY" | "OTHER";
  readonly sharedMinutes: number | null;
  readonly fullMatchLength: number | null;
};

export function teamDayMinutes(sessions: readonly DaySessionMinutes[]): number {
  const matches = sessions.filter((session) => session.type === "MATCH");
  if (matches.length > 0) {
    return matches.reduce(
      (sum, session) =>
        sum + (session.fullMatchLength ?? UNLOGGED_MATCH_MINUTES),
      0
    );
  }
  return sessions.reduce(
    (sum, session) => sum + (session.sharedMinutes ?? DEFAULT_SHARED_MINUTES),
    0
  );
}

export type BannerSession = {
  readonly cancelled: boolean;
  readonly type: DaySessionMinutes["type"];
  readonly sharedMinutes: number | null;
  readonly hasLineup: boolean;
};

export function shouldPromptMinutes(input: {
  readonly hour: number;
  readonly promptHour: number;
  readonly sessions: readonly BannerSession[];
}): boolean {
  if (input.hour < input.promptHour) {
    return false;
  }
  return input.sessions.some((session) => {
    if (session.cancelled) {
      return false;
    }
    if (session.type === "MATCH") {
      return !session.hasLineup;
    }
    return session.sharedMinutes === null;
  });
}
