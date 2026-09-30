import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import {
  BuildingsIcon,
  CalendarDotsIcon,
  ChartBarIcon,
  GearSixIcon,
  HeartIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";

export type AdminNavItem = {
  href: string;
  icon: Icon;
  label: string;
  match: (pathname: string) => boolean;
  /** Shown in the sidebar; the destination stays unreachable. */
  disabled?: boolean;
  badge?: string;
  /** Hidden unless the signed-in User is a Super Admin. */
  superAdminOnly?: boolean;
};

function matchesPath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Daily mobile footer. The rest lives in the “Más” sheet. */
export const mobilePrimaryNavigation: AdminNavItem[] = [
  {
    href: "/wellness",
    icon: HeartIcon,
    label: "Wellness",
    match: (pathname: string) => matchesPath(pathname, "/wellness"),
  },
  {
    href: "/sessions",
    icon: CalendarDotsIcon,
    label: "Sesiones",
    match: (pathname: string) => matchesPath(pathname, "/sessions"),
  },
  {
    href: "/carga",
    icon: ChartBarIcon,
    label: "Carga",
    match: (pathname: string) => matchesPath(pathname, "/carga"),
  },
];

/** Sidebar list: daily destinations plus roster and injuries. */
export const operationalNavigation: AdminNavItem[] = [
  ...mobilePrimaryNavigation,
  {
    href: "/players",
    icon: UsersIcon,
    label: "Jugadores",
    match: (pathname: string) => matchesPath(pathname, "/players"),
  },
  {
    href: "/injuries",
    icon: HeartIcon,
    label: "Lesiones",
    match: (pathname: string) => matchesPath(pathname, "/injuries"),
  },
];

/** Operator console. Sidebar and “Más” only — never a mobile primary tab. */
export const clubsNavItem: AdminNavItem = {
  href: "/clubs",
  icon: BuildingsIcon,
  label: "Clubes",
  match: (pathname: string) => matchesPath(pathname, "/clubs"),
  superAdminOnly: true,
};

/** Alone at the bottom of the ops sidebar nav (above footer). */
export const configurationNavItem: AdminNavItem = {
  href: "/settings",
  icon: GearSixIcon,
  label: "Configuración",
  match: (pathname: string) => matchesPath(pathname, "/settings"),
};
