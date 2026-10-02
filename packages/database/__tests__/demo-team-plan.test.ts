import { describe, expect, it } from "vitest";
import { planDemoSessions, scriptDemoSeason } from "../demo-team-plan";

describe("planDemoSessions", () => {
  it("keeps league weeks on Tuesday, Thursday, Friday and Sunday", () => {
    const week = planDemoSessions("2026-08-30").filter(
      (session) => session.date >= "2026-08-24" && session.date <= "2026-08-30"
    );
    expect(week.map((session) => [session.date, session.type])).toEqual([
      ["2026-08-25", "TRAINING"],
      ["2026-08-27", "TRAINING"],
      ["2026-08-28", "TRAINING"],
      ["2026-08-30", "MATCH"],
    ]);
    expect(week.find((session) => session.type === "MATCH")?.minutes).toBe(95);
  });

  it("averages training minutes at 80", () => {
    const minutes = planDemoSessions("2026-10-01")
      .filter((session) => session.type === "TRAINING")
      .map((session) => session.minutes);
    const mean = minutes.reduce((sum, value) => sum + value, 0) / minutes.length;
    expect(mean).toBe(80);
  });

  it("adds the next training day when the window grows", () => {
    const untilFirst = planDemoSessions("2026-10-01").at(-1)?.date;
    const untilSecond = planDemoSessions("2026-10-02").at(-1)?.date;
    expect(untilFirst).toBe("2026-10-01");
    expect(untilSecond).toBe("2026-10-02");
  });
});

describe("scriptDemoSeason", () => {
  it("skips check-ins for an injured player and fills most of the rest", () => {
    const sessions = scriptDemoSeason(20, "2026-08-14");
    const day = sessions.find((session) => session.date === "2026-08-14");
    expect(day?.players[4]?.injured).toBe(true);
    expect(day?.players[4]?.fills).toBe(false);
    const filled = day?.players.filter((player) => player.fills).length ?? 0;
    expect(filled).toBeGreaterThan(10);
  });
});
