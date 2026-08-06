import { describe, expect, it } from "vitest";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  averageProgressPercent,
  buildWellnessSummary,
  getDailyPlayerState,
  getWellnessAlerts,
  listPendingPlayers,
} from "@/features/wellness/components/team-wellness-workspace.utils";

function createPlayer(
  overrides: Partial<TeamWellnessPlayer> = {}
): TeamWellnessPlayer {
  return {
    id: "player_1",
    imageUrl: null,
    name: "Jugador Uno",
    status: "AVAILABLE",
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
    sleepQuality: 2,
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
          sleepQuality: 2,
          rpe: 7,
          duration: 90,
          preFilledAt: new Date("2026-05-03T07:00:00Z"),
          postFilledAt: new Date("2026-05-03T21:00:00Z"),
          physioAlert: false,
        },
      ],
    });

    expect(getWellnessAlerts(player.entries[0], wellnessLimits)).toEqual([
      { metric: "recovery", careRelevant: false, label: "Recuperación" },
      { metric: "energy", careRelevant: false, label: "Energía" },
      { metric: "soreness", careRelevant: true, label: "Agujetas" },
      { metric: "sleepHours", careRelevant: false, label: "Sueño" },
      { metric: "sleepQuality", careRelevant: false, label: "Calidad del sueño" },
    ]);
    expect(getDailyPlayerState(player, wellnessLimits)).toBe("ALERT");
  });

  it("distingue flags care-relevant de staff-only y no mezcla ACWR", () => {
    const player = createPlayer({
      entries: [
        {
          date: new Date("2026-05-03T00:00:00Z"),
          recovery: 3,
          energy: 4,
          soreness: 5,
          sleepHours: 8,
          sleepQuality: 4,
          rpe: 5,
          duration: 80,
          preFilledAt: new Date("2026-05-03T07:00:00Z"),
          postFilledAt: new Date("2026-05-03T21:00:00Z"),
          physioAlert: false,
        },
      ],
      stats: [{ riskLevel: "HIGH", acwr: 1.6 }],
    });

    const flags = getWellnessAlerts(player.entries[0], wellnessLimits);
    expect(flags.filter((flag) => flag.careRelevant)).toEqual([
      { metric: "soreness", careRelevant: true, label: "Agujetas" },
    ]);
    expect(flags.some((flag) => flag.metric === "recovery")).toBe(true);
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
            sleepQuality: 4,
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
            sleepQuality: 4,
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
    expect(listPendingPlayers(players).map((player) => player.id)).toEqual([
      "player_pending",
    ]);
  });

  it("lista pendientes cuando falta pre o post (post esperado)", () => {
    const missingPre = createPlayer({
      id: "missing_pre",
      entries: [
        {
          date: new Date("2026-05-03T00:00:00Z"),
          recovery: null,
          energy: null,
          soreness: null,
          sleepHours: null,
          sleepQuality: null,
          rpe: null,
          duration: null,
          preFilledAt: null,
          postFilledAt: null,
          physioAlert: false,
        },
      ],
    });
    const complete = createPlayer({
      id: "complete",
      entries: [
        {
          date: new Date("2026-05-03T00:00:00Z"),
          recovery: 7,
          energy: 4,
          soreness: 2,
          sleepHours: 8,
          sleepQuality: 4,
          rpe: 5,
          duration: 80,
          preFilledAt: new Date("2026-05-03T07:00:00Z"),
          postFilledAt: new Date("2026-05-03T21:00:00Z"),
          physioAlert: false,
        },
      ],
    });

    expect(listPendingPlayers([missingPre, complete]).map((p) => p.id)).toEqual(
      ["missing_pre"]
    );
  });

  it("convierte medias a porcentaje de barra segun escala del formulario", () => {
    expect(averageProgressPercent(5, "recovery")).toBe(50);
    expect(averageProgressPercent(4, "energy")).toBe(80);
    expect(averageProgressPercent(2.5, "soreness")).toBe(50);
    expect(averageProgressPercent(null, "recovery")).toBeNull();
    expect(averageProgressPercent(12, "recovery")).toBe(100);
  });
});
