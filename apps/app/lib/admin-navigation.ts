import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import {
  CalendarDotsIcon,
  GearSixIcon,
  HeartIcon,
  SoccerBallIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";

export type AdminNavItem = {
  href: string;
  icon: Icon;
  label: string;
  match: (pathname: string) => boolean;
};

function matchesPath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Day-to-day destinations — shared by desktop sidebar and mobile bottom nav. */
export const operationalNavigation: AdminNavItem[] = [
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
    href: "/players",
    icon: UsersIcon,
    label: "Jugadores",
    match: (pathname: string) => matchesPath(pathname, "/players"),
  },
  {
    href: "/exercises",
    icon: SoccerBallIcon,
    label: "Ejercicios",
    match: (pathname: string) => matchesPath(pathname, "/exercises"),
  },
  {
    href: "/injuries",
    icon: HeartIcon,
    label: "Lesiones",
    match: (pathname: string) => matchesPath(pathname, "/injuries"),
  },
];

/** Alone at the bottom of the ops sidebar nav (above footer). */
export const configurationNavItem: AdminNavItem = {
  href: "/settings",
  icon: GearSixIcon,
  label: "Configuración",
  match: (pathname: string) => matchesPath(pathname, "/settings"),
};
