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
  fetchSeasons(teamId: string): Promise<StaffSeasonRow[]>;
};

export function createPrismaStaffDataAdapter(): StaffDataAdapter {
  return {
    async fetchClubAndTeams(membership) {
      const [club, teams] = await Promise.all([
        database.club.findUnique({
          where: { id: membership.clubId },
          select: { id: true, name: true, logoUrl: true },
        }),
        database.team.findMany({
          where: membership.hasAllTeams
            ? { clubId: membership.clubId }
            : { id: { in: membership.teamIds } },
          select: {
            id: true,
            name: true,
            category: true,
            logoUrl: true,
            timezone: true,
            preSessionReminderMinutes: true,
            postSessionReminderMinutes: true,
            wellnessLimits: true,
          },
          orderBy: { name: "asc" },
        }),
      ]);

      return {
        club: club
          ? {
              id: club.id,
              name: club.name,
              logoUrl: resolveStorageUrl(club.logoUrl),
            }
          : null,
        teams: teams.map((team) => ({
          ...team,
          logoUrl: resolveStorageUrl(team.logoUrl),
        })),
      };
    },

    fetchSeasons(teamId) {
      return database.season.findMany({
        where: { teamId },
        orderBy: [{ startDate: "desc" }, { name: "desc" }],
        select: { id: true, name: true, startDate: true, endDate: true },
      });
    },
  };
}

const defaultAdapter = createPrismaStaffDataAdapter();

export function getStaffDataAdapter(): StaffDataAdapter {
  return defaultAdapter;
}
