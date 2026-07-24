import { type CurrentUser, currentUser } from "@repo/auth/server";
import { cookies } from "next/headers";
import { assembleStaffContext, type StaffContext } from "./staff-context-assembly";
import { getStaffDataAdapter } from "./staff-data-adapter";
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

export function getCurrentUserState(): Promise<CurrentUser | null> {
  return currentUser();
}

export async function resolveSession() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const membership = pickPreferredStaffMembership(user.memberships);
  if (!membership) {
    return null;
  }

  return { user, membership } as const;
}

export async function getCurrentStaffContext(): Promise<StaffContext | null> {
  const session = await resolveSession();
  if (!session) {
    return null;
  }

  const { user, membership } = session;

  const cookieStore = await cookies();
  const requestedTeamId =
    cookieStore.get(ACTIVE_TEAM_COOKIE_NAME)?.value ?? null;
  const requestedSeasonId =
    cookieStore.get(ACTIVE_SEASON_COOKIE_NAME)?.value ?? null;

  const adapter = getStaffDataAdapter();

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
