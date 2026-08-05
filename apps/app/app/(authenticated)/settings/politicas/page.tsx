import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoliticasSettingsForm } from "@/features/settings/components/politicas-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Políticas | Configuración | LoadZone",
};

const POLICY_SOURCE_LABEL: Record<"team" | "club" | "defaults", string> = {
  team: "override del equipo",
  club: "valores del club",
  defaults: "valores seguros por defecto",
};

export default async function PoliticasSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  return (
    <PoliticasSettingsForm
      key={staffContext.activeTeam.id}
      teamId={staffContext.activeTeam.id}
      policySourceLabel={
        POLICY_SOURCE_LABEL[staffContext.activeTeam.ageBandPolicySource]
      }
      teamAgePolicy={staffContext.activeTeam.ageBandPolicy}
      inheritsClubAgePolicy={
        staffContext.activeTeam.ageBandPolicyOverride === null
      }
      reminderConsentPolicy={staffContext.activeTeam.reminderConsentPolicy}
    />
  );
}
