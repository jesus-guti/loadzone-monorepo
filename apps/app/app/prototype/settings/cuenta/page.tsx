import type { Metadata } from "next";
import { SettingsStubPage } from "../_components/settings-stub-page";

export const metadata: Metadata = {
  title: "Cuenta · Prototipo configuración | LoadZone",
};

const CuentaStubPage = () => <SettingsStubPage title="Cuenta" />;

export default CuentaStubPage;
