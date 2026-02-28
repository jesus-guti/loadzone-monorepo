import type { Metadata } from "next";
import { Header } from "../components/header";

export const metadata: Metadata = {
  title: "Configuración | LoadZone",
};

const SettingsPage = () => (
  <>
    <Header page="Configuración" pages={["LoadZone"]} />
    <div className="p-4 pt-0">
      <div className="rounded-xl bg-muted/50 p-8 text-center text-muted-foreground">
        Configuración del equipo (próximamente)
      </div>
    </div>
  </>
);

export default SettingsPage;
