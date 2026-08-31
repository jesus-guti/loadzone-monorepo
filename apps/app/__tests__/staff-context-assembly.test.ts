import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@repo/auth/server";
import type { MembershipRole, PlatformRole } from "@repo/database";
import { assembleStaffContext } from "@/lib/staff-context-assembly";
import type {
  StaffClubRow,
  StaffMembershipInfo,
  StaffSeasonRow,
  StaffTeamRow,
} from "@/lib/staff-data-adapter";

function makeUser(overrides?: Partial<CurrentUser>): CurrentUser {
  return {
    id: "user-1",
    email: "staff@club.test",
    name: "Test Staff",
    image: null,
    platformRole: "USER" as PlatformRole,
    memberships: [],
    ...overrides,
  };
}

function makeMembership(
  overrides?: Partial<StaffMembershipInfo>,
): StaffMembershipInfo {
  return {
    id: "mem-1",
    clubId: "club-1",
    clubName: "Club Test",
    role: "COORDINATOR" as MembershipRole,
    hasAllTeams: true,
    teamIds: [],
    ...overrides,
  };
}

function makeClub(overrides?: Partial<StaffClubRow>): StaffClubRow {
  return {
    id: "club-1",
    name: "Club Test",
    logoUrl: null,
    ageBandPolicy: null,
    ...overrides,
  };
}

function makeTeam(id: string, overrides?: Partial<StaffTeamRow>): StaffTeamRow {
  return {
    id,
    name: `Team ${id}`,
    category: null,
    logoUrl: null,
    timezone: "Europe/Madrid",
    preSessionReminderMinutes: 30,
    postSessionReminderMinutes: 60,
    wellnessLimits: null,
    ageBandPolicy: null,
    reminderConsentPolicy: null,
    ...overrides,
  };
}

function makeSeason(
  id: string,
  startDate: Date,
  endDate: Date,
  name = `Season ${id}`,
): StaffSeasonRow {
  return { id, name, startDate, endDate };
}

describe("assembleStaffContext", () => {
  it("returns null for activeTeam and defaultTeam when no teams exist", () => {
    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeTeam).toBeNull();
    expect(result.defaultTeam).toBeNull();
    expect(result.primaryTeam).toBeNull();
    expect(result.teams).toEqual([]);
    expect(result.activeTeamSeasons).toEqual([]);
    expect(result.activeSeason).toBeNull();
  });

  it("sets first team as active/default/primary when no cookie override", () => {
    const teamA = makeTeam("ta");
    const teamB = makeTeam("tb");

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [teamA, teamB],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeTeam?.id).toBe("ta");
    expect(result.defaultTeam?.id).toBe("ta");
    expect(result.primaryTeam?.id).toBe("ta");
    expect(result.teams).toHaveLength(2);
  });

  it("honours cookie team id when it matches a team", () => {
    const teamA = makeTeam("ta");
    const teamB = makeTeam("tb");

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [teamA, teamB],
      activeTeamSeasons: [],
      requestedTeamId: "tb",
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeTeam?.id).toBe("tb");
    expect(result.primaryTeam?.id).toBe("tb");
    expect(result.defaultTeam?.id).toBe("ta");
  });

  it("falls back to first team when cookie id does not match any team", () => {
    const teamA = makeTeam("ta");

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [teamA],
      activeTeamSeasons: [],
      requestedTeamId: "nonexistent",
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeTeam?.id).toBe("ta");
  });

  it("picks the season overlapping the current date", () => {
    const s2026 = makeSeason(
      "s2026",
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-06-30T23:59:59Z"),
      "Temporada 2025 - 2026",
    );
    const sPrev = makeSeason(
      "sprev",
      new Date("2025-01-01T00:00:00Z"),
      new Date("2025-12-31T23:59:59Z"),
      "Temporada 2024 - 2025",
    );

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [s2026, sPrev],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-03-15T00:00:00Z"),
    });

    expect(result.activeSeason?.id).toBe("s2026");
    expect(result.activeSeason?.label).toBe("25/26");
    expect(result.activeTeamSeasons).toHaveLength(2);
  });

  it("falls back to first season when none overlaps the date", () => {
    const sPast = makeSeason(
      "spast",
      new Date("2020-01-01T00:00:00Z"),
      new Date("2020-12-31T23:59:59Z"),
    );

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [sPast],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeSeason?.id).toBe("spast");
  });

  it("cookie season id overrides the default when it matches", () => {
    const sA = makeSeason(
      "sa",
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-12-31T23:59:59Z"),
    );
    const sB = makeSeason(
      "sb",
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-12-31T23:59:59Z"),
    );

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [sA, sB],
      requestedTeamId: null,
      requestedSeasonId: "sb",
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeSeason?.id).toBe("sb");
  });

  it("returns null for activeSeason when no seasons exist", () => {
    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeSeason).toBeNull();
    expect(result.activeTeamSeasons).toEqual([]);
  });

  it("falls back to membership.clubName when DB club row is null", () => {
    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership({ clubName: "Fallback Club Name" }),
      club: null,
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.club?.name).toBe("Fallback Club Name");
    expect(result.club?.logoUrl).toBeNull();
  });

  it("uses DB club name when available", () => {
    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership({ clubName: "Should Not Use" }),
      club: makeClub({ name: "DB Club Name" }),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.club?.name).toBe("DB Club Name");
  });

  it("parses valid wellnessLimits JSON", () => {
    const team = makeTeam("ta", {
      wellnessLimits: {
        recovery: 4,
        energy: 3,
        soreness: 5,
        sleepHours: 6,
        sleepQuality: null,
      },
    });

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [team],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.teams[0]?.wellnessLimits).toEqual({
      recovery: 4,
      energy: 3,
      soreness: 5,
      sleepHours: 6,
      sleepQuality: null,
    });
  });

  it("sets null wellnessLimits when JSON is invalid", () => {
    const team = makeTeam("ta", { wellnessLimits: "not-an-object" });

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [team],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.teams[0]?.wellnessLimits).toBeNull();
  });

  it("resolves Age Band policy: team override > club > defaults", () => {
    const clubPolicy = {
      assistedMaxAgeExclusive: 9,
      guidedMaxAgeExclusive: 13,
      adultMajorityAge: 16,
      independentYouthSupervisionEnabled: true,
      guardianMissReceiveEnabled: false,
      guardianCareAlertReceiveEnabled: true,
    };
    const teamPolicy = {
      ...clubPolicy,
      assistedMaxAgeExclusive: 8,
      independentYouthSupervisionEnabled: false,
    };

    const withTeam = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub({ ageBandPolicy: clubPolicy }),
      teams: [makeTeam("ta", { ageBandPolicy: teamPolicy })],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(withTeam.activeTeam?.ageBandPolicySource).toBe("team");
    expect(withTeam.activeTeam?.ageBandPolicy.assistedMaxAgeExclusive).toBe(8);
    expect(withTeam.activeTeam?.ageBandPolicyOverride).toEqual(teamPolicy);
    expect(withTeam.club?.ageBandPolicy).toEqual(clubPolicy);

    const withClub = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub({ ageBandPolicy: clubPolicy }),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(withClub.activeTeam?.ageBandPolicySource).toBe("club");
    expect(withClub.activeTeam?.ageBandPolicyOverride).toBeNull();
    expect(withClub.activeTeam?.ageBandPolicy).toEqual(clubPolicy);

    const withDefaults = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(withDefaults.activeTeam?.ageBandPolicySource).toBe("defaults");
    expect(withDefaults.activeTeam?.ageBandPolicy.guidedMaxAgeExclusive).toBe(
      14
    );
    expect(withDefaults.club?.ageBandPolicy).toBeNull();
    expect(withDefaults.activeTeam?.reminderConsentPolicySource).toBe(
      "defaults"
    );
    expect(
      withDefaults.activeTeam?.reminderConsentPolicy.assisted.playerRemindersMode
    ).toBe("GUARDIAN_CONSENTS");
  });

  it("uses Team Reminder Consent JSON when valid", () => {
    const custom = {
      assisted: {
        playerRemindersMode: "OFF" as const,
        guardianReceiveEnabled: false,
      },
      guided: {
        playerRemindersMode: "PLAYER_OPT_IN" as const,
        guardianReceiveEnabled: true,
      },
      independentYouth: {
        playerRemindersMode: "PLAYER_CONSENTS" as const,
        guardianReceiveEnabled: true,
      },
      independentMajority: {
        playerRemindersMode: "PLAYER_CONSENTS" as const,
        guardianReceiveEnabled: false,
      },
    };
    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta", { reminderConsentPolicy: custom })],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(result.activeTeam?.reminderConsentPolicySource).toBe("team");
    expect(
      result.activeTeam?.reminderConsentPolicy.assisted.playerRemindersMode
    ).toBe("OFF");
  });

  it("sets canCreateTeam based on role and platformRole", () => {
    const coordinatorResult = assembleStaffContext({
      user: makeUser({ platformRole: "USER" }),
      membership: makeMembership({ role: "COORDINATOR" }),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(coordinatorResult.canCreateTeam).toBe(true);

    const superAdminResult = assembleStaffContext({
      user: makeUser({ platformRole: "SUPER_ADMIN" }),
      membership: makeMembership({ role: "STAFF" }),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(superAdminResult.canCreateTeam).toBe(true);

    const staffResult = assembleStaffContext({
      user: makeUser({ platformRole: "USER" }),
      membership: makeMembership({ role: "STAFF" }),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });
    expect(staffResult.canCreateTeam).toBe(false);
  });

  it("formats season labels using the year-pair rule", () => {
    const season = makeSeason(
      "s1",
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-12-31T23:59:59Z"),
      "Temporada 2025 - 2026",
    );

    const result = assembleStaffContext({
      user: makeUser(),
      membership: makeMembership(),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [season],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.activeTeamSeasons[0]?.label).toBe("25/26");
  });

  it("carries through user identity fields", () => {
    const result = assembleStaffContext({
      user: makeUser({ platformRole: "SUPER_ADMIN", email: "admin@test.test" }),
      membership: makeMembership({ id: "mem-xyz", role: "COORDINATOR" }),
      club: makeClub(),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.platformRole).toBe("SUPER_ADMIN");
    expect(result.membershipId).toBe("mem-xyz");
    expect(result.role).toBe("COORDINATOR");
    expect(result.user.email).toBe("admin@test.test");
  });

  it("assembles a platform operator without inventing a Membership", () => {
    const result = assembleStaffContext({
      user: makeUser({ platformRole: "SUPER_ADMIN" }),
      membership: null,
      club: makeClub({ id: "club-op", name: "Club Operado" }),
      teams: [makeTeam("ta")],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.membershipId).toBeNull();
    expect(result.role).toBeNull();
    expect(result.club?.id).toBe("club-op");
    expect(result.club?.name).toBe("Club Operado");
    expect(result.canCreateTeam).toBe(true);
  });

  it("assembles a Super Admin with no operating Club", () => {
    const result = assembleStaffContext({
      user: makeUser({ platformRole: "SUPER_ADMIN" }),
      membership: null,
      club: null,
      teams: [],
      activeTeamSeasons: [],
      requestedTeamId: null,
      requestedSeasonId: null,
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(result.club).toBeNull();
    expect(result.membershipId).toBeNull();
    expect(result.teams).toEqual([]);
  });
});
