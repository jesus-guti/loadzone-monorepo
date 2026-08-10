import type { RecommendedSetupStepId } from "@/lib/recommended-setup";

export type PrimerosPasosStepConfig = {
  id: RecommendedSetupStepId;
  label: string;
  href: string;
};

/** Spanish product copy + settled CTA destinations (JES-83). */
export const PRIMEROS_PASOS_STEPS: readonly PrimerosPasosStepConfig[] = [
  {
    id: "clubLogo",
    label: "Logo del club",
    href: "/settings/club",
  },
  {
    id: "season",
    label: "Crear una temporada",
    href: "/seasons/new",
  },
  {
    id: "player",
    label: "Añadir un jugador",
    href: "/players",
  },
  {
    id: "exercise",
    label: "Usar un ejercicio",
    href: "/exercises",
  },
  {
    id: "session",
    label: "Crear una sesión",
    href: "/sessions/new",
  },
] as const;

export function getPrimerosPasosStepConfig(
  id: RecommendedSetupStepId,
): PrimerosPasosStepConfig {
  const step = PRIMEROS_PASOS_STEPS.find((entry) => entry.id === id);
  if (!step) {
    throw new Error(`Unknown Primeros pasos step: ${id}`);
  }
  return step;
}
