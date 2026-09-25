/**
 * Season-scoped Recoverable Streak engine (pure).
 * Excused days freeze; unexcused misses break; longestStreak is career-wide.
 */

export type ExpectedDayOutcome =
  | "completed"
  | "excused"
  | "missed"
  | "grace-open"
  | "lifesaver-miss";

export type ExpectedDayRecord = {
  readonly date: string;
  readonly outcome: ExpectedDayOutcome;
};

/** Civil Monday the −2 grace rule starts. Lifesaver week is this date through the following Sunday. */
export const STREAK_RULES_START = "2026-09-28";
export const LIFESAVER_WEEK_END = "2026-10-04";

export const STREAK_APOLOGY_COPY =
  "Perdona: la racha se cortaba mal y ya está corregida. Solo cuentan los días con sesión. Si te saltas uno, tienes el día siguiente para rellenarlo y la racha sigue. Si no, bajas 2. No vuelves a cero. Del 28 de septiembre al 4 de octubre, si fallas, no pierdes racha.";

export type RecoverableStreakInput = {
  readonly expectedDays: readonly ExpectedDayRecord[];
  readonly longestStreak: number;
  /** Stored streak snapshotted once. Days before the rules date are not in `expectedDays`. */
  readonly baseline: number;
};

export type RecoverableStreakResult = {
  readonly currentStreak: number;
  readonly longestStreak: number;
  /** True when a closed miss floors the streak at 0. A drop that stays above 0 is not a restart. */
  readonly restarted: boolean;
};

export type InjuryInterval = {
  readonly startDate: string;
  readonly endDate: string | null;
};

export type DayObligations = {
  readonly requirePre: boolean;
  readonly requirePost: boolean;
};

/** YYYY-MM-DD in the given IANA timezone. */
export function toCivilDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Store / compare DailyEntry dates as UTC midnight for the civil ISO date. */
export function civilDateToUtcMidnight(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function addCivilDays(isoDate: string, days: number): string {
  const cursor = civilDateToUtcMidnight(isoDate);
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return cursor.toISOString().slice(0, 10);
}

export function isLifesaverSessionDate(isoDate: string): boolean {
  return (
    compareCivilDates(isoDate, STREAK_RULES_START) >= 0 &&
    compareCivilDates(isoDate, LIFESAVER_WEEK_END) <= 0
  );
}

/** Extra civil day is the next day after the session day, inclusive of that day. */
export function isGraceOpen(sessionDate: string, todayCivil: string): boolean {
  return compareCivilDates(todayCivil, addCivilDays(sessionDate, 1)) <= 0;
}

export function formatGraceSessionDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(civilDateToUtcMidnight(isoDate));
}

export function shouldShowStreakApology(acknowledged: boolean): boolean {
  return !acknowledged;
}

export function graceNoteCopy(sessionDate: string): string {
  const label = formatGraceSessionDate(sessionDate);
  if (isLifesaverSessionDate(sessionDate)) {
    return `El ${label} sigue abierto. Si no lo rellenas, no pierdes racha.`;
  }
  return `El ${label} sigue abierto. Si no lo rellenas hoy, la racha baja 2.`;
}

export function compareCivilDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function eachCivilDayInclusive(startIso: string, endIso: string): string[] {
  if (compareCivilDates(startIso, endIso) > 0) {
    return [];
  }

  const days: string[] = [];
  let cursor = civilDateToUtcMidnight(startIso);
  const end = civilDateToUtcMidnight(endIso);

  while (cursor.getTime() <= end.getTime()) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  return days;
}

/**
 * Active Injury on civil day D: startDate ≤ D and (endDate null or D ≤ endDate).
 * Matches JES-30 / JES-32 inclusive endDate.
 */
export function isInjuryActiveOnDay(
  intervals: readonly InjuryInterval[],
  dayIso: string
): boolean {
  return intervals.some((interval) => {
    if (compareCivilDates(interval.startDate, dayIso) > 0) {
      return false;
    }
    if (interval.endDate === null) {
      return true;
    }
    return compareCivilDates(dayIso, interval.endDate) <= 0;
  });
}

/**
 * Wellness PRE/POST reminders and staff re-nudge: skip when an official Injury
 * is active on civil day D. Pain Alert rows never appear in `intervals`.
 */
export function shouldSkipWellnessReminderForInjury(args: {
  readonly injuryIntervals: readonly InjuryInterval[];
  readonly civilDayIso: string;
}): boolean {
  return isInjuryActiveOnDay(args.injuryIntervals, args.civilDayIso);
}

export function resolveDayObligations(
  sessionFillMoments: readonly string[][],
  teamFillMoments: readonly string[]
): DayObligations {
  let requirePre = false;
  let requirePost = false;

  const sessionSpecific = sessionFillMoments.filter(
    (moments) => moments.length > 0
  );
  const sources =
    sessionSpecific.length > 0 ? sessionSpecific : [teamFillMoments];

  for (const moments of sources) {
    if (moments.includes("PRE_SESSION")) {
      requirePre = true;
    }
    if (moments.includes("POST_SESSION")) {
      requirePost = true;
    }
  }

  return { requirePre, requirePost };
}

export function isDayObligationsComplete(
  obligations: DayObligations,
  entry: { preFilledAt: Date | null; postFilledAt: Date | null } | null
): boolean {
  if (!obligations.requirePre && !obligations.requirePost) {
    return false;
  }

  if (obligations.requirePre && !entry?.preFilledAt) {
    return false;
  }

  if (obligations.requirePost && !entry?.postFilledAt) {
    return false;
  }

  return true;
}

/**
 * Classify a closed expected day for streak purposes.
 * Voluntary completion on an injury-exempt day counts as completed (increments).
 */
export function classifyExpectedDay(args: {
  readonly completed: boolean;
  readonly manuallyExcused: boolean;
  readonly injuryExempt: boolean;
}): ExpectedDayOutcome {
  if (args.completed) {
    return "completed";
  }
  if (args.manuallyExcused || args.injuryExempt) {
    return "excused";
  }
  return "missed";
}

/**
 * Apply expected days on or after the rules date onto a snapshotted baseline.
 * Completed +1. Excused, grace-open, and lifesaver-miss freeze.
 * A closed miss subtracts 2, floored at 0, unless that session date is in the lifesaver week.
 */
export function computeRecoverableStreak(
  input: RecoverableStreakInput
): RecoverableStreakResult {
  const sorted = [...input.expectedDays].sort((left, right) =>
    compareCivilDates(left.date, right.date)
  );

  let currentStreak = Math.max(0, input.baseline);
  let sawClosedMiss = false;

  for (const day of sorted) {
    if (compareCivilDates(day.date, STREAK_RULES_START) < 0) {
      continue;
    }
    if (day.outcome === "completed") {
      currentStreak += 1;
      continue;
    }
    if (day.outcome === "missed" && !isLifesaverSessionDate(day.date)) {
      currentStreak = Math.max(0, currentStreak - 2);
      sawClosedMiss = true;
    }
  }

  const restarted = currentStreak === 0 && sawClosedMiss;
  const longestStreak = Math.max(input.longestStreak, currentStreak);

  return { currentStreak, longestStreak, restarted };
}

/**
 * Season-effective display value: wrong/missing streakSeasonId ⇒ 0 until next write.
 */
export function effectiveCurrentStreak(args: {
  readonly currentStreak: number;
  readonly streakSeasonId: string | null;
  readonly activeSeasonId: string | null;
}): number {
  if (!args.activeSeasonId || args.streakSeasonId !== args.activeSeasonId) {
    return 0;
  }
  return args.currentStreak;
}
