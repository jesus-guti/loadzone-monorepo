import { describe, expect, it, vi } from "vitest";
import {
  createStaffInjury,
  parseBodyRegionIds,
} from "../create-injury";
import {
  buildInjuryPrefillFromPainAlert,
  isOpenPainAlert,
  promotePainAlertToInjury,
} from "../promote-pain-alert";

describe("parseBodyRegionIds", () => {
  it("keeps unique catalog ids and drops unknowns", () => {
    expect(parseBodyRegionIds(["KNEE_L", "KNEE_L", "NOT_A_REGION", "ANKLE_R"])).toEqual([
      "KNEE_L",
      "ANKLE_R",
    ]);
  });
});

describe("createStaffInjury", () => {
  it("requires ≥1 BodyRegion and syncs status from Injury (not Care Alert)", async () => {
    const injuryCreate = vi.fn().mockResolvedValue({
      id: "inj_1",
      startDate: new Date("2026-08-04T00:00:00.000Z"),
    });
    const injuryCount = vi.fn().mockResolvedValue(1);
    const playerFind = vi.fn().mockResolvedValue({ status: "AVAILABLE" });
    const playerUpdate = vi.fn().mockResolvedValue({});

    const db = {
      injury: { create: injuryCreate, count: injuryCount },
      player: { findUnique: playerFind, update: playerUpdate },
    };

    await expect(
      createStaffInjury(db, {
        playerId: "p1",
        teamId: "t1",
        cause: "Golpe",
        severity: "MINOR",
        regionIds: [],
        timeZone: "Europe/Madrid",
        startDate: "2026-08-04",
      })
    ).rejects.toThrow(/BodyRegion/);

    const result = await createStaffInjury(db, {
      playerId: "p1",
      teamId: "t1",
      cause: "Golpe",
      severity: "MINOR",
      regionIds: ["KNEE_L"],
      timeZone: "Europe/Madrid",
      startDate: "2026-08-04",
      createdByUserId: "u1",
    });

    expect(result.id).toBe("inj_1");
    expect(injuryCreate).toHaveBeenCalledTimes(1);
    expect(injuryCreate.mock.calls[0]?.[0]).toMatchObject({
      data: {
        playerId: "p1",
        teamId: "t1",
        cause: "Golpe",
        severity: "MINOR",
        createdByUserId: "u1",
        regions: { create: [{ regionId: "KNEE_L" }] },
      },
    });
    expect(playerUpdate).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "INJURED" },
    });
    // Structural: staff create client has no Care Alert surface.
    expect(db).not.toHaveProperty("careAlert");
  });
});

describe("buildInjuryPrefillFromPainAlert / isOpenPainAlert", () => {
  it("maps title→cause, keeps severity, notes from description + bodyPart hint", () => {
    expect(
      buildInjuryPrefillFromPainAlert({
        title: "Molestia rodilla",
        description: "Desde el sábado",
        bodyPart: "rodilla",
        severity: "MODERATE",
      })
    ).toEqual({
      cause: "Molestia rodilla",
      severity: "MODERATE",
      staffNotes: "Desde el sábado\nZona (jugador): rodilla",
      regionDetail: null,
    });
  });

  it("treats null promotedInjuryId as open triage", () => {
    expect(
      isOpenPainAlert({ promotedInjuryId: null, dismissedAt: null })
    ).toBe(true);
    expect(
      isOpenPainAlert({ promotedInjuryId: "inj_1", dismissedAt: null })
    ).toBe(false);
    expect(
      isOpenPainAlert({
        promotedInjuryId: null,
        dismissedAt: new Date("2026-08-31T10:00:00.000Z"),
      })
    ).toBe(false);
  });
});

describe("promotePainAlertToInjury", () => {
  it("creates Injury, links promotedInjuryId, and leaves alert out of open set", async () => {
    const painAlertFind = vi.fn().mockResolvedValue({
      id: "pa_1",
      playerId: "p1",
      teamId: "t1",
      title: "Molestia isquio",
      description: "Al esprintar",
      bodyPart: "isquio",
      severity: "MINOR",
      promotedInjuryId: null,
      dismissedAt: null,
    });
    const painAlertUpdate = vi.fn().mockResolvedValue({});
    const injuryCreate = vi.fn().mockResolvedValue({
      id: "inj_9",
      startDate: new Date("2026-08-04T00:00:00.000Z"),
    });
    const injuryCount = vi.fn().mockResolvedValue(1);
    const playerFind = vi.fn().mockResolvedValue({ status: "AVAILABLE" });
    const playerUpdate = vi.fn().mockResolvedValue({});

    const db = {
      painAlert: { findFirst: painAlertFind, update: painAlertUpdate },
      injury: { create: injuryCreate, count: injuryCount },
      player: { findUnique: playerFind, update: playerUpdate },
    };

    const result = await promotePainAlertToInjury(db, {
      painAlertId: "pa_1",
      teamId: "t1",
      regionIds: ["THIGH_BACK_R"],
      timeZone: "Europe/Madrid",
      startDate: "2026-08-04",
      createdByUserId: "staff_1",
    });

    expect(result).toEqual({ injuryId: "inj_9", painAlertId: "pa_1" });
    expect(injuryCreate.mock.calls[0]?.[0]).toMatchObject({
      data: {
        cause: "Molestia isquio",
        severity: "MINOR",
        staffNotes: "Al esprintar\nZona (jugador): isquio",
        regions: { create: [{ regionId: "THIGH_BACK_R" }] },
      },
    });
    expect(painAlertUpdate).toHaveBeenCalledWith({
      where: { id: "pa_1" },
      data: { promotedInjuryId: "inj_9" },
    });
    expect(db).not.toHaveProperty("careAlert");
  });

  it("rejects already-promoted alerts", async () => {
    const db = {
      painAlert: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      injury: {
        create: vi.fn(),
        count: vi.fn(),
      },
      player: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    await expect(
      promotePainAlertToInjury(db, {
        painAlertId: "pa_gone",
        teamId: "t1",
        regionIds: ["KNEE_L"],
        timeZone: "Europe/Madrid",
      })
    ).rejects.toThrow(/ya promovido|no encontrado/i);
    expect(db.injury.create).not.toHaveBeenCalled();
  });
});
