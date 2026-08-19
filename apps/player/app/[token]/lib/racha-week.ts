/**
 * Pure Racha sheet week projection (JES-112).
 * Marks = all Team Sessions that civil week — not Recoverable Streak expected days.
 */

export const RACHA_WEEKDAY_LETTERS = [
  "L",
  "M",
  "X",
  "J",
  "V",
  "S",
  "D",
] as const;

export type RachaWeekdayLetter = (typeof RACHA_WEEKDAY_LETTERS)[number];

export type RachaWeekSessionInput = {
  readonly startsAt: Date;
  /** TeamSessionStatus; CANCELLED is omitted from marks and count. */
  readonly status: string;
};

export type RachaWeekDay = {
  readonly weekday: RachaWeekdayLetter;
  readonly hasSession: boolean;
  readonly isToday: boolean;
};

export type ProjectRachaWeekInput = {
  readonly sessions: readonly RachaWeekSessionInput[];
  readonly timeZone: string;
  /** Instant used to resolve “today” and the Monday–Sunday week in `timeZone`. */
  readonly asOf: Date;
};

export type ProjectRachaWeekResult = {
  readonly days: readonly RachaWeekDay[];
  /** Non-cancelled Team Sessions whose start civil day falls in the week. */
  readonly sessionCount: number;
  readonly mondayIso: string;
  readonly sundayIso: string;
};

/** YYYY-MM-DD in the given IANA timezone. */
export function toRachaCivilDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 0 = Monday … 6 = Sunday for a Gregorian civil ISO date. */
export function mondayBasedIndexFromCivilIso(civilIso: string): number {
  const utcMidnight = new Date(`${civilIso}T00:00:00.000Z`);
  return (utcMidnight.getUTCDay() + 6) % 7;
}

export function addCivilDays(civilIso: string, days: number): string {
  const cursor = new Date(`${civilIso}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return cursor.toISOString().slice(0, 10);
}

export function mondayOfCivilWeek(civilIso: string): string {
  return addCivilDays(civilIso, -mondayBasedIndexFromCivilIso(civilIso));
}

/**
 * Wide UTC window for fetching Team Sessions that might land in the civil week
 * after timezone projection (same ±1 day padding pattern as streak recompute).
 */
export function rachaWeekQueryWindow(
  asOf: Date,
  timeZone: string
): { readonly gte: Date; readonly lt: Date } {
  const asOfCivil = toRachaCivilDateString(asOf, timeZone);
  const monday = mondayOfCivilWeek(asOfCivil);
  const nextMonday = addCivilDays(monday, 7);
  const rangeStart = new Date(`${monday}T00:00:00.000Z`);
  const rangeEnd = new Date(`${nextMonday}T00:00:00.000Z`);
  return {
    gte: new Date(rangeStart.getTime() - 24 * 60 * 60 * 1000),
    lt: new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000),
  };
}

function isCancelledStatus(status: string): boolean {
  return status === "CANCELLED";
}

export function projectRachaWeek(
  input: ProjectRachaWeekInput
): ProjectRachaWeekResult {
  const asOfCivil = toRachaCivilDateString(input.asOf, input.timeZone);
  const mondayIso = mondayOfCivilWeek(asOfCivil);
  const sundayIso = addCivilDays(mondayIso, 6);

  const sessionCivils: string[] = [];
  for (const session of input.sessions) {
    if (isCancelledStatus(session.status)) {
      continue;
    }
    const civil = toRachaCivilDateString(session.startsAt, input.timeZone);
    if (civil < mondayIso || civil > sundayIso) {
      continue;
    }
    sessionCivils.push(civil);
  }

  const daysWithSession = new Set(sessionCivils);
  const days: RachaWeekDay[] = RACHA_WEEKDAY_LETTERS.map((weekday, index) => {
    const civil = addCivilDays(mondayIso, index);
    return {
      weekday,
      hasSession: daysWithSession.has(civil),
      isToday: civil === asOfCivil,
    };
  });

  return {
    days,
    sessionCount: sessionCivils.length,
    mondayIso,
    sundayIso,
  };
}
