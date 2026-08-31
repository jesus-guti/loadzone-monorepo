import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Políticas | Configuración | LoadZone",
};

/** Age Band / reminder-consent-by-band settings are postponed. */
export default function PoliticasSettingsPage() {
  redirect("/settings/equipo");
}
