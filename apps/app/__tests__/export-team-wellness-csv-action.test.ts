import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StaffContext } from "@/lib/auth-context";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  dailyEntryFindMany: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
}));

vi.mock("@repo/database", () => ({
  database: {
    dailyEntry: {
      findMany: stubs.dailyEntryFindMany,
    },
  },
}));

import { exportTeamWellnessCsv } from "@/features/wellness/actions/export-team-wellness-csv";
import { TEAM_WELLNESS_CSV_HEADERS } from "@/features/wellness/lib/team-wellness-csv";

function staffFixture(): StaffContext {
  return {
    membershipId: "mem-1",
    user: { id: "user-1" },
    activeTeam: {
      id: "team-1",
      name: "Juvenil A",
      timezone: "Europe/Madrid",
    },
  } as StaffContext;
}

describe("exportTeamWellnessCsv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses export without an active Team", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    const result = await exportTeamWellnessCsv("2026-08-01", "2026-08-31");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
    expect(stubs.dailyEntryFindMany).not.toHaveBeenCalled();
  });

  it("refuses an inverted date range", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    const result = await exportTeamWellnessCsv("2026-08-31", "2026-08-01");
    expect(result).toEqual({
      ok: false,
      error: "El rango de fechas no es válido.",
    });
    expect(stubs.dailyEntryFindMany).not.toHaveBeenCalled();
  });

  it("returns a headers-only CSV and season-scoped filename for zero rows", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    stubs.dailyEntryFindMany.mockResolvedValue([]);

    const result = await exportTeamWellnessCsv("2026-08-01", "2026-08-31");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.filename).toBe("wellness-juvenil-a-2026-08-01-2026-08-31.csv");
    expect(result.csv).toContain(TEAM_WELLNESS_CSV_HEADERS.join(";"));
    expect(stubs.dailyEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          player: { teamId: "team-1" },
        }),
      })
    );
    expect(stubs.dailyEntryFindMany.mock.calls[0]?.[0]?.where?.player).toEqual({
      teamId: "team-1",
    });
    expect(stubs.dailyEntryFindMany.mock.calls[0]?.[0]?.where?.seasonId).toBeUndefined();
  });
});
