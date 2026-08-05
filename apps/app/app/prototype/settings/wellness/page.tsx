import type { Metadata } from "next";
import { SettingsStubPage } from "../_components/settings-stub-page";

export const metadata: Metadata = {
  title: "Wellness · Prototipo configuración | LoadZone",
};

const WellnessStubPage = () => <SettingsStubPage title="Wellness" />;

export default WellnessStubPage;
