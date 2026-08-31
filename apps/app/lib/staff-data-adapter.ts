import type { MembershipRole } from "@repo/database";
import { database } from "@repo/database";
import { resolveStorageUrl } from "@repo/storage/shared";

export type StaffMembershipInfo = {
  id: string;
  clubId: string;
  clubName: string;
  role: MembershipRole;
  hasAllTeams: boolean;
  teamIds: string[];
};

export type StaffClubRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  ageBandPolicy: unknown;
};

export type StaffTeamRow = {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  timezone: string;
  preSessionReminderMinutes: number | null;
  postSessionReminderMinutes: number | null;
  wellnessLimits: unknown;
  ageBandPolicy: unknown;
  reminderConsentPolicy: unknown;
};

export type StaffSeasonRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

export type StaffDataAdapter = {
  fetchClubAndTeams(membership: StaffMembershipInfo): Promise<{
    club: StaffClubRow | null;
    teams: StaffTeamRow[];
  }>;
  fetchClubWorkspace(clubId: string): Promise<{
    club: StaffClubRow | null;
    teams: StaffTeamRow[];
  }>;
  fetchSeasons(teamId: string): Promise<StaffSeasonRow[]>;
  listClubs(): Promise<{ id: string; name: string }[]>;
};

const teamListSelect = {
  id: true,
  name: true,
  category: true,
  logoUrl: true,
  timezone: true,
  preSessionReminderMinutes: true,
  postSessionReminderMinutes: true,
  wellnessLimits: true,
  ageBandPolicy: true,
  reminderConsentPolicy: true,
} as const;

async function loadClubAndTeams(input: {
  clubId: string;
  teamIds: string[] | null;
}): Promise<{
  club: StaffClubRow | null;
  teams: StaffTeamRow[];
}> {
  const [club, teams] = await Promise.all([
    database.club.findUnique({
      where: { id: input.clubId },
      select: { id: true, name: true, logoUrl: true, ageBandPolicy: true },
    }),
    database.team.findMany({
      where:
        input.teamIds === null
          ? { clubId: input.clubId }
          : { id: { in: input.teamIds } },
      select: teamListSelect,
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    club: club
      ? {
          id: club.id,
          name: club.name,
          logoUrl: resolveStorageUrl(club.logoUrl),
          ageBandPolicy: club.ageBandPolicy,
        }
      : null,
    teams: teams.map((team) => ({
      ...team,
      logoUrl: resolveStorageUrl(team.logoUrl),
    })),
  };
}

export function createPrismaStaffDataAdapter(): StaffDataAdapter {
  return {
    fetchClubAndTeams(membership) {
      return loadClubAndTeams({
        clubId: membership.clubId,
        teamIds: membership.hasAllTeams ? null : membership.teamIds,
      });
    },

    fetchClubWorkspace(clubId) {
      return loadClubAndTeams({ clubId, teamIds: null });
    },

    fetchSeasons(teamId) {
      return database.season.findMany({
        where: { teamId },
        orderBy: [{ startDate: "desc" }, { name: "desc" }],
        select: { id: true, name: true, startDate: true, endDate: true },
      });
    },

    async listClubs() {
      const clubs = await database.club.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      return clubs;
    },
  };
}

const defaultAdapter = createPrismaStaffDataAdapter();

export function getStaffDataAdapter(): StaffDataAdapter {
  return defaultAdapter;
}
