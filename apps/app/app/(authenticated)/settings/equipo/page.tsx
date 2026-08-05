import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EquipoSettingsForm } from "@/features/settings/components/equipo-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Equipo | Configuración | LoadZone",
};

export default async function EquipoSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  return (
    <EquipoSettingsForm
      teamId={staffContext.activeTeam.id}
      initialCategory={staffContext.activeTeam.category ?? ""}
      initialTimezone={staffContext.activeTeam.timezone}
    />
  );
}
