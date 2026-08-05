import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CuentaSettingsForm } from "@/features/settings/components/cuenta-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Cuenta | Configuración | LoadZone",
};

export default async function CuentaSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  return (
    <CuentaSettingsForm
      key={staffContext.activeTeam.id}
      teamId={staffContext.activeTeam.id}
      email={staffContext.user.email}
      name={staffContext.user.name}
      imageUrl={staffContext.user.image}
    />
  );
}
