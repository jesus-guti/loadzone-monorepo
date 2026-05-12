import type { MembershipRole, PlatformRole } from "@repo/database";

/** Session membership subset used only for workspace-role preference. */
export type StaffMembershipPick = {
  role: MembershipRole;
};

/** Season slice used when resolving defaults from dates and cookie overrides. */
export type StaffSeasonPick = {
  id: string;
  startDate: Date;
  endDate: Date;
};

/**
 * Mirrors staff session semantics: prefer a COORDINATOR/STAFF membership, else the first
 * membership supplied by auth (ordering is owned upstream).
 */
export function pickPreferredStaffMembership<T extends StaffMembershipPick>(
  memberships: readonly T[],
): T | null {
  if (memberships.length === 0) {
    return null;
  }

  const fallback = memberships[0];

  return (
    memberships.find(
      (m) => m.role === "COORDINATOR" || m.role === "STAFF",
    ) ?? fallback
  );
}

/** Active team from cookie id when it exists in `orderedTeams`, otherwise first team by caller order. */
export function resolveActiveTeamSnapshot<T extends { id: string }>(
  orderedTeams: readonly T[],
  requestedTeamId: string | null,
): T | null {
  const defaultTeam = orderedTeams[0] ?? null;
  return orderedTeams.find((team) => team.id === requestedTeamId) ?? defaultTeam;
}

/**
 * Prefer a season overlapping `now`; otherwise first row in caller order (DB uses newest-first ordering).
 */
export function pickDefaultSeasonForDate<T extends StaffSeasonPick>(
  seasonsOrdered: readonly T[],
  now: Date,
): T | null {
  const inSeason = seasonsOrdered.find(
    (season) => season.startDate <= now && season.endDate >= now,
  );
  return inSeason ?? seasonsOrdered[0] ?? null;
}

/** Cookie-selected season id when present in the team’s season list; otherwise `fallbackSeason`. */
export function resolveSeasonFromCookie<T extends { id: string }>(
  seasonsOrdered: readonly T[],
  requestedSeasonId: string | null,
  fallbackSeason: T | null,
): T | null {
  if (!requestedSeasonId) {
    return fallbackSeason;
  }
  const match = seasonsOrdered.find((s) => s.id === requestedSeasonId);
  return match ?? fallbackSeason;
}

export function formatSeasonLabel(seasonName: string): string {
  const match = seasonName.match(/(20\d{2}).*?(20\d{2})/);
  if (!match) {
    return seasonName;
  }

  return `${match[1]?.slice(-2)}/${match[2]?.slice(-2)}`;
}

/** Same rule as legacy `StaffContext.canCreateTeam`. */
export function staffCanCreateTeam(
  membershipRole: MembershipRole,
  platformRole: PlatformRole,
): boolean {
  return membershipRole === "COORDINATOR" || platformRole === "SUPER_ADMIN";
}
