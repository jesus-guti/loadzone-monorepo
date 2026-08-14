import { describe, expect, it } from "vitest";
import {
  classifyExpectedDay,
  computeRecoverableStreak,
  effectiveCurrentStreak,
  eachCivilDayInclusive,
  isDayObligationsComplete,
  isInjuryActiveOnDay,
  resolveDayObligations,
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
  it("increments on consecutive completed expected days", () => {
    const result = computeRecoverableStreak({
      longestStreak: 0,
      expectedDays: [
        { date: "2026-03-01", outcome: "completed" },
        { date: "2026-03-02", outcome: "completed" },
        { date: "2026-03-03", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.restarted).toBe(false);
  });

  it("restarts at 1 after an unexcused miss", () => {
    const result = computeRecoverableStreak({
      longestStreak: 5,
      expectedDays: [
        { date: "2026-03-01", outcome: "completed" },
        { date: "2026-03-02", outcome: "completed" },
        { date: "2026-03-03", outcome: "missed" },
        { date: "2026-03-04", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(5);
    expect(result.restarted).toBe(true);
  });

  it("freezes through excused days without breaking", () => {
    const result = computeRecoverableStreak({
      longestStreak: 2,
      expectedDays: [
        { date: "2026-03-01", outcome: "completed" },
        { date: "2026-03-02", outcome: "excused" },
        { date: "2026-03-03", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(2);
    expect(result.restarted).toBe(false);
  });

  it("resets across Season change by only seeing the new Season days", () => {
    const seasonA = computeRecoverableStreak({
      longestStreak: 0,
      expectedDays: [
        { date: "2025-11-01", outcome: "completed" },
        { date: "2025-11-02", outcome: "completed" },
      ],
    });
    expect(seasonA.currentStreak).toBe(2);

    const seasonB = computeRecoverableStreak({
      longestStreak: seasonA.longestStreak,
      expectedDays: [{ date: "2026-03-01", outcome: "completed" }],
    });
    expect(seasonB.currentStreak).toBe(1);
    expect(seasonB.longestStreak).toBe(2);
  });

  it("does not trust inflated prior counters (cutover recompute)", () => {
    const result = computeRecoverableStreak({
      longestStreak: 99,
      expectedDays: [
        { date: "2026-03-01", outcome: "completed" },
        { date: "2026-03-02", outcome: "missed" },
        { date: "2026-03-03", outcome: "completed" },
        { date: "2026-03-04", outcome: "completed" },
      ],
    });
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(99);
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
