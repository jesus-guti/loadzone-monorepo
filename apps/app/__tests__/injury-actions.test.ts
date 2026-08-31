import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StaffContext } from "@/lib/auth-context";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  playerFindFirst: vi.fn(),
  injuryCreate: vi.fn(),
  injuryFindFirst: vi.fn(),
  injuryUpdate: vi.fn(),
  injuryDelete: vi.fn(),
  injuryBodyRegionDeleteMany: vi.fn(),
  injuryBodyRegionCreateMany: vi.fn(),
  painAlertUpdateMany: vi.fn(),
  painAlertFindFirst: vi.fn(),
  syncPlayerStatusFromInjuries: vi.fn(),
  findActiveSeasonIdForTeam: vi.fn(),
  recomputeAndPersistPlayerStreak: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
}));

vi.mock("@repo/database/injury-status", () => ({
  syncPlayerStatusFromInjuries: stubs.syncPlayerStatusFromInjuries,
}));

vi.mock("@repo/database/recompute-player-streak", () => ({
  findActiveSeasonIdForTeam: stubs.findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak: stubs.recomputeAndPersistPlayerStreak,
}));

vi.mock("@repo/database", () => ({
  database: {
    player: { findFirst: stubs.playerFindFirst },
    injury: {
      create: stubs.injuryCreate,
      findFirst: stubs.injuryFindFirst,
      update: stubs.injuryUpdate,
      delete: stubs.injuryDelete,
    },
    injuryBodyRegion: {
      deleteMany: stubs.injuryBodyRegionDeleteMany,
      createMany: stubs.injuryBodyRegionCreateMany,
    },
    painAlert: {
      updateMany: stubs.painAlertUpdateMany,
      findFirst: stubs.painAlertFindFirst,
    },
    $transaction: stubs.transaction,
  },
}));

import {
  closeInjury,
  createInjury,
  deleteInjury,
  dismissPainAlert,
  reopenInjury,
  restorePainAlert,
  updateInjury,
} from "@/features/injuries/actions/injury-actions";

const noopPrev = { success: false } as const;

function staffFixture(): StaffContext {
  return {
    membershipId: "mem-1",
    user: { id: "user-1" },
    activeTeam: {
      id: "team-1",
      timezone: "Europe/Madrid",
    },
    activeSeason: { id: "season-1" },
  } as StaffContext;
}

function createForm(overrides: {
  playerId?: string;
  startDate?: string;
  cause?: string;
  regionDetail?: string;
  regionIds?: string[];
  painAlertId?: string;
} = {}): FormData {
  const fd = new FormData();
  fd.set("playerId", overrides.playerId ?? "player-1");
  fd.set("startDate", overrides.startDate ?? "2026-08-01");
  fd.set("cause", overrides.cause ?? "Partido");
  if (overrides.regionDetail !== undefined) {
    fd.set("regionDetail", overrides.regionDetail);
  }
  if (overrides.painAlertId !== undefined) {
    fd.set("painAlertId", overrides.painAlertId);
  }
  fd.set(
    "regionIds",
    JSON.stringify(overrides.regionIds ?? ["KNEE_R", "ANKLE_R"])
  );
  return fd;
}

describe("injury actions (JES-51)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    stubs.playerFindFirst.mockResolvedValue({ id: "player-1" });
    stubs.injuryCreate.mockResolvedValue({ id: "inj-1" });
    stubs.syncPlayerStatusFromInjuries.mockResolvedValue("INJURED");
    stubs.findActiveSeasonIdForTeam.mockResolvedValue("season-1");
    stubs.recomputeAndPersistPlayerStreak.mockResolvedValue(undefined);
    stubs.transaction.mockResolvedValue([]);
  // updateInjury uses interactive array $transaction — stub returns resolved array
  stubs.injuryBodyRegionDeleteMany.mockResolvedValue({});
  stubs.injuryBodyRegionCreateMany.mockResolvedValue({});
  stubs.injuryUpdate.mockResolvedValue({});
    stubs.painAlertUpdateMany.mockResolvedValue({ count: 1 });
    stubs.painAlertFindFirst.mockResolvedValue({ playerId: "player-1" });
  });

  it("createInjury with multi-region succeeds and syncs status", async () => {
    const result = await createInjury(noopPrev, createForm());

    expect(result.success).toBe(true);
    expect(result.injuryId).toBe("inj-1");
    expect(stubs.injuryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          playerId: "player-1",
          teamId: "team-1",
          cause: "Partido",
          createdByUserId: "user-1",
          regions: {
            create: [{ regionId: "KNEE_R" }, { regionId: "ANKLE_R" }],
          },
        }),
      })
    );
    expect(stubs.syncPlayerStatusFromInjuries).toHaveBeenCalledWith(
      expect.anything(),
      "player-1",
      { timeZone: "Europe/Madrid" }
    );
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/players/player-1");
  });

  it("createInjury rejects zero regions", async () => {
    const result = await createInjury(
      noopPrev,
      createForm({ regionIds: [] })
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/zona/i);
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("createInjury rejects empty cause", async () => {
    const result = await createInjury(noopPrev, createForm({ cause: "  " }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/causa/i);
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("closeInjury sets inclusive endDate and syncs", async () => {
    stubs.injuryFindFirst.mockResolvedValue({
      id: "inj-1",
      playerId: "player-1",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
    });
    stubs.injuryUpdate.mockResolvedValue({});
    stubs.syncPlayerStatusFromInjuries.mockResolvedValue("AVAILABLE");

    const fd = new FormData();
    fd.set("injuryId", "inj-1");
    fd.set("endDate", "2026-08-04");

    const result = await closeInjury(noopPrev, fd);

    expect(result.success).toBe(true);
    expect(stubs.injuryUpdate).toHaveBeenCalledWith({
      where: { id: "inj-1" },
      data: { endDate: new Date("2026-08-04T00:00:00.000Z") },
    });
    expect(stubs.syncPlayerStatusFromInjuries).toHaveBeenCalled();
  });

  it("closeInjury rejects endDate before startDate", async () => {
    stubs.injuryFindFirst.mockResolvedValue({
      id: "inj-1",
      playerId: "player-1",
      startDate: new Date("2026-08-10T00:00:00.000Z"),
    });

    const fd = new FormData();
    fd.set("injuryId", "inj-1");
    fd.set("endDate", "2026-08-04");

    const result = await closeInjury(noopPrev, fd);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/fin/i);
    expect(stubs.injuryUpdate).not.toHaveBeenCalled();
  });

  it("updateInjury replaces regions and keeps closed endDate", async () => {
    stubs.injuryFindFirst.mockResolvedValue({
      id: "inj-1",
      playerId: "player-1",
      endDate: new Date("2026-08-04T00:00:00.000Z"),
    });
    stubs.injuryBodyRegionDeleteMany.mockResolvedValue({});
    stubs.injuryBodyRegionCreateMany.mockResolvedValue({});
    stubs.injuryUpdate.mockResolvedValue({});

    const fd = new FormData();
    fd.set("injuryId", "inj-1");
    fd.set("startDate", "2026-08-01");
    fd.set("cause", "Entreno");
    fd.set("regionIds", JSON.stringify(["THIGH_FRONT_L"]));

    const result = await updateInjury(noopPrev, fd);

    expect(result.success).toBe(true);
    expect(stubs.injuryBodyRegionDeleteMany).toHaveBeenCalledWith({
      where: { injuryId: "inj-1" },
    });
    expect(stubs.injuryBodyRegionCreateMany).toHaveBeenCalledWith({
      data: [{ injuryId: "inj-1", regionId: "THIGH_FRONT_L" }],
    });
    expect(stubs.injuryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cause: "Entreno",
        }),
      })
    );
    expect(stubs.injuryUpdate.mock.calls[0]?.[0]?.data?.endDate).toBeUndefined();
    expect(stubs.syncPlayerStatusFromInjuries).toHaveBeenCalled();
  });

  it("reopenInjury clears endDate and syncs", async () => {
    stubs.injuryFindFirst.mockResolvedValue({
      id: "inj-1",
      playerId: "player-1",
    });
    stubs.injuryUpdate.mockResolvedValue({});
    stubs.syncPlayerStatusFromInjuries.mockResolvedValue("INJURED");

    const fd = new FormData();
    fd.set("injuryId", "inj-1");

    const result = await reopenInjury(noopPrev, fd);

    expect(result.success).toBe(true);
    expect(stubs.injuryUpdate).toHaveBeenCalledWith({
      where: { id: "inj-1" },
      data: { endDate: null },
    });
    expect(stubs.syncPlayerStatusFromInjuries).toHaveBeenCalledWith(
      expect.anything(),
      "player-1",
      { timeZone: "Europe/Madrid" }
    );
  });

  it("createInjury requires staff team context (no player-path create)", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    const result = await createInjury(noopPrev, createForm());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/equipo/i);
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("createInjury rejects player outside active team", async () => {
    stubs.playerFindFirst.mockResolvedValue(null);
    const result = await createInjury(noopPrev, createForm());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/jugador/i);
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("deleteInjury removes open or closed injury and syncs", async () => {
    stubs.injuryFindFirst.mockResolvedValue({
      id: "inj-1",
      playerId: "player-1",
    });
    stubs.injuryDelete.mockResolvedValue({});
    stubs.syncPlayerStatusFromInjuries.mockResolvedValue("AVAILABLE");

    const fd = new FormData();
    fd.set("injuryId", "inj-1");

    const result = await deleteInjury(noopPrev, fd);

    expect(result.success).toBe(true);
    expect(stubs.injuryDelete).toHaveBeenCalledWith({
      where: { id: "inj-1" },
    });
    expect(stubs.syncPlayerStatusFromInjuries).toHaveBeenCalledWith(
      expect.anything(),
      "player-1",
      { timeZone: "Europe/Madrid" }
    );
  });

  it("deleteInjury rejects missing team access", async () => {
    stubs.injuryFindFirst.mockResolvedValue(null);
    const fd = new FormData();
    fd.set("injuryId", "inj-1");
    const result = await deleteInjury(noopPrev, fd);
    expect(result.success).toBe(false);
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("createInjury links an open pain alert when painAlertId is present", async () => {
    const result = await createInjury(
      noopPrev,
      createForm({ painAlertId: "pa-1" })
    );
    expect(result.success).toBe(true);
    expect(stubs.painAlertUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "pa-1",
        teamId: "team-1",
        playerId: "player-1",
        promotedInjuryId: null,
        dismissedAt: null,
      },
      data: { promotedInjuryId: "inj-1" },
    });
  });

  it("createInjury does not link when painAlertId is absent", async () => {
    await createInjury(noopPrev, createForm());
    expect(stubs.painAlertUpdateMany).not.toHaveBeenCalled();
  });

  it("dismissPainAlert sets dismissedAt and does not create Injury", async () => {
    const fd = new FormData();
    fd.set("painAlertId", "pa-1");
    const result = await dismissPainAlert(noopPrev, fd);
    expect(result.success).toBe(true);
    expect(stubs.painAlertUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "pa-1",
          teamId: "team-1",
          promotedInjuryId: null,
          dismissedAt: null,
        }),
        data: expect.objectContaining({ dismissedAt: expect.any(Date) }),
      })
    );
    expect(stubs.injuryCreate).not.toHaveBeenCalled();
  });

  it("restorePainAlert clears dismissedAt", async () => {
    const fd = new FormData();
    fd.set("painAlertId", "pa-1");
    const result = await restorePainAlert(noopPrev, fd);
    expect(result.success).toBe(true);
    expect(stubs.painAlertUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "pa-1",
        teamId: "team-1",
        promotedInjuryId: null,
        dismissedAt: { not: null },
      },
      data: { dismissedAt: null },
    });
  });
});
