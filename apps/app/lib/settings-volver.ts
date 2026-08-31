import { operationalNavigation } from "@/lib/admin-navigation";
import { isSettingsPath } from "@/lib/settings-navigation";

export type VolverMemory = {
  href: string;
  label: string;
};

export const VOLVER_STORAGE_KEY = "loadzone_settings_volver";

export const DEFAULT_VOLVER_MEMORY: VolverMemory = {
  href: "/wellness",
  label: "Wellness",
};

export function isOperationalPath(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/api")) {
    return false;
  }
  if (isSettingsPath(pathname)) {
    return false;
  }
  if (pathname.startsWith("/prototype")) {
    return false;
  }
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/sign-out") ||
    pathname.startsWith("/onboarding")
  ) {
    return false;
  }
  return true;
}

export function labelForOperationalPath(pathname: string): string {
  const fromOps = operationalNavigation.find((item) => item.match(pathname));
  if (fromOps) {
    return fromOps.label;
  }

  if (pathname === "/" || pathname === "") {
    return "Wellness";
  }

  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) {
    return "Wellness";
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function isVolverMemory(value: unknown): value is VolverMemory {
  return (
    typeof value === "object" &&
    value !== null &&
    "href" in value &&
    "label" in value &&
    typeof (value as VolverMemory).href === "string" &&
    typeof (value as VolverMemory).label === "string" &&
    (value as VolverMemory).href.length > 0 &&
    (value as VolverMemory).label.length > 0
  );
}

export function readVolverMemory(): VolverMemory {
  if (typeof window === "undefined") {
    return DEFAULT_VOLVER_MEMORY;
  }

  try {
    const raw = sessionStorage.getItem(VOLVER_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_VOLVER_MEMORY;
    }
    const parsed: unknown = JSON.parse(raw);
    if (isVolverMemory(parsed) && isOperationalPath(parsed.href)) {
      return parsed;
    }
  } catch {
    // Fall through to default.
  }

  return DEFAULT_VOLVER_MEMORY;
}

export function writeVolverMemory(memory: VolverMemory): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!isOperationalPath(memory.href)) {
    return;
  }
  try {
    sessionStorage.setItem(VOLVER_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function rememberOperationalPath(pathname: string): void {
  if (!isOperationalPath(pathname)) {
    return;
  }
  writeVolverMemory({
    href: pathname,
    label: labelForOperationalPath(pathname),
  });
}
