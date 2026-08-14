import { describe, expect, it } from "vitest";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { TeamInjuriesListPayload } from "@/features/injuries/types";

function collectNonPlainRscValues(value: unknown, path = "$"): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === "function") {
    return [`${path}:function`];
  }
  if (typeof value !== "object") {
    return [];
  }
  if (value instanceof Date) {
    return [`${path}:Date`];
  }
  if (value instanceof Map) {
    return [`${path}:Map`];
  }
  if (value instanceof Set) {
    return [`${path}:Set`];
  }
  const ctor = value.constructor?.name;
  if (ctor && ctor !== "Object" && ctor !== "Array") {
    return [`${path}:${ctor}`];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectNonPlainRscValues(item, `${path}[${index}]`)
    );
  }
  return Object.entries(value).flatMap(([key, nested]) =>
    collectNonPlainRscValues(nested, `${path}.${key}`)
  );
}

describe("RSC client props must be plain data", () => {
  it("rejects Date instances in a Team Wellness player payload", () => {
    const player = {
      id: "p1",
      imageUrl: null,
      name: "Ana",
      status: "AVAILABLE",
      currentStreak: 0,
      injuryExemptOnEvaluatedDay: false,
      entries: [
        {
          date: new Date("2026-08-14T00:00:00.000Z"),
          recovery: 5,
          energy: 3,
          soreness: 2,
          sleepHours: 8,
          sleepQuality: 4,
          rpe: 6,
          duration: 90,
          preFilledAt: new Date("2026-08-14T07:00:00.000Z"),
          postFilledAt: null,
          physioAlert: false,
        },
      ],
      stats: [{ riskLevel: "LOW", acwr: 1.1 }],
    };

    expect(collectNonPlainRscValues(player)).toEqual(
      expect.arrayContaining(["$.entries[0].date:Date", "$.entries[0].preFilledAt:Date"])
    );
  });

  it("accepts ISO strings in a Team Wellness player payload", () => {
    const player: TeamWellnessPlayer = {
      id: "p1",
      imageUrl: null,
      name: "Ana",
      status: "AVAILABLE",
      currentStreak: 0,
      injuryExemptOnEvaluatedDay: false,
      entries: [
        {
          date: "2026-08-14T00:00:00.000Z",
          recovery: 5,
          energy: 3,
          soreness: 2,
          sleepHours: 8,
          sleepQuality: 4,
          rpe: 6,
          duration: 90,
          preFilledAt: "2026-08-14T07:00:00.000Z",
          postFilledAt: null,
          physioAlert: false,
        },
      ],
      stats: [{ riskLevel: "LOW", acwr: 1.1 }],
    };

    expect(collectNonPlainRscValues(player)).toEqual([]);
  });

  it("accepts the team injuries list payload shape as plain strings", () => {
    const data: TeamInjuriesListPayload = {
      painAlerts: [
        {
          id: "a1",
          playerId: "p1",
          playerName: "Ana",
          reportedAt: "2026-08-14T10:00:00.000Z",
          title: "Molestia",
          summary: "Rodilla",
          bodyPart: "KNEE_R",
        },
      ],
      activeInjuries: [
        {
          id: "i1",
          playerId: "p1",
          playerName: "Ana",
          startDate: "2026-08-10",
          endDate: null,
          cause: "Esguince",
          regionLabels: ["Rodilla derecha"],
          regionDetail: null,
        },
      ],
      closedInjuries: [],
    };

    expect(collectNonPlainRscValues(data)).toEqual([]);
  });
});
