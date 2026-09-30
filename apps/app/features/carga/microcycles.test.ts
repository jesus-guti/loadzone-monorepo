import { describe, expect, it } from "vitest";
import {
  MATCH_MINUTES,
  SESSION_MINUTES,
  abbreviatePlayerName,
  acBand,
  anchorDayKey,
  buildMicrocycleSheet,
} from "./microcycles";

describe("buildMicrocycleSheet", () => {
  it("starts microcycle 1 on the Monday of a midweek season start", () => {
    const sheet = buildMicrocycleSheet({
      seasonStart: "2026-08-05",
      seasonEnd: "2026-08-05",
      matchDates: [],
      sessionDates: ["2026-08-05"],
      players: [],
    });

    expect(sheet.days.map((day) => day.key)).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
    expect(sheet.microcycles).toHaveLength(1);
    expect(sheet.days.map((day) => day.matchDay)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("labels a match week and the day after, and leaves a matchless week blank", () => {
    const sheet = buildMicrocycleSheet({
      seasonStart: "2026-08-10",
      seasonEnd: "2026-08-23",
      matchDates: ["2026-08-16", "2026-08-19"],
      sessionDates: ["2026-08-16", "2026-08-19"],
      players: [],
    });

    const labels = sheet.days.map((day) => day.matchDay);
    expect(labels.slice(0, 7)).toEqual([
      "MD-6",
      "MD-5",
      "MD-4",
      "MD-3",
      "MD-2",
      "MD-1",
      "MD",
    ]);
    expect(labels.slice(7, 14)).toEqual([
      "MD+1",
      "MD-1",
      "MD",
      "MD+1",
      "MD+2",
      "MD+3",
      "MD+4",
    ]);

    const breakWeek = buildMicrocycleSheet({
      seasonStart: "2026-08-24",
      seasonEnd: "2026-08-30",
      matchDates: [],
      sessionDates: [],
      players: [],
    });
    expect(breakWeek.days.every((day) => day.matchDay === null)).toBe(true);
  });

  it("uses 80 minutes on training days, 95 on matches, and averages only players who reported", () => {
    const sheet = buildMicrocycleSheet({
      seasonStart: "2026-08-03",
      seasonEnd: "2026-08-04",
      matchDates: [],
      sessionDates: ["2026-08-03"],
      players: [
        { id: "a", name: "Aitor", rpeByDate: { "2026-08-03": 6 } },
        { id: "b", name: "Bruno", rpeByDate: { "2026-08-03": 8 } },
        { id: "c", name: "Carlos", rpeByDate: {} },
      ],
    });

    const monday = sheet.days[0];
    const tuesday = sheet.days[1];
    expect(monday?.minutes).toBe(SESSION_MINUTES);
    expect(monday?.teamLoad).toBe(Math.round(((6 + 8) / 2) * SESSION_MINUTES));
    expect(sheet.players.map((player) => player.rpe[0])).toEqual([6, 8, null]);
    expect(sheet.players.map((player) => player.loads[0])).toEqual([
      6 * SESSION_MINUTES,
      8 * SESSION_MINUTES,
      0,
    ]);
    expect(tuesday?.minutes).toBe(0);
    expect(tuesday?.teamLoad).toBe(0);
    expect(sheet.microcycles[0]?.loadSum).toBe(monday?.teamLoad ?? 0);

    const acuteAfterRest =
      ((monday?.teamLoad ?? 0) + 0) / 2;
    expect(tuesday?.acute).toBe(Math.round(acuteAfterRest));

    const matchDay = buildMicrocycleSheet({
      seasonStart: "2026-08-03",
      seasonEnd: "2026-08-03",
      matchDates: ["2026-08-03"],
      sessionDates: ["2026-08-03"],
      players: [{ id: "a", name: "Aitor", rpeByDate: { "2026-08-03": 7 } }],
    });
    expect(matchDay.days[0]?.minutes).toBe(MATCH_MINUTES);
    expect(matchDay.players[0]?.loads[0]).toBe(7 * MATCH_MINUTES);
  });

  it("flags a day-over-day team load rise of at least 15%", () => {
    const sheet = buildMicrocycleSheet({
      seasonStart: "2026-08-03",
      seasonEnd: "2026-08-04",
      matchDates: [],
      sessionDates: ["2026-08-03", "2026-08-04"],
      players: [
        {
          id: "a",
          name: "Aitor",
          rpeByDate: { "2026-08-03": 4, "2026-08-04": 5 },
        },
      ],
    });

    expect(sheet.days[0]?.jump).toBe(false);
    expect(sheet.days[1]?.jump).toBe(true);
    expect(acBand(0.7)).toBe("bajo");
    expect(acBand(1.3)).toBe("optimo");
    expect(acBand(1.4)).toBe("transicion");
    expect(acBand(1.6)).toBe("peligro");
  });
});

describe("abbreviatePlayerName", () => {
  it("uses the initial and the first surname", () => {
    expect(abbreviatePlayerName("Aitor García López")).toBe("A. García");
  });

  it("truncates a long surname or a single word", () => {
    expect(abbreviatePlayerName("Ana Villarrealdegómez")).toBe("A. Villarreald…");
    expect(abbreviatePlayerName("Constantino")).toBe("Constanti…");
  });
});

describe("anchorDayKey", () => {
  const days = [{ key: "2026-09-01" }, { key: "2026-09-30" }];

  it("lands on today when that column exists", () => {
    expect(anchorDayKey(days, "2026-09-30")).toBe("2026-09-30");
  });

  it("lands on the next column when today is missing", () => {
    expect(anchorDayKey(days, "2026-09-15")).toBe("2026-09-30");
  });
});
