import type { PlatformRole } from "@repo/database";

/** Coordinators never see Clubes. Matches Configuración → Plataforma (notFound). */
export function clubsConsoleIsHidden(
  platformRole: PlatformRole | null | undefined
): boolean {
  return platformRole !== "SUPER_ADMIN";
}
