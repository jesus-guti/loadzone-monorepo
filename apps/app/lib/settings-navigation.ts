import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import {
  BuildingsIcon,
  GlobeSimpleIcon,
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
  superAdminOnly?: boolean;
};

function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const SETTINGS_BASE = "/settings";

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
  {
    href: `${SETTINGS_BASE}/plataforma`,
    icon: GlobeSimpleIcon,
    label: "Plataforma",
    match: (pathname: string) =>
      matchesPath(pathname, `${SETTINGS_BASE}/plataforma`),
    superAdminOnly: true,
  },
];

/** True for `/settings` and any nested settings route. */
export function isSettingsPath(pathname: string): boolean {
  return matchesPath(pathname, SETTINGS_BASE);
}

/** Page title for the settings header (matches nav label; Equipo is default). */
export function settingsPageTitle(pathname: string): string {
  const match = settingsNavigation.find((item) => item.match(pathname));
  return match?.label ?? "Equipo";
}
