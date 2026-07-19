import type { CurrentUser } from "@repo/auth/server";
import type { MembershipRole, PlatformRole } from "@repo/database";
import type {
  StaffClubRow,
  StaffMembershipInfo,
  StaffSeasonRow,
  StaffTeamRow,
} from "./staff-data-adapter";
import {
  formatSeasonLabel,
  pickDefaultSeasonForDate,
  resolveActiveTeamSnapshot,
  resolveSeasonFromCookie,
  staffCanCreateTeam,
} from "./staff-workspace-rules";
import { parseWellnessLimits, type WellnessLimits } from "./wellness-limits";

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

type AssembleInput = {
  user: CurrentUser;
  membership: StaffMembershipInfo;
  club: StaffClubRow | null;
  teams: StaffTeamRow[];
  activeTeamSeasons: StaffSeasonRow[];
  requestedTeamId: string | null;
  requestedSeasonId: string | null;
  now: Date;
};

export function assembleStaffContext(input: AssembleInput): StaffContext {
  const {
    user,
    membership,
    club,
    teams: rawTeams,
    activeTeamSeasons,
    requestedTeamId,
    requestedSeasonId,
    now,
  } = input;

  const defaultTeam = rawTeams[0] ?? null;
  const activeTeam = resolveActiveTeamSnapshot(rawTeams, requestedTeamId);

  const transformedTeams: TeamSummary[] = rawTeams.map((team) => ({
    id: team.id,
    name: team.name,
    category: team.category,
    logoUrl: team.logoUrl,
    timezone: team.timezone,
    preSessionReminderMinutes: team.preSessionReminderMinutes,
    postSessionReminderMinutes: team.postSessionReminderMinutes,
    wellnessLimits: parseWellnessLimits(team.wellnessLimits),
  }));

  const transformedDefaultTeam =
    transformedTeams.find((team) => team.id === defaultTeam?.id) ?? null;
  const transformedActiveTeam =
    transformedTeams.find((team) => team.id === activeTeam?.id) ?? null;

  const defaultSeason = pickDefaultSeasonForDate(activeTeamSeasons, now);
  const activeSeasonRecord = resolveSeasonFromCookie(
    activeTeamSeasons,
    requestedSeasonId,
    defaultSeason
  );

  const seasonSummaries: SeasonSummary[] = activeTeamSeasons.map((season) => ({
    id: season.id,
    name: season.name,
    label: formatSeasonLabel(season.name),
    startDate: season.startDate,
    endDate: season.endDate,
  }));

  const activeSeason =
    seasonSummaries.find((season) => season.id === activeSeasonRecord?.id) ??
    null;

  return {
    user,
    platformRole: user.platformRole,
    membershipId: membership.id,
    role: membership.role,
    canCreateTeam: staffCanCreateTeam(membership.role, user.platformRole),
    club: {
      id: membership.clubId,
      name: club?.name ?? membership.clubName,
      logoUrl: club?.logoUrl ?? null,
    },
    teams: transformedTeams,
    activeTeam: transformedActiveTeam,
    activeTeamSeasons: seasonSummaries,
    activeSeason,
    defaultTeam: transformedDefaultTeam,
    primaryTeam: transformedActiveTeam,
  };
}
