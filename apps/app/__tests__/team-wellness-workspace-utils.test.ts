import { describe, expect, it } from "vitest";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  buildWellnessSummary,
  getDailyPlayerState,
  getWellnessAlerts,
} from "@/features/wellness/components/team-wellness-workspace.utils";

function createPlayer(
  overrides: Partial<TeamWellnessPlayer> = {}
): TeamWellnessPlayer {
  return {
    id: "player_1",
    imageUrl: null,
    name: "Jugador Uno",
    status: "ACTIVE",
    currentStreak: 0,
    entries: [],
    stats: [],
    ...overrides,
  };
}

describe("team wellness workspace utils", () => {
  const wellnessLimits: WellnessLimits = {
    recovery: 4,
    energy: 2,
    soreness: 4,
    sleepHours: 6,
    sleepQuality: null,
  };

  it("marca alerta cuando el wellness cae por debajo de los limites", () => {
    const player = createPlayer({
      entries: [
        {
          date: new Date("2026-05-03T00:00:00Z"),
          recovery: 3,
          energy: 2,
          soreness: 4,
          sleepHours: 5,
          rpe: 7,
          duration: 90,
          preFilledAt: new Date("2026-05-03T07:00:00Z"),
          postFilledAt: new Date("2026-05-03T21:00:00Z"),
          physioAlert: false,
        },
      ],
    });

    expect(getWellnessAlerts(player.entries[0], wellnessLimits)).toEqual([
      "Recuperación",
      "Energía",
      "Agujetas",
      "Sueño",
    ]);
    expect(getDailyPlayerState(player, wellnessLimits)).toBe("ALERT");
  });

  it("resume completitud y alertas del grupo filtrado", () => {
    const players = [
      createPlayer({
        id: "player_alert",
        entries: [
          {
            date: new Date("2026-05-03T00:00:00Z"),
            recovery: 3,
            energy: 3,
            soreness: 2,
            sleepHours: 7,
            rpe: 5,
            duration: 80,
            preFilledAt: new Date("2026-05-03T07:00:00Z"),
            postFilledAt: new Date("2026-05-03T21:00:00Z"),
            physioAlert: true,
          },
        ],
      }),
      createPlayer({
        id: "player_pending",
        entries: [
          {
            date: new Date("2026-05-03T00:00:00Z"),
            recovery: 7,
            energy: 4,
            soreness: 2,
            sleepHours: 8,
            rpe: null,
            duration: null,
            preFilledAt: new Date("2026-05-03T07:00:00Z"),
            postFilledAt: null,
            physioAlert: false,
          },
        ],
      }),
    ];

    expect(buildWellnessSummary(players, wellnessLimits)).toEqual({
      alertCount: 1,
      energyAverage: 3.5,
      pendingCount: 1,
      postCompletedCount: 1,
      preCompletedCount: 2,
      recoveryAverage: 5,
      sorenessAverage: 2,
    });
  });
});
