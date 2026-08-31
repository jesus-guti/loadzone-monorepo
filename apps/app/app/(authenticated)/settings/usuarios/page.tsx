import type { Metadata } from "next";
import {
  listClubAccess,
  staffCanInvite,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import { database } from "@repo/database";
import { notFound } from "next/navigation";
import { ClubMembersSection } from "@/features/settings/components/club-members-section";
import { StaffInvitesSection } from "@/features/settings/components/staff-invites-section";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Usuarios | Configuración | LoadZone",
};

export default async function UsuariosSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || staffContext.club === null) {
    notFound();
  }

  const isPlatform = staffContext.platformRole === "SUPER_ADMIN";
  const canInvite =
    (staffContext.role !== null && staffCanInvite(staffContext.role)) ||
    isPlatform;

  if (!canInvite) {
    return (
      <p className="text-sm text-text-secondary">
        Solo los coordinadores pueden ver y gestionar los usuarios del club.
      </p>
    );
  }

  const access = await listClubAccess(
    database as unknown as StaffIdentityClient,
    {
      actor: isPlatform
        ? { kind: "platform" }
        : { kind: "coordinator", userId: staffContext.user.id },
      clubId: staffContext.club.id,
    }
  );

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
    <>
      <ClubMembersSection
        canManage
        clubId={staffContext.club.id}
        members={members}
      />
      <StaffInvitesSection
        canInvite
        clubId={staffContext.club.id}
        pendingInvites={pendingInvites}
      />
    </>
  );
}
