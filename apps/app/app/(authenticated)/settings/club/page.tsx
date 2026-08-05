import type { Metadata } from "next";
import { DEFAULT_AGE_BAND_POLICY } from "@repo/database/age-band-policy";
import { notFound } from "next/navigation";
import { ClubSettingsForm } from "@/features/settings/components/club-settings-form";
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

  return (
    <ClubSettingsForm
      key={staffContext.activeTeam.id}
      teamId={staffContext.activeTeam.id}
      canEdit={staffContext.canCreateTeam}
      clubName={staffContext.club.name}
      clubLogoUrl={staffContext.club.logoUrl}
      clubAgePolicy={clubAgePolicy}
    />
  );
}
