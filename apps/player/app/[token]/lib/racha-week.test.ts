import { describe, expect, it } from "vitest";

import {
  addCivilDays,
  mondayBasedIndexFromCivilIso,
  mondayOfCivilWeek,
  projectRachaWeek,
  rachaWeekQueryWindow,
  RACHA_WEEKDAY_LETTERS,
  toRachaCivilDateString,
} from "./racha-week";

const MADRID = "Europe/Madrid";

describe("toRachaCivilDateString", () => {
  it("projects Instants into Team timezone civil days", () => {
    // 2026-01-15 00:30 UTC → still 15th in Madrid (UTC+1 winter)
    expect(
      toRachaCivilDateString(new Date("2026-01-15T00:30:00.000Z"), MADRID)
    ).toBe("2026-01-15");
    // Late evening Madrid → next UTC day still same Madrid civil day
    expect(
      toRachaCivilDateString(new Date("2026-01-15T22:30:00.000Z"), MADRID)
    ).toBe("2026-01-15");
    // Just after midnight Madrid (23:30 UTC previous) → 16th Madrid
    expect(
      toRachaCivilDateString(new Date("2026-01-15T23:30:00.000Z"), MADRID)
    ).toBe("2026-01-16");
  });
});

describe("civil week helpers", () => {
  it("maps civil ISO dates onto Monday-based indices L–D", () => {
    // 2026-08-17 = Monday … 2026-08-23 = Sunday
    expect(mondayBasedIndexFromCivilIso("2026-08-17")).toBe(0);
    expect(mondayBasedIndexFromCivilIso("2026-08-19")).toBe(2);
    expect(mondayBasedIndexFromCivilIso("2026-08-23")).toBe(6);
  });

  it("finds Monday of the civil week and walks seven days", () => {
    expect(mondayOfCivilWeek("2026-08-19")).toBe("2026-08-17");
    expect(mondayOfCivilWeek("2026-08-17")).toBe("2026-08-17");
    expect(mondayOfCivilWeek("2026-08-23")).toBe("2026-08-17");
    expect(addCivilDays("2026-08-17", 6)).toBe("2026-08-23");
  });
});

describe("projectRachaWeek", () => {
  const wednesdayAsOf = new Date("2026-08-19T12:00:00.000Z"); // Wed in Madrid

  it("returns L–D letters with today underlined via isToday", () => {
    const result = projectRachaWeek({
      sessions: [],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.map((day) => day.weekday)).toEqual([
      ...RACHA_WEEKDAY_LETTERS,
    ]);
    expect(result.days).toHaveLength(7);
    expect(result.mondayIso).toBe("2026-08-17");
    expect(result.sundayIso).toBe("2026-08-23");
    expect(result.days.map((day) => day.isToday)).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(result.days.every((day) => day.hasSession === false)).toBe(true);
    expect(result.sessionCount).toBe(0);
  });

  it("marks hasSession for civil days with at least one non-cancelled Session", () => {
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-17T17:00:00.000Z"), // Mon
          status: "SCHEDULED",
        },
        {
          startsAt: new Date("2026-08-19T18:00:00.000Z"), // Wed
          status: "COMPLETED",
        },
        {
          startsAt: new Date("2026-08-22T09:00:00.000Z"), // Sat
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.map((day) => day.hasSession)).toEqual([
      true,
      false,
      true,
      false,
      false,
      true,
      false,
    ]);
    expect(result.sessionCount).toBe(3);
  });

  it("omits CANCELLED Sessions from marks and sessionCount", () => {
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-18T17:00:00.000Z"),
          status: "CANCELLED",
        },
        {
          startsAt: new Date("2026-08-20T17:00:00.000Z"),
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.map((day) => day.hasSession)).toEqual([
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
    expect(result.sessionCount).toBe(1);
  });

  it("collapses two Sessions on the same civil day to one mark but counts both", () => {
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-19T08:00:00.000Z"),
          status: "SCHEDULED",
        },
        {
          startsAt: new Date("2026-08-19T18:00:00.000Z"),
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.find((day) => day.weekday === "X")?.hasSession).toBe(
      true
    );
    expect(result.days.filter((day) => day.hasSession)).toHaveLength(1);
    expect(result.sessionCount).toBe(2);
  });

  it("includes all Team Sessions, not only player-applicable expected days", () => {
    // Projection has no player filter — any team session in the week marks.
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-21T16:00:00.000Z"), // Fri
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.find((day) => day.weekday === "V")?.hasSession).toBe(
      true
    );
    expect(result.sessionCount).toBe(1);
  });

  it("ignores Sessions outside the Monday–Sunday civil week", () => {
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-16T18:00:00.000Z"), // prior Sunday
          status: "SCHEDULED",
        },
        {
          startsAt: new Date("2026-08-24T08:00:00.000Z"), // next Monday
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.sessionCount).toBe(0);
    expect(result.days.every((day) => !day.hasSession)).toBe(true);
  });

  it("uses Team timezone for Session civil-day bucketing near midnight", () => {
    // 2026-08-19 22:30 UTC = 2026-08-20 00:30 Madrid (CEST) → Thursday
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-19T22:30:00.000Z"),
          status: "SCHEDULED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days.map((day) => day.hasSession)).toEqual([
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it("keeps empty weeks calm: seven days, zero marks, zero count", () => {
    const result = projectRachaWeek({
      sessions: [
        {
          startsAt: new Date("2026-08-19T12:00:00.000Z"),
          status: "CANCELLED",
        },
      ],
      timeZone: MADRID,
      asOf: wednesdayAsOf,
    });

    expect(result.days).toHaveLength(7);
    expect(result.sessionCount).toBe(0);
    expect(result.days.every((day) => day.hasSession === false)).toBe(true);
  });
});

describe("rachaWeekQueryWindow", () => {
  it("returns a padded UTC window covering the civil Monday–Sunday week", () => {
    const asOf = new Date("2026-08-19T12:00:00.000Z");
    const window = rachaWeekQueryWindow(asOf, MADRID);

    expect(window.gte.toISOString()).toBe("2026-08-16T00:00:00.000Z");
    expect(window.lt.toISOString()).toBe("2026-08-25T00:00:00.000Z");
  });
});
