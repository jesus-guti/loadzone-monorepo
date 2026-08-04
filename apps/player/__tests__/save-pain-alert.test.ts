import { beforeEach, describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
  playerFindUnique: vi.fn(),
  createPlayerPainAlert: vi.fn(),
  evaluateAndEmitCareAlert: vi.fn(),
  injuryCreate: vi.fn(),
  playerUpdate: vi.fn(),
}));

vi.mock("@repo/database/pain-alert", () => ({
  createPlayerPainAlert: stubs.createPlayerPainAlert,
}));

vi.mock("@repo/database/care-alerts", () => ({
  evaluateAndEmitCareAlert: stubs.evaluateAndEmitCareAlert,
  PLAYER_CARE_CONFIRM_MESSAGE: "Tu equipo ya lo tiene",
}));

vi.mock("@repo/database", () => ({
  database: {
    player: {
      findUnique: stubs.playerFindUnique,
      update: stubs.playerUpdate,
    },
    injury: {
      create: stubs.injuryCreate,
    },
  },
}));

import { savePainAlert } from "../app/[token]/actions/save-pain-alert";

const noopPrev = { success: false } as const;

describe("savePainAlert (JES-54 AC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.playerFindUnique.mockResolvedValue({
      id: "player_1",
      name: "Ana",
      teamId: "team_1",
      dateOfBirth: new Date("2012-01-01T00:00:00.000Z"),
      ageBandOverride: null,
      team: {
        timezone: "Europe/Madrid",
        ageBandPolicy: null,
        reminderConsentPolicy: null,
        club: { ageBandPolicy: null },
      },
    });
    stubs.createPlayerPainAlert.mockResolvedValue({
      id: "pa_1",
      bodyPart: "rodilla",
      side: null,
      injuryType: null,
      reportedAt: new Date("2026-08-04T12:00:00.000Z"),
    });
    stubs.evaluateAndEmitCareAlert.mockResolvedValue({
      careFlagPresent: true,
      emitted: true,
    });
  });

  it("creates Pain Alert only, keeps player status untouched, and evaluates Care Alert with painAlert signal", async () => {
    const fd = new FormData();
    fd.set("token", "tok_1");
    fd.set("title", "Me duele la rodilla");
    fd.set("bodyPart", "rodilla");
    fd.set("severity", "MINOR");
    fd.set("description", "Al girar");

    const result = await savePainAlert(noopPrev, fd);

    expect(result.success).toBe(true);
    expect(result.careConfirm).toBe(true);
    expect(stubs.createPlayerPainAlert).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        playerId: "player_1",
        teamId: "team_1",
        title: "Me duele la rodilla",
        bodyPart: "rodilla",
        severity: "MINOR",
      })
    );
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
    expect(stubs.playerUpdate).not.toHaveBeenCalled();
    expect(stubs.evaluateAndEmitCareAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: "player_1",
        signals: {
          painAlert: expect.objectContaining({
            bodyPart: "rodilla",
            reportedAt: expect.any(Date),
          }),
        },
      })
    );
  });
});
