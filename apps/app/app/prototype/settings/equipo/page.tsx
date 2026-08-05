import type { Metadata } from "next";
import { EquipoForm } from "../_components/equipo-form";
import { SettingsContent } from "../_components/settings-content";

export const metadata: Metadata = {
  title: "Equipo · Prototipo configuración | LoadZone",
};

const EquipoPrototypePage = () => {
  return (
    <SettingsContent>
      <EquipoForm initialCategory="Juvenil" initialTimezone="Europe/Madrid" />
    </SettingsContent>
  );
};

export default EquipoPrototypePage;
