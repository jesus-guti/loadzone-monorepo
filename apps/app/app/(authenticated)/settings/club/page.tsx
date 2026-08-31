import type { Metadata } from "next";
import {
  listClubAccess,
  staffCanInvite,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import { database } from "@repo/database";
import { notFound } from "next/navigation";
import { ClubMembersSection } from "@/features/settings/components/club-members-section";
import { ClubSettingsForm } from "@/features/settings/components/club-settings-form";
import { ClubSettingsTabs } from "@/features/settings/components/club-settings-tabs";
import { StaffInvitesSection } from "@/features/settings/components/staff-invites-section";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Club | Configuración | LoadZone",
};

export default async function ClubSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || staffContext.club === null) {
    notFound();
  }

  const isPlatform = staffContext.platformRole === "SUPER_ADMIN";
  const canInvite =
    (staffContext.role !== null && staffCanInvite(staffContext.role)) ||
    isPlatform;
  const access = canInvite
    ? await listClubAccess(database as unknown as StaffIdentityClient, {
        actor: isPlatform
          ? { kind: "platform" }
          : { kind: "coordinator", userId: staffContext.user.id },
        clubId: staffContext.club.id,
      })
    : { members: [], pendingInvites: [] };

  const pendingInvites = access.pendingInvites.flatMap((row) => {
    if (row.role !== "COORDINATOR" && row.role !== "STAFF") {
      return [];
    }
    return [
      {
        id: row.id,
        email: row.email,
        role: row.role,
        expiresAt: row.expiresAt.toISOString(),
      },
    ];
  });

  const members = access.members.map((row) => ({
    membershipId: row.membershipId,
    userId: row.userId,
    email: row.email,
    name: row.name,
    role: row.role,
  }));

  return (
    <ClubSettingsTabs
      clubPanel={
        staffContext.activeTeam ? (
          <ClubSettingsForm
            key={staffContext.activeTeam.id}
            userId={staffContext.user.id}
            clubId={staffContext.club.id}
            canEdit={staffContext.canCreateTeam}
            clubName={staffContext.club.name}
            clubLogoUrl={staffContext.club.logoUrl}
          />
        ) : null
      }
      usersPanel={
        <>
          <ClubMembersSection
            canManage={canInvite}
            clubId={staffContext.club.id}
            members={members}
          />
          <StaffInvitesSection
            canInvite={canInvite}
            clubId={staffContext.club.id}
            pendingInvites={pendingInvites}
          />
        </>
      }
    />
  );
}
