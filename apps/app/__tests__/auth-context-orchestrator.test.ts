import { describe, expect, it, vi, beforeEach } from "vitest";

const stubs = vi.hoisted(() => ({
  currentUser: vi.fn(),
  cookiesGet: vi.fn(),
  fetchClubAndTeams: vi.fn(),
  fetchSeasons: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  currentUser: stubs.currentUser,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: stubs.cookiesGet,
  })),
}));

vi.mock("@/lib/staff-data-adapter", () => ({
  getStaffDataAdapter: vi.fn(() => ({
    fetchClubAndTeams: stubs.fetchClubAndTeams,
    fetchSeasons: stubs.fetchSeasons,
  })),
}));

import { getCurrentStaffContext } from "@/lib/auth-context";

function fakeCurrentUser() {
  return {
    id: "user-1",
    email: "staff@test.test",
    name: "Staff",
    image: null,
    platformRole: "USER" as const,
    memberships: [
      {
        id: "mem-1",
        clubId: "club-1",
        clubName: "Club Test",
        role: "COORDINATOR" as const,
        hasAllTeams: true,
        teamIds: [],
      },
    ],
  };
}

function fakeClub() {
  return { id: "club-1", name: "Club DB", logoUrl: null };
}

function fakeTeam(id: string) {
  return {
    id,
    name: `Team ${id}`,
    category: null,
    logoUrl: null,
    timezone: "Europe/Madrid",
    preSessionReminderMinutes: 30,
    postSessionReminderMinutes: 60,
    wellnessLimits: null,
  };
}

function fakeSeason(id: string) {
  return {
    id,
    name: `Season ${id}`,
    startDate: new Date("2026-01-01T00:00:00Z"),
    endDate: new Date("2026-12-31T23:59:59Z"),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentStaffContext (orchestrator)", () => {
  it("returns null when there is no authenticated user", async () => {
    stubs.currentUser.mockResolvedValue(null);

    const result = await getCurrentStaffContext();

    expect(result).toBeNull();
    expect(stubs.fetchClubAndTeams).not.toHaveBeenCalled();
    expect(stubs.fetchSeasons).not.toHaveBeenCalled();
  });

  it("returns null when user has no memberships", async () => {
    stubs.currentUser.mockResolvedValue({
      ...fakeCurrentUser(),
      memberships: [],
    });

    const result = await getCurrentStaffContext();

    expect(result).toBeNull();
    expect(stubs.fetchClubAndTeams).not.toHaveBeenCalled();
  });

  it("fetches club and teams using the preferred membership", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockReturnValue(undefined);
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [fakeTeam("ta")],
    });
    stubs.fetchSeasons.mockResolvedValue([fakeSeason("s1")]);

    await getCurrentStaffContext();

    expect(stubs.fetchClubAndTeams).toHaveBeenCalledTimes(1);
    const membershipArg = stubs.fetchClubAndTeams.mock.calls[0]?.[0];
    expect(membershipArg).toMatchObject({
      id: "mem-1",
      clubId: "club-1",
    });
  });

  it("fetches seasons for the active team", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockReturnValue(undefined);
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [fakeTeam("ta"), fakeTeam("tb")],
    });
    stubs.fetchSeasons.mockResolvedValue([fakeSeason("s1")]);

    await getCurrentStaffContext();

    expect(stubs.fetchSeasons).toHaveBeenCalledTimes(1);
    expect(stubs.fetchSeasons).toHaveBeenCalledWith("ta");
  });

  it("honours the active team cookie when present", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockImplementation((name: string) =>
      name === "loadzone_active_team" ? { value: "tb" } : undefined,
    );
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [fakeTeam("ta"), fakeTeam("tb")],
    });
    stubs.fetchSeasons.mockResolvedValue([fakeSeason("s2")]);

    await getCurrentStaffContext();

    expect(stubs.fetchSeasons).toHaveBeenCalledWith("tb");
  });

  it("returns assembled StaffContext with expected shape", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockReturnValue(undefined);
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [fakeTeam("ta")],
    });
    stubs.fetchSeasons.mockResolvedValue([fakeSeason("s1")]);

    const result = await getCurrentStaffContext();

    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("staff@test.test");
    expect(result?.club.name).toBe("Club DB");
    expect(result?.membershipId).toBe("mem-1");
    expect(result?.activeTeam?.id).toBe("ta");
    expect(result?.activeTeamSeasons).toHaveLength(1);
    expect(result?.activeSeason?.id).toBe("s1");
  });

  it("sets activeSeason to null when no seasons exist", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockReturnValue(undefined);
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [fakeTeam("ta")],
    });
    stubs.fetchSeasons.mockResolvedValue([]);

    const result = await getCurrentStaffContext();

    expect(result?.activeSeason).toBeNull();
    expect(result?.activeTeamSeasons).toEqual([]);
  });

  it("does not fetch seasons when no active team", async () => {
    stubs.currentUser.mockResolvedValue(fakeCurrentUser());
    stubs.cookiesGet.mockReturnValue(undefined);
    stubs.fetchClubAndTeams.mockResolvedValue({
      club: fakeClub(),
      teams: [],
    });
    stubs.fetchSeasons.mockResolvedValue([]);

    await getCurrentStaffContext();

    expect(stubs.fetchSeasons).not.toHaveBeenCalled();
  });
});
