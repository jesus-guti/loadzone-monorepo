import { redirect } from "next/navigation";
import { SETTINGS_BASE } from "./_components/nav-config";

const PrototypeSettingsIndexPage = () => {
  redirect(`${SETTINGS_BASE}/equipo`);
};

export default PrototypeSettingsIndexPage;
