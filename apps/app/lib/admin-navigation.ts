import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import {
  CalendarBlankIcon,
  CalendarDotsIcon,
  ClipboardTextIcon,
  CpuIcon,
  GearSixIcon,
  HeartIcon,
  HouseIcon,
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

export const primaryNavigation: AdminNavItem[] = [
  {
    href: "/",
    icon: HouseIcon,
    label: "Inicio",
    match: (pathname: string) => matchesPath(pathname, "/"),
  },
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
    href: "/settings",
    icon: GearSixIcon,
    label: "Configuración",
    match: (pathname: string) => matchesPath(pathname, "/settings"),
  },
];

export const secondaryNavigation: AdminNavItem[] = [
  {
    href: "/players",
    icon: UsersIcon,
    label: "Jugadores",
    match: (pathname: string) => matchesPath(pathname, "/players"),
  },
  {
    href: "/exercises",
    icon: ClipboardTextIcon,
    label: "Ejercicios",
    match: (pathname: string) => matchesPath(pathname, "/exercises"),
  },
  {
    href: "/injuries",
    icon: HeartIcon,
    label: "Lesiones",
    match: (pathname: string) => matchesPath(pathname, "/injuries"),
  },
  {
    href: "/seasons",
    icon: CalendarBlankIcon,
    label: "Temporadas",
    match: (pathname: string) => matchesPath(pathname, "/seasons"),
  },
  {
    href: "/analysis",
    icon: CpuIcon,
    label: "Análisis IA",
    match: (pathname: string) => matchesPath(pathname, "/analysis"),
  },
];
