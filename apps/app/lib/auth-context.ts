import {
  currentUser,
  type CurrentUser,
} from "@repo/auth/server";
import { database, type MembershipRole, type PlatformRole } from "@repo/database";
import { resolveStorageUrl } from "@repo/storage/shared";
import { cookies } from "next/headers";
import { parseWellnessLimits, type WellnessLimits } from "./wellness-limits";
import {
  formatSeasonLabel,
  pickDefaultSeasonForDate,
  pickPreferredStaffMembership,
  resolveActiveTeamSnapshot,
  resolveSeasonFromCookie,
  staffCanCreateTeam,
} from "./staff-workspace-rules";

export const ACTIVE_TEAM_COOKIE_NAME = "loadzone_active_team";
export const ACTIVE_SEASON_COOKIE_NAME = "loadzone_active_season";
export const ACTIVE_WELLNESS_DATE_COOKIE_NAME = "loadzone_active_wellness_date";

export type SeasonSummary = {
  id: string;
  name: string;
  label: string;
  startDate: Date;
  endDate: Date;
};

export type TeamSummary = {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  timezone: string;
  preSessionReminderMinutes: number | null;
  postSessionReminderMinutes: number | null;
  wellnessLimits: WellnessLimits | null;
};

export type StaffContext = {
  user: CurrentUser;
  platformRole: PlatformRole;
  membershipId: string;
  role: MembershipRole;
  canCreateTeam: boolean;
  club: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  teams: TeamSummary[];
  activeTeam: TeamSummary | null;
  activeTeamSeasons: SeasonSummary[];
  activeSeason: SeasonSummary | null;
  defaultTeam: TeamSummary | null;
  primaryTeam: TeamSummary | null;
};

export async function getCurrentUserState(): Promise<CurrentUser | null> {
  return currentUser();
}

export async function getCurrentStaffContext(): Promise<StaffContext | null> {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const membership = pickPreferredStaffMembership(user.memberships);

  if (!membership) {
    return null;
  }

  const cookieStore = await cookies();
  const requestedActiveTeamId =
    cookieStore.get(ACTIVE_TEAM_COOKIE_NAME)?.value ?? null;
  const requestedActiveSeasonId =
    cookieStore.get(ACTIVE_SEASON_COOKIE_NAME)?.value ?? null;
  const [club, teams] = await Promise.all([
    database.club.findUnique({
      where: { id: membership.clubId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
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
  const defaultTeam = teams[0] ?? null;
  const activeTeam = resolveActiveTeamSnapshot(
    teams,
    requestedActiveTeamId,
  );
  const transformedTeams: TeamSummary[] = teams.map((team) => ({
    ...team,
    logoUrl: resolveStorageUrl(team.logoUrl),
    wellnessLimits: parseWellnessLimits(team.wellnessLimits),
  }));
  const transformedDefaultTeam =
    transformedTeams.find((team) => team.id === defaultTeam?.id) ?? null;
  const transformedActiveTeam =
    transformedTeams.find((team) => team.id === activeTeam?.id) ?? null;
  const activeTeamSeasons = activeTeam
    ? await database.season.findMany({
        where: {
          teamId: activeTeam.id,
        },
        orderBy: [{ startDate: "desc" }, { name: "desc" }],
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      })
    : [];
  const currentDate = new Date();
  const defaultSeason = pickDefaultSeasonForDate(
    activeTeamSeasons,
    currentDate,
  );
  const activeSeasonRecord = resolveSeasonFromCookie(
    activeTeamSeasons,
    requestedActiveSeasonId,
    defaultSeason,
  );
  const seasonSummaries: SeasonSummary[] = activeTeamSeasons.map((season) => ({
    id: season.id,
    name: season.name,
    label: formatSeasonLabel(season.name),
    startDate: season.startDate,
    endDate: season.endDate,
  }));
  const activeSeason =
    seasonSummaries.find((season) => season.id === activeSeasonRecord?.id) ?? null;

  return {
    user,
    platformRole: user.platformRole,
    membershipId: membership.id,
    role: membership.role,
    canCreateTeam: staffCanCreateTeam(membership.role, user.platformRole),
    club: {
      id: membership.clubId,
      name: club?.name ?? membership.clubName,
      logoUrl: resolveStorageUrl(club?.logoUrl ?? null),
    },
    teams: transformedTeams,
    activeTeam: transformedActiveTeam,
    activeTeamSeasons: seasonSummaries,
    activeSeason,
    defaultTeam: transformedDefaultTeam,
    primaryTeam: transformedActiveTeam,
  };
}
