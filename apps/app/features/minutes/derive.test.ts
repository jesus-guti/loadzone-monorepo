import { resolveLoadMinutes } from "@repo/database/session-minutes";
import { describe, expect, it } from "vitest";
import {
  fullMatchLength,
  minutesPlayedByPlayer,
  shouldPromptMinutes,
  teamDayMinutes,
} from "./derive";

const base = {
  starterIds: ["a", "b"],
  benchIds: ["c"],
  substitutions: [] as {
    minute: number;
    playerOutId: string;
    playerInId: string | null;
  }[],
  stoppageFirst: 2,
  stoppageSecond: 4,
  extraTime: false,
  stoppageExtraFirst: 1,
  stoppageExtraSecond: 1,
};

describe("minutesPlayedByPlayer", () => {
  it("credits starters with open play plus stoppage and leaves the bench at 0", () => {
    const played = minutesPlayedByPlayer(base);
    expect(played.a).toBe(90 + 2 + 4);
    expect(played.c).toBe(0);
    expect(fullMatchLength(base)).toBe(96);
  });

  it("stops a sending-off and does not give those minutes to anyone else", () => {
    const played = minutesPlayedByPlayer({
      ...base,
      substitutions: [{ minute: 70, playerOutId: "a", playerInId: null }],
    });
    expect(played.a).toBe(70 + 2);
    expect(played.b).toBe(96);
    expect(played.c).toBe(0);
  });

  it("gives the substitute the rest of the match including second-half stoppage only", () => {
    const played = minutesPlayedByPlayer({
      ...base,
      substitutions: [{ minute: 60, playerOutId: "a", playerInId: "c" }],
    });
    expect(played.a).toBe(60 + 2);
    expect(played.c).toBe(30 + 4);
  });

  it("does not add penalty-shoot-out time and does add two extra-time halves", () => {
    const withExtra = minutesPlayedByPlayer({
      ...base,
      extraTime: true,
    });
    expect(withExtra.a).toBe(120 + 2 + 4 + 1 + 1);
    expect(fullMatchLength({ ...base, extraTime: true })).toBe(128);
  });
});

describe("teamDayMinutes", () => {
  it("sums both full match lengths and ignores training on a match day", () => {
    expect(
      teamDayMinutes([
        { type: "MATCH", sharedMinutes: null, fullMatchLength: 96 },
        { type: "MATCH", sharedMinutes: null, fullMatchLength: 90 },
        { type: "TRAINING", sharedMinutes: 80, fullMatchLength: null },
      ])
    ).toBe(186);
  });

  it("uses 80 per training when shared minutes are unset", () => {
    expect(
      teamDayMinutes([
        { type: "TRAINING", sharedMinutes: null, fullMatchLength: null },
        { type: "RECOVERY", sharedMinutes: 40, fullMatchLength: null },
      ])
    ).toBe(120);
  });
});

describe("shouldPromptMinutes", () => {
  it("stays hidden before the configured hour and when everything is logged", () => {
    const sessions = [
      {
        cancelled: false,
        type: "TRAINING" as const,
        sharedMinutes: null,
        hasLineup: false,
      },
    ];
    expect(shouldPromptMinutes({ hour: 19, promptHour: 20, sessions })).toBe(
      false
    );
    expect(
      shouldPromptMinutes({
        hour: 20,
        promptHour: 20,
        sessions: [{ ...sessions[0], sharedMinutes: 80 }],
      })
    ).toBe(false);
    expect(shouldPromptMinutes({ hour: 21, promptHour: 20, sessions })).toBe(
      true
    );
  });
});

describe("resolveLoadMinutes", () => {
  it("prefers match minutes, then shared minutes, then check-in duration", () => {
    expect(
      resolveLoadMinutes({
        sessionType: "MATCH",
        minutesPlayed: 70,
        sharedMinutes: null,
        checkInDuration: 40,
      })
    ).toBe(70);
    expect(
      resolveLoadMinutes({
        sessionType: "TRAINING",
        minutesPlayed: null,
        sharedMinutes: 80,
        checkInDuration: 40,
      })
    ).toBe(80);
    expect(
      resolveLoadMinutes({
        sessionType: null,
        minutesPlayed: null,
        sharedMinutes: null,
        checkInDuration: 40,
      })
    ).toBe(40);
  });
});
