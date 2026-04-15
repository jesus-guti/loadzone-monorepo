import {
  currentUser,
  type CurrentUser,
} from "@repo/auth/server";
import { database, type MembershipRole, type PlatformRole } from "@repo/database";

export type TeamSummary = {
  id: string;
  name: string;
  category: string | null;
  timezone: string;
  preSessionReminderMinutes: number | null;
  postSessionReminderMinutes: number | null;
};

export type StaffContext = {
  user: CurrentUser;
  platformRole: PlatformRole;
  membershipId: string;
  role: MembershipRole;
  club: {
    id: string;
    name: string;
  };
  teams: TeamSummary[];
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

  const membership =
    user.memberships.find(
      (currentMembership) =>
        currentMembership.role === "COORDINATOR" ||
        currentMembership.role === "STAFF"
    ) ?? user.memberships[0];

  if (!membership) {
    return null;
  }

  const teams = await database.team.findMany({
    where: membership.hasAllTeams
      ? { clubId: membership.clubId }
      : { id: { in: membership.teamIds } },
    select: {
      id: true,
      name: true,
      category: true,
      timezone: true,
      preSessionReminderMinutes: true,
      postSessionReminderMinutes: true,
    },
    orderBy: { name: "asc" },
  });

  return {
    user,
    platformRole: user.platformRole,
    membershipId: membership.id,
    role: membership.role,
    club: {
      id: membership.clubId,
      name: membership.clubName,
    },
    teams,
    primaryTeam: teams[0] ?? null,
  };
}
