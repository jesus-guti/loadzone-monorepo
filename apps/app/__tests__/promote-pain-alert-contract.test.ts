import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StaffContext } from "@/lib/auth-context";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  promotePainAlertToInjury: vi.fn(),
  findActiveSeasonIdForTeam: vi.fn(),
  recomputeAndPersistPlayerStreak: vi.fn(),
  syncPlayerStatusFromInjuries: vi.fn(),
  evaluateAndEmitCareAlert: vi.fn(),
  playerFindFirst: vi.fn(),
  painAlertFindUnique: vi.fn(),
  injuryCreate: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
}));

vi.mock("@repo/database/promote-pain-alert", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@repo/database/promote-pain-alert")>();
  return {
    ...actual,
    promotePainAlertToInjury: stubs.promotePainAlertToInjury,
  };
});

vi.mock("@repo/database/recompute-player-streak", () => ({
  findActiveSeasonIdForTeam: stubs.findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak: stubs.recomputeAndPersistPlayerStreak,
}));

vi.mock("@repo/database/injury-status", () => ({
  syncPlayerStatusFromInjuries: stubs.syncPlayerStatusFromInjuries,
}));

vi.mock("@repo/database/care-alerts", () => ({
  evaluateAndEmitCareAlert: stubs.evaluateAndEmitCareAlert,
  PLAYER_CARE_CONFIRM_MESSAGE: "Tu equipo ya lo tiene",
}));

vi.mock("@repo/database", () => ({
  database: {
    player: { findFirst: stubs.playerFindFirst },
    painAlert: { findUnique: stubs.painAlertFindUnique },
    injury: {
      findFirst: vi.fn(),
      create: stubs.injuryCreate,
      update: vi.fn(),
    },
  },
}));

import {
  createInjury,
  promotePainAlert,
} from "@/features/injuries/actions/injury-actions";

const noopPrev = { success: false } as const;

function staffFixture(): StaffContext {
  return {
    user: { id: "user_staff" },
    membershipId: "mem_1",
    club: { id: "club_1", name: "Club", logoUrl: null },
    activeTeam: {
      id: "team_1",
      name: "A",
      timezone: "Europe/Madrid",
    },
    activeSeason: { id: "season_1" },
  } as StaffContext;
}

describe("createInjury / promotePainAlert Care Alert contract (JES-54)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    stubs.findActiveSeasonIdForTeam.mockResolvedValue("season_1");
    stubs.recomputeAndPersistPlayerStreak.mockResolvedValue(undefined);
    stubs.syncPlayerStatusFromInjuries.mockResolvedValue("INJURED");
  });

  it("createInjury creates Injury and never calls evaluateAndEmitCareAlert", async () => {
    stubs.playerFindFirst.mockResolvedValue({ id: "player_1" });
    stubs.injuryCreate.mockResolvedValue({ id: "inj_1" });

    const fd = new FormData();
    fd.set("playerId", "player_1");
    fd.set("startDate", "2026-08-04");
    fd.set("cause", "Esguince");
    fd.set("regionIds", JSON.stringify(["ANKLE_L"]));

    const result = await createInjury(noopPrev, fd);

    expect(result).toEqual({ success: true, injuryId: "inj_1" });
    expect(stubs.injuryCreate).toHaveBeenCalledTimes(1);
    expect(stubs.evaluateAndEmitCareAlert).not.toHaveBeenCalled();
  });

  it("promotePainAlert creates Injury via promote helper and never emits Care Alert", async () => {
    stubs.promotePainAlertToInjury.mockResolvedValue({
      injuryId: "inj_2",
      painAlertId: "pa_1",
    });
    stubs.painAlertFindUnique.mockResolvedValue({ playerId: "player_1" });

    const fd = new FormData();
    fd.set("painAlertId", "pa_1");
    fd.append("regionIds", "KNEE_R");

    const result = await promotePainAlert(noopPrev, fd);

    expect(result).toEqual({ success: true, injuryId: "inj_2" });
    expect(stubs.promotePainAlertToInjury).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        painAlertId: "pa_1",
        teamId: "team_1",
        regionIds: ["KNEE_R"],
        createdByUserId: "user_staff",
      })
    );
    expect(stubs.evaluateAndEmitCareAlert).not.toHaveBeenCalled();
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/injuries");
  });

  it("promotePainAlert rejects empty region selection", async () => {
    const fd = new FormData();
    fd.set("painAlertId", "pa_1");

    const result = await promotePainAlert(noopPrev, fd);

    expect(result.success).toBe(false);
    expect(stubs.promotePainAlertToInjury).not.toHaveBeenCalled();
    expect(stubs.evaluateAndEmitCareAlert).not.toHaveBeenCalled();
  });
});
