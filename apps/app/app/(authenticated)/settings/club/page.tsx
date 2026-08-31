import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ClubSettingsForm } from "@/features/settings/components/club-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Club | Configuración | LoadZone",
};

type ClubSettingsPageProperties = {
  readonly searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function ClubSettingsPage({
  searchParams,
}: ClubSettingsPageProperties) {
  const params = await searchParams;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  if (tab === "usuarios") {
    redirect("/settings/usuarios");
  }

  const staffContext = await getCurrentStaffContext();
  if (!staffContext || staffContext.club === null) {
    notFound();
  }

  return (
    <ClubSettingsForm
      key={staffContext.activeTeam?.id ?? staffContext.club.id}
      userId={staffContext.user.id}
      clubId={staffContext.club.id}
      canEdit={staffContext.canCreateTeam}
      clubName={staffContext.club.name}
      clubLogoUrl={staffContext.club.logoUrl}
    />
  );
}
