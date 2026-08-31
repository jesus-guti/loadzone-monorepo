import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CuentaSettingsForm } from "@/features/settings/components/cuenta-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Cuenta | Configuración | LoadZone",
};

export default async function CuentaSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    notFound();
  }

  return (
    <CuentaSettingsForm
      key={staffContext.user.id}
      teamId={staffContext.activeTeam?.id ?? staffContext.club?.id ?? staffContext.user.id}
      email={staffContext.user.email}
      name={staffContext.user.name}
      imageUrl={staffContext.user.image}
    />
  );
}
