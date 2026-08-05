import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import {
  BuildingsIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";

export type SettingsNavItem = {
  href: string;
  icon: Icon;
  label: string;
  match: (pathname: string) => boolean;
};

function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const SETTINGS_BASE = "/prototype/settings";

export const settingsNavigation: SettingsNavItem[] = [
  {
    href: `${SETTINGS_BASE}/equipo`,
    icon: UsersThreeIcon,
    label: "Equipo",
    match: (pathname: string) => matchesPath(pathname, `${SETTINGS_BASE}/equipo`),
  },
  {
    href: `${SETTINGS_BASE}/wellness`,
    icon: HeartIcon,
    label: "Wellness",
    match: (pathname: string) =>
      matchesPath(pathname, `${SETTINGS_BASE}/wellness`),
  },
  {
    href: `${SETTINGS_BASE}/politicas`,
    icon: ShieldCheckIcon,
    label: "Políticas",
    match: (pathname: string) =>
      matchesPath(pathname, `${SETTINGS_BASE}/politicas`),
  },
  {
    href: `${SETTINGS_BASE}/club`,
    icon: BuildingsIcon,
    label: "Club",
    match: (pathname: string) => matchesPath(pathname, `${SETTINGS_BASE}/club`),
  },
  {
    href: `${SETTINGS_BASE}/cuenta`,
    icon: UserCircleIcon,
    label: "Cuenta",
    match: (pathname: string) =>
      matchesPath(pathname, `${SETTINGS_BASE}/cuenta`),
  },
];

export type VolverMemory = {
  href: string;
  label: string;
};

export const VOLVER_STORAGE_KEY = "loadzone_prototype_settings_volver";

/** Default seed so labeled Volver is clickable without prior ops navigation. */
export const DEFAULT_VOLVER_MEMORY: VolverMemory = {
  href: "/wellness",
  label: "Wellness",
};

export type MockTeam = {
  id: string;
  name: string;
  category: string | null;
};
