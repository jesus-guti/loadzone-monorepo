import { beforeEach, describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
  injuryFindMany: vi.fn(),
  painAlertFindMany: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  database: {
    injury: { findMany: stubs.injuryFindMany },
    painAlert: { findMany: stubs.painAlertFindMany },
  },
}));

import { getTeamInjuriesList } from "@/features/injuries/queries/get-team-injuries-list";

describe("getTeamInjuriesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.painAlertFindMany.mockResolvedValue([]);
  });

  it("returns open and closed injuries and excludes soft-deleted rows", async () => {
    stubs.injuryFindMany.mockResolvedValue([
      {
        id: "open-1",
        playerId: "p1",
        cause: "Partido",
        regionDetail: null,
        startDate: new Date("2026-08-10T00:00:00.000Z"),
        endDate: null,
        regions: [{ regionId: "KNEE_R" }],
        player: { name: "Ana" },
      },
      {
        id: "closed-1",
        playerId: "p2",
        cause: "Entreno",
        regionDetail: null,
        startDate: new Date("2026-07-01T00:00:00.000Z"),
        endDate: new Date("2026-07-15T00:00:00.000Z"),
        regions: [{ regionId: "ANKLE_R" }],
        player: { name: "Luis" },
      },
    ]);

    const payload = await getTeamInjuriesList("team-1");

    expect(stubs.injuryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: "team-1", deletedAt: null },
      })
    );
    expect(payload.activeInjuries.map((row) => row.id)).toEqual(["open-1"]);
    expect(payload.closedInjuries.map((row) => row.id)).toEqual(["closed-1"]);
  });
});
