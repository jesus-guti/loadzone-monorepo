import { describe, expect, it } from "vitest";
import {
  STREAK_APOLOGY_COPY,
  classifyExpectedDay,
  computeRecoverableStreak,
  effectiveCurrentStreak,
  eachCivilDayInclusive,
  graceNoteCopy,
  isDayObligationsComplete,
  isInjuryActiveOnDay,
  resolveDayObligations,
  shouldShowStreakApology,
  shouldSkipWellnessReminderForInjury,
  toCivilDateString,
} from "../recoverable-streak";

describe("toCivilDateString", () => {
  it("formats UTC midnight as the same civil day in Madrid winter", () => {
    expect(toCivilDateString(new Date("2026-01-15T00:00:00.000Z"), "Europe/Madrid")).toBe(
      "2026-01-15"
    );
  });
});

describe("eachCivilDayInclusive", () => {
  it("lists inclusive civil days", () => {
    expect(eachCivilDayInclusive("2026-03-01", "2026-03-03")).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
    ]);
  });
});

describe("resolveDayObligations / completion", () => {
  it("unions session moments when present", () => {
    expect(
      resolveDayObligations([["PRE_SESSION"], ["POST_SESSION"]], ["PRE_SESSION"])
    ).toEqual({ requirePre: true, requirePost: true });
  });

  it("falls back to team moments when sessions have none", () => {
    expect(resolveDayObligations([[], []], ["PRE_SESSION", "POST_SESSION"])).toEqual({
      requirePre: true,
      requirePost: true,
    });
  });

  it("requires both fill moments when both assigned", () => {
    const obligations = { requirePre: true, requirePost: true };
    expect(
      isDayObligationsComplete(obligations, {
        preFilledAt: new Date(),
        postFilledAt: null,
      })
    ).toBe(false);
    expect(
      isDayObligationsComplete(obligations, {
        preFilledAt: new Date(),
        postFilledAt: new Date(),
      })
    ).toBe(true);
  });
});

describe("classifyExpectedDay", () => {
  it("treats injury-exempt incomplete days as excused", () => {
    expect(
      classifyExpectedDay({
        completed: false,
        manuallyExcused: false,
        injuryExempt: true,
      })
    ).toBe("excused");
  });

  it("lets voluntary completion win over injury exemption", () => {
    expect(
      classifyExpectedDay({
        completed: true,
        manuallyExcused: false,
        injuryExempt: true,
      })
    ).toBe("completed");
  });
});

describe("isInjuryActiveOnDay", () => {
  it("uses inclusive endDate", () => {
    const intervals = [{ startDate: "2026-02-01", endDate: "2026-02-03" }];
    expect(isInjuryActiveOnDay(intervals, "2026-02-03")).toBe(true);
    expect(isInjuryActiveOnDay(intervals, "2026-02-04")).toBe(false);
  });

  it("treats null endDate as open-ended", () => {
    const intervals = [{ startDate: "2026-02-01", endDate: null }];
    expect(isInjuryActiveOnDay(intervals, "2026-08-01")).toBe(true);
    expect(isInjuryActiveOnDay(intervals, "2026-01-31")).toBe(false);
  });

  it("does not exempt when intervals are empty (Pain Alert alone)", () => {
    expect(isInjuryActiveOnDay([], "2026-02-03")).toBe(false);
  });
});

describe("shouldSkipWellnessReminderForInjury", () => {
  it("skips cron / re-nudge when Injury is active on civil D", () => {
    expect(
      shouldSkipWellnessReminderForInjury({
        injuryIntervals: [{ startDate: "2026-05-01", endDate: "2026-05-10" }],
        civilDayIso: "2026-05-03",
      })
    ).toBe(true);
  });

  it("does not skip when only Pain Alert would apply (no Injury intervals)", () => {
    expect(
      shouldSkipWellnessReminderForInjury({
        injuryIntervals: [],
        civilDayIso: "2026-05-03",
      })
    ).toBe(false);
  });

  it("does not skip outside the Injury interval", () => {
    expect(
      shouldSkipWellnessReminderForInjury({
        injuryIntervals: [{ startDate: "2026-05-01", endDate: "2026-05-02" }],
        civilDayIso: "2026-05-03",
      })
    ).toBe(false);
  });
});

describe("computeRecoverableStreak", () => {
  it("adds 1 per completed day, including seven sessions in one week", () => {
    const result = computeRecoverableStreak({
      baseline: 0,
      longestStreak: 0,
      expectedDays: [
        { date: "2026-10-05", outcome: "completed" },
        { date: "2026-10-06", outcome: "completed" },
        { date: "2026-10-07", outcome: "completed" },
        { date: "2026-10-08", outcome: "completed" },
        { date: "2026-10-09", outcome: "completed" },
        { date: "2026-10-10", outcome: "completed" },
        { date: "2026-10-11", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(7);
    expect(result.longestStreak).toBe(7);
    expect(result.restarted).toBe(false);
  });

  it("freezes on excused and on an open extra day", () => {
    const excused = computeRecoverableStreak({
      baseline: 4,
      longestStreak: 4,
      expectedDays: [{ date: "2026-10-05", outcome: "excused" }],
    });
    expect(excused.currentStreak).toBe(4);
    expect(excused.restarted).toBe(false);

    const grace = computeRecoverableStreak({
      baseline: 4,
      longestStreak: 4,
      expectedDays: [{ date: "2026-10-05", outcome: "grace-open" }],
    });
    expect(grace.currentStreak).toBe(4);
  });

  it("subtracts 2 per closed miss, floors at 0, and does not restart above 0", () => {
    const one = computeRecoverableStreak({
      baseline: 10,
      longestStreak: 10,
      expectedDays: [{ date: "2026-10-05", outcome: "missed" }],
    });
    expect(one.currentStreak).toBe(8);
    expect(one.longestStreak).toBe(10);
    expect(one.restarted).toBe(false);

    const two = computeRecoverableStreak({
      baseline: 10,
      longestStreak: 10,
      expectedDays: [
        { date: "2026-10-05", outcome: "missed" },
        { date: "2026-10-06", outcome: "missed" },
      ],
    });
    expect(two.currentStreak).toBe(6);

    const floored = computeRecoverableStreak({
      baseline: 1,
      longestStreak: 9,
      expectedDays: [{ date: "2026-10-05", outcome: "missed" }],
    });
    expect(floored.currentStreak).toBe(0);
    expect(floored.longestStreak).toBe(9);
    expect(floored.restarted).toBe(true);
  });

  it("counts a complete on the missed date as +1 with no subtract", () => {
    const result = computeRecoverableStreak({
      baseline: 4,
      longestStreak: 4,
      expectedDays: [{ date: "2026-10-05", outcome: "completed" }],
    });
    expect(result.currentStreak).toBe(5);
    expect(result.restarted).toBe(false);
  });

  it("does not subtract a lifesaver miss, including 4 October, and does subtract 5 October", () => {
    const lifesaverMiss = computeRecoverableStreak({
      baseline: 6,
      longestStreak: 6,
      expectedDays: [{ date: "2026-09-30", outcome: "lifesaver-miss" }],
    });
    expect(lifesaverMiss.currentStreak).toBe(6);

    const lifesaverComplete = computeRecoverableStreak({
      baseline: 6,
      longestStreak: 6,
      expectedDays: [{ date: "2026-09-30", outcome: "completed" }],
    });
    expect(lifesaverComplete.currentStreak).toBe(7);

    const octoberFourth = computeRecoverableStreak({
      baseline: 6,
      longestStreak: 6,
      expectedDays: [{ date: "2026-10-04", outcome: "missed" }],
    });
    expect(octoberFourth.currentStreak).toBe(6);

    const octoberFifth = computeRecoverableStreak({
      baseline: 6,
      longestStreak: 6,
      expectedDays: [{ date: "2026-10-05", outcome: "missed" }],
    });
    expect(octoberFifth.currentStreak).toBe(4);
  });

  it("ignores days before the rules date and keeps the baseline", () => {
    const result = computeRecoverableStreak({
      baseline: 11,
      longestStreak: 11,
      expectedDays: [
        { date: "2026-09-11", outcome: "missed" },
        { date: "2026-10-05", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(12);
    expect(result.longestStreak).toBe(12);
  });

  it("resets across Season change by only seeing the new Season days", () => {
    const seasonB = computeRecoverableStreak({
      baseline: 0,
      longestStreak: 2,
      expectedDays: [{ date: "2026-10-05", outcome: "completed" }],
    });
    expect(seasonB.currentStreak).toBe(1);
    expect(seasonB.longestStreak).toBe(2);
  });
});

describe("streak apology and grace note", () => {
  it("shows the apology until it is acknowledged", () => {
    expect(shouldShowStreakApology(false)).toBe(true);
    expect(shouldShowStreakApology(true)).toBe(false);
    expect(STREAK_APOLOGY_COPY).toContain("bajas 2");
    expect(STREAK_APOLOGY_COPY).toContain("No vuelves a cero");
  });

  it("names the date and distinguishes lifesaver from a −2 miss", () => {
    expect(graceNoteCopy("2026-10-04")).toContain("4 de octubre");
    expect(graceNoteCopy("2026-10-04")).toContain("no pierdes racha");
    expect(graceNoteCopy("2026-10-05")).toContain("5 de octubre");
    expect(graceNoteCopy("2026-10-05")).toContain("baja 2");
  });
});

describe("effectiveCurrentStreak", () => {
  it("zeros when streakSeasonId does not match active Season", () => {
    expect(
      effectiveCurrentStreak({
        currentStreak: 4,
        streakSeasonId: "season-old",
        activeSeasonId: "season-new",
      })
    ).toBe(0);
  });
});
