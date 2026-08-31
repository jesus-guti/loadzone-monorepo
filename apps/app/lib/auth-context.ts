import { type CurrentUser, currentUser } from "@repo/auth/server";
import { cookies } from "next/headers";
import { assembleStaffContext, type StaffContext } from "./staff-context-assembly";
import {
  getStaffDataAdapter,
  type StaffMembershipInfo,
} from "./staff-data-adapter";
import {
  pickPreferredStaffMembership,
  resolveActiveTeamSnapshot,
} from "./staff-workspace-rules";

export type {
  SeasonSummary,
  StaffContext,
  TeamSummary,
} from "./staff-context-assembly";

export const ACTIVE_TEAM_COOKIE_NAME = "loadzone_active_team";
export const ACTIVE_SEASON_COOKIE_NAME = "loadzone_active_season";
export const ACTIVE_WELLNESS_DATE_COOKIE_NAME = "loadzone_active_wellness_date";
export const ACTIVE_CLUB_COOKIE_NAME = "loadzone_active_club";

export function getCurrentUserState(): Promise<CurrentUser | null> {
  return currentUser();
}

function operatorMembership(
  clubId: string,
  clubName: string
): StaffMembershipInfo {
  return {
    id: "",
    clubId,
    clubName,
    role: "STAFF",
    hasAllTeams: true,
    teamIds: [],
  };
}

export async function resolveSession() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const membership = pickPreferredStaffMembership(user.memberships);
  if (!membership && user.platformRole !== "SUPER_ADMIN") {
    return null;
  }

  return { user, membership } as const;
}

export async function getCurrentStaffContext(): Promise<StaffContext | null> {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const requestedTeamId =
    cookieStore.get(ACTIVE_TEAM_COOKIE_NAME)?.value ?? null;
  const requestedSeasonId =
    cookieStore.get(ACTIVE_SEASON_COOKIE_NAME)?.value ?? null;
  const requestedClubId =
    cookieStore.get(ACTIVE_CLUB_COOKIE_NAME)?.value ?? null;

  const adapter = getStaffDataAdapter();
  let membership = pickPreferredStaffMembership(user.memberships);

  if (user.platformRole === "SUPER_ADMIN") {
    const clubs = await adapter.listClubs();
    const cookieClub = requestedClubId
      ? clubs.find((club) => club.id === requestedClubId) ?? null
      : null;
    const fallbackClub =
      cookieClub ??
      (membership
        ? { id: membership.clubId, name: membership.clubName }
        : (clubs[0] ?? null));

    if (!fallbackClub) {
      return assembleStaffContext({
        user,
        membership: operatorMembership("", "Plataforma"),
        club: {
          id: "",
          name: "Plataforma",
          logoUrl: null,
          ageBandPolicy: null,
        },
        teams: [],
        activeTeamSeasons: [],
        requestedTeamId,
        requestedSeasonId,
        now: new Date(),
      });
    }

    const matchingMembership = user.memberships.find(
      (row) => row.clubId === fallbackClub.id
    );
    membership =
      matchingMembership ??
      operatorMembership(fallbackClub.id, fallbackClub.name);
  }

  if (!membership) {
    return null;
  }

  const { club, teams } = await adapter.fetchClubAndTeams(membership);

  const activeTeam = resolveActiveTeamSnapshot(teams, requestedTeamId);
  const activeTeamSeasons = activeTeam
    ? await adapter.fetchSeasons(activeTeam.id)
    : [];

  return assembleStaffContext({
    user,
    membership,
    club,
    teams,
    activeTeamSeasons,
    requestedTeamId,
    requestedSeasonId,
    now: new Date(),
  });
}
