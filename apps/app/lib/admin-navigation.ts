import {
  CalendarDaysIcon,
  CalendarIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  HeartIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    title?: string;
    titleId?: string;
  }
>;

export type AdminNavItem = {
  href: string;
  icon: HeroIcon;
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
    icon: HomeIcon,
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
    icon: CalendarDaysIcon,
    label: "Sesiones",
    match: (pathname: string) => matchesPath(pathname, "/sessions"),
  },
  {
    href: "/settings",
    icon: Cog6ToothIcon,
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
    href: "/injuries",
    icon: HeartIcon,
    label: "Lesiones",
    match: (pathname: string) => matchesPath(pathname, "/injuries"),
  },
  {
    href: "/seasons",
    icon: CalendarIcon,
    label: "Temporadas",
    match: (pathname: string) => matchesPath(pathname, "/seasons"),
  },
  {
    href: "/analysis",
    icon: CpuChipIcon,
    label: "Análisis IA",
    match: (pathname: string) => matchesPath(pathname, "/analysis"),
  },
];
