import { describe, expect, it } from "vitest";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  buildWellnessSummary,
  getDailyPlayerState,
  getDailyStateLabel,
  getWellnessAlerts,
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
    injuryExemptOnEvaluatedDay: false,
    entries: [],
    stats: [],
    ...overrides,
  };
}

const emptyEntryFields = {
  recovery: null as number | null,
  energy: null as number | null,
  soreness: null as number | null,
  sleepHours: null as number | null,
  sleepQuality: null as number | null,
  rpe: null as number | null,
  duration: null as number | null,
  physioAlert: false,
};

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
  });

  describe("wellness exemption day-state matrix (JES-53)", () => {
    it("marks active Injury with no entry as EXEMPTED (Exento)", () => {
      const player = createPlayer({
        status: "INJURED",
        injuryExemptOnEvaluatedDay: true,
        entries: [],
      });

      expect(getDailyPlayerState(player, wellnessLimits)).toBe("EXEMPTED");
      expect(getDailyStateLabel("EXEMPTED")).toBe("Exento");
    });

    it("prefers COMPLETED when injury-exempt player finishes voluntary check-in", () => {
      const player = createPlayer({
        status: "INJURED",
        injuryExemptOnEvaluatedDay: true,
        entries: [
          {
            date: new Date("2026-05-03T00:00:00Z"),
            ...emptyEntryFields,
            recovery: 7,
            energy: 4,
            soreness: 2,
            sleepHours: 8,
            sleepQuality: 4,
            preFilledAt: new Date("2026-05-03T07:00:00Z"),
            postFilledAt: new Date("2026-05-03T21:00:00Z"),
          },
        ],
      });

      expect(getDailyPlayerState(player, wellnessLimits)).toBe("COMPLETED");
    });

    it("keeps partial voluntary check-in as EXEMPTED (not Pendiente)", () => {
      const player = createPlayer({
        status: "INJURED",
        injuryExemptOnEvaluatedDay: true,
        entries: [
          {
            date: new Date("2026-05-03T00:00:00Z"),
            ...emptyEntryFields,
            recovery: 7,
            energy: 4,
            preFilledAt: new Date("2026-05-03T07:00:00Z"),
            postFilledAt: null,
          },
        ],
      });

      expect(getDailyPlayerState(player, wellnessLimits)).toBe("EXEMPTED");
    });

    it("lets ALERT win over exemption when voluntary entry has alert signals", () => {
      const player = createPlayer({
        status: "INJURED",
        injuryExemptOnEvaluatedDay: true,
        entries: [
          {
            date: new Date("2026-05-03T00:00:00Z"),
            recovery: 3,
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

      expect(getDailyPlayerState(player, wellnessLimits)).toBe("ALERT");
    });

    it("does not exempt from Pain Alert alone (no Injury interval flag)", () => {
      const player = createPlayer({
        status: "AVAILABLE",
        injuryExemptOnEvaluatedDay: false,
        entries: [],
      });

      expect(getDailyPlayerState(player, wellnessLimits)).toBe("NOT_COMPLETED");
      expect(getDailyStateLabel("NOT_COMPLETED")).toBe("Pendiente");
    });

    it("excludes EXEMPTED players from pendingCount", () => {
      const players = [
        createPlayer({
          id: "exempt",
          status: "INJURED",
          injuryExemptOnEvaluatedDay: true,
          entries: [],
        }),
        createPlayer({
          id: "pending",
          injuryExemptOnEvaluatedDay: false,
          entries: [],
        }),
        createPlayer({
          id: "done",
          injuryExemptOnEvaluatedDay: false,
          entries: [
            {
              date: new Date("2026-05-03T00:00:00Z"),
              ...emptyEntryFields,
              recovery: 7,
              energy: 4,
              soreness: 1,
              sleepHours: 8,
              sleepQuality: 4,
              preFilledAt: new Date("2026-05-03T07:00:00Z"),
              postFilledAt: new Date("2026-05-03T21:00:00Z"),
            },
          ],
        }),
      ];

      expect(buildWellnessSummary(players, wellnessLimits).pendingCount).toBe(1);
    });
  });
});
