import { database } from "./client";
import { mapInjuryRowsToIntervals } from "./injury-status";
import {
  civilDateToUtcMidnight,
  classifyExpectedDay,
  compareCivilDates,
  computeRecoverableStreak,
  STREAK_RULES_START,
  isDayObligationsComplete,
  isGraceOpen,
  isInjuryActiveOnDay,
  isLifesaverSessionDate,
  resolveDayObligations,
  toCivilDateString,
  type DayObligations,
  type ExpectedDayRecord,
  type RecoverableStreakResult,
} from "./recoverable-streak";

type RecomputeArgs = {
  readonly playerId: string;
  readonly seasonId: string;
  /** Civil YYYY-MM-DD upper bound (team-local). Defaults to "now" in team TZ. */
  readonly asOfCivilDate?: string;
};

export type PersistStreakResult = RecoverableStreakResult & {
  readonly seasonId: string;
  readonly openGraceDate: string | null;
};

function playerOnSession(args: {
  readonly appliesToAllPlayers: boolean;
  readonly playerLinks: Array<{ playerId: string }>;
  readonly playerId: string;
}): boolean {
  if (args.appliesToAllPlayers) {
    return true;
  }
  return args.playerLinks.some((link) => link.playerId === args.playerId);
}

/**
 * Recompute Season-scoped recoverable streak from expected-day history and persist.
 * Lazy miss: incomplete "today" is omitted until completed, excused, or a later day closes it.
 */
export async function recomputeAndPersistPlayerStreak(
  args: RecomputeArgs
): Promise<PersistStreakResult | null> {
  const player = await database.player.findUnique({
    where: { id: args.playerId },
    select: {
      id: true,
      longestStreak: true,
      currentStreak: true,
      streakBaseline: true,
      streakSeasonId: true,
      teamId: true,
      team: {
        select: {
          timezone: true,
          forms: {
            where: { teamSessionId: null, isActive: true },
            select: { fillMoment: true },
          },
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  const season = await database.season.findFirst({
    where: { id: args.seasonId, teamId: player.teamId },
    select: { id: true, startDate: true, endDate: true },
  });

  if (!season) {
    return null;
  }

  const timeZone = player.team.timezone || "Europe/Madrid";
  const todayCivil = toCivilDateString(new Date(), timeZone);
  const asOfCivil = args.asOfCivilDate ?? todayCivil;

  const seasonStartCivil = toCivilDateString(season.startDate, timeZone);
  const seasonEndCivil = toCivilDateString(season.endDate, timeZone);
  const continuingSeason =
    player.streakSeasonId === season.id || player.streakSeasonId === null;
  const baseline = continuingSeason
    ? (player.streakBaseline ?? player.currentStreak)
    : 0;

  const windowStart =
    compareCivilDates(seasonStartCivil, STREAK_RULES_START) > 0
      ? seasonStartCivil
      : STREAK_RULES_START;
  let windowEnd = asOfCivil;
  if (compareCivilDates(windowEnd, seasonEndCivil) > 0) {
    windowEnd = seasonEndCivil;
  }
  if (compareCivilDates(windowStart, windowEnd) > 0) {
    const empty = computeRecoverableStreak({
      expectedDays: [],
      longestStreak: player.longestStreak,
      baseline,
    });
    await database.player.update({
      where: { id: player.id },
      data: {
        currentStreak: empty.currentStreak,
        longestStreak: empty.longestStreak,
        streakSeasonId: season.id,
        streakBaseline: baseline,
      },
    });
    return { ...empty, seasonId: season.id, openGraceDate: null };
  }

  const rangeStart = civilDateToUtcMidnight(windowStart);
  const rangeEndExclusive = new Date(
    civilDateToUtcMidnight(windowEnd).getTime() + 24 * 60 * 60 * 1000
  );

  // Session startsAt is absolute; widen fetch slightly then filter by team civil day.
  const sessions = await database.teamSession.findMany({
    where: {
      teamId: player.teamId,
      status: { not: "CANCELLED" },
      startsAt: {
        gte: new Date(rangeStart.getTime() - 24 * 60 * 60 * 1000),
        lt: new Date(rangeEndExclusive.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      startsAt: true,
      appliesToAllPlayers: true,
      playerLinks: { select: { playerId: true } },
      formAssignments: {
        where: { isActive: true },
        select: { fillMoment: true },
      },
    },
  });

  const teamMoments = player.team.forms.map((form) => form.fillMoment);

  type DayBucket = {
    obligations: DayObligations;
    sessionMoments: string[][];
  };

  const dayBuckets = new Map<string, DayBucket>();

  for (const session of sessions) {
    if (
      !playerOnSession({
        appliesToAllPlayers: session.appliesToAllPlayers,
        playerLinks: session.playerLinks,
        playerId: player.id,
      })
    ) {
      continue;
    }

    const civil = toCivilDateString(session.startsAt, timeZone);
    if (
      compareCivilDates(civil, windowStart) < 0 ||
      compareCivilDates(civil, windowEnd) > 0
    ) {
      continue;
    }

    const moments = session.formAssignments.map((assignment) => assignment.fillMoment);
    const existing = dayBuckets.get(civil);
    if (existing) {
      existing.sessionMoments.push(moments);
    } else {
      dayBuckets.set(civil, {
        sessionMoments: [moments],
        obligations: { requirePre: false, requirePost: false },
      });
    }
  }

  for (const [civil, bucket] of dayBuckets) {
    bucket.obligations = resolveDayObligations(
      bucket.sessionMoments,
      teamMoments
    );
    if (!bucket.obligations.requirePre && !bucket.obligations.requirePost) {
      dayBuckets.delete(civil);
    }
  }

  const expectedDates = [...dayBuckets.keys()].sort(compareCivilDates);

  const entries = await database.dailyEntry.findMany({
    where: {
      playerId: player.id,
      date: {
        gte: civilDateToUtcMidnight(windowStart),
        lte: civilDateToUtcMidnight(windowEnd),
      },
    },
    select: {
      date: true,
      preFilledAt: true,
      postFilledAt: true,
    },
  });

  const entryByDate = new Map(
    entries.map((entry) => [
      toCivilDateString(entry.date, "UTC"),
      entry,
    ])
  );

  const excuses = await database.excusedAbsence.findMany({
    where: {
      playerId: player.id,
      date: {
        gte: civilDateToUtcMidnight(windowStart),
        lte: civilDateToUtcMidnight(windowEnd),
      },
    },
    select: { date: true },
  });

  const excusedDates = new Set(
    excuses.map((excuse) => toCivilDateString(excuse.date, "UTC"))
  );

  // Official Injury intervals only — never PainAlert (JES-32 / JES-53).
  const injuries = await database.injury.findMany({
    where: { playerId: player.id },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  const injuryIntervals = mapInjuryRowsToIntervals(injuries);

  const expectedDays: ExpectedDayRecord[] = [];
  let openGraceDate: string | null = null;

  for (const civil of expectedDates) {
    if (compareCivilDates(civil, STREAK_RULES_START) < 0) {
      continue;
    }

    const bucket = dayBuckets.get(civil);
    if (!bucket) {
      continue;
    }

    const entry = entryByDate.get(civil) ?? null;
    const completed = isDayObligationsComplete(bucket.obligations, entry);
    const manuallyExcused = excusedDates.has(civil);
    const injuryExempt = isInjuryActiveOnDay(injuryIntervals, civil);
    const outcome = classifyExpectedDay({
      completed,
      manuallyExcused,
      injuryExempt,
    });

    if (outcome === "missed" && isGraceOpen(civil, todayCivil)) {
      expectedDays.push({ date: civil, outcome: "grace-open" });
      if (compareCivilDates(todayCivil, civil) > 0) {
        openGraceDate = openGraceDate ?? civil;
      }
      continue;
    }

    if (outcome === "missed" && isLifesaverSessionDate(civil)) {
      expectedDays.push({ date: civil, outcome: "lifesaver-miss" });
      continue;
    }

    expectedDays.push({ date: civil, outcome });
  }

  const result = computeRecoverableStreak({
    expectedDays,
    longestStreak: player.longestStreak,
    baseline,
  });

  await database.player.update({
    where: { id: player.id },
    data: {
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      streakSeasonId: season.id,
      streakBaseline: baseline,
    },
  });

  return { ...result, seasonId: season.id, openGraceDate };
}

export async function findActiveSeasonIdForTeam(
  teamId: string,
  at: Date
): Promise<string | null> {
  const season = await database.season.findFirst({
    where: {
      teamId,
      startDate: { lte: at },
      endDate: { gte: at },
    },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  return season?.id ?? null;
}
