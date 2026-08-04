/**
 * Season-scoped Recoverable Streak engine (pure).
 * Excused days freeze; unexcused misses break; longestStreak is career-wide.
 */

export type ExpectedDayOutcome = "completed" | "excused" | "missed";

export type ExpectedDayRecord = {
  readonly date: string;
  readonly outcome: ExpectedDayOutcome;
};

export type RecoverableStreakInput = {
  readonly expectedDays: readonly ExpectedDayRecord[];
  readonly longestStreak: number;
};

export type RecoverableStreakResult = {
  readonly currentStreak: number;
  readonly longestStreak: number;
  /** True when this run ends at 1 after at least one prior miss in the window. */
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
 * Walk Season expected days chronologically. Excused freezes; miss zeros;
 * completed increments. Cutover-safe: does not trust prior currentStreak.
 */
export function computeRecoverableStreak(
  input: RecoverableStreakInput
): RecoverableStreakResult {
  const sorted = [...input.expectedDays].sort((left, right) =>
    compareCivilDates(left.date, right.date)
  );

  let currentStreak = 0;
  let sawMiss = false;

  for (const day of sorted) {
    if (day.outcome === "completed") {
      currentStreak += 1;
    } else if (day.outcome === "missed") {
      currentStreak = 0;
      sawMiss = true;
    }
    // excused: freeze (no increment, no break)
  }

  const restarted = currentStreak === 1 && sawMiss;
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
