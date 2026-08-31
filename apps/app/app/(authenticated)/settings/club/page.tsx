import type { Metadata } from "next";
import { DEFAULT_AGE_BAND_POLICY } from "@repo/database/age-band-policy";
import { staffCanInvite } from "@repo/database/staff-identity";
import { database } from "@repo/database";
import { notFound } from "next/navigation";
import { ClubSettingsForm } from "@/features/settings/components/club-settings-form";
import { StaffInvitesSection } from "@/features/settings/components/staff-invites-section";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Club | Configuración | LoadZone",
};

export default async function ClubSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const clubAgePolicy =
    staffContext.club.ageBandPolicy ?? DEFAULT_AGE_BAND_POLICY;
  const canInvite = staffCanInvite(staffContext.role);
  const pendingRows = canInvite
    ? await database.staffInvitation.findMany({
        where: {
          clubId: staffContext.club.id,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
        },
      })
    : [];

  const pendingInvites = pendingRows.flatMap((row) => {
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

  return (
    <>
      <ClubSettingsForm
        key={staffContext.activeTeam.id}
        teamId={staffContext.activeTeam.id}
        userId={staffContext.user.id}
        clubId={staffContext.club.id}
        canEdit={staffContext.canCreateTeam}
        clubName={staffContext.club.name}
        clubLogoUrl={staffContext.club.logoUrl}
        clubAgePolicy={clubAgePolicy}
      />
      <StaffInvitesSection
        canInvite={canInvite}
        clubId={staffContext.club.id}
        pendingInvites={pendingInvites}
      />
    </>
  );
}
