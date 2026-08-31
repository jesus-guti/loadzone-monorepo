import type { Metadata } from "next";
import { DEFAULT_AGE_BAND_POLICY } from "@repo/database/age-band-policy";
import { staffCanInvite } from "@repo/database/staff-identity";
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
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const clubAgePolicy =
    staffContext.club.ageBandPolicy ?? DEFAULT_AGE_BAND_POLICY;
  const canInvite = staffCanInvite(staffContext.role);
  const [pendingRows, membershipRows] = await Promise.all([
    canInvite
      ? database.staffInvitation.findMany({
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
      : Promise.resolve([]),
    database.membership.findMany({
      where: { clubId: staffContext.club.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

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

  const members = membershipRows.flatMap((row) => {
    if (row.role !== "COORDINATOR" && row.role !== "STAFF") {
      return [];
    }
    return [
      {
        membershipId: row.id,
        email: row.user.email,
        name: row.user.name,
        role: row.role,
      },
    ];
  });

  return (
    <ClubSettingsTabs
      clubPanel={
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
      }
      usersPanel={
        <>
          <ClubMembersSection members={members} />
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
