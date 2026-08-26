"use client";

import { useEffect, useState, type JSX } from "react";
import { useSearchParams } from "next/navigation";
import type { CromoTier } from "../lib/streak-cromo";
import { parseTier, parseVariant, VARIANT_META } from "./constants";
import "./foil-lab.css";
import { LabFoilCard } from "./lab-card";
import { FoilPrototypeSwitcher } from "./switcher";

/**
 * Three foil recipes on a TCG-like Streak Cromo, switchable via ?variant=
 * and ?tier= on /[token]/prototype-cromo-foil. Throwaway lab.
 */

type LabProperties = {
  readonly token: string;
  readonly initialVariant: "A" | "B" | "C";
  readonly initialTier: CromoTier;
};

export function PrototypeCromoFoilLab({
  token,
  initialVariant,
  initialTier,
}: LabProperties): JSX.Element {
  const searchParams = useSearchParams();
  const variant = parseVariant(searchParams.get("variant") ?? initialVariant);
  const tier = parseTier(searchParams.get("tier") ?? String(initialTier), variant);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-bg-secondary px-5 pb-36 pt-10 text-text-primary">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-premium">
        PROTOTIPO · foil + tilt
      </p>
      <h1 className="mt-2 max-w-sm text-center text-xl font-semibold">
        ¿Se siente coleccionable al inclinar?
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
        Metal en marco, sello, dorsal y pastilla LOADZONE. El retrato se queda
        mate. Receta {VARIANT_META[variant].name}. Token lab {token}.
      </p>

      <div className="mt-8 flex w-full justify-center">
        <LabFoilCard
          reducedMotion={reducedMotion}
          tier={tier}
          variant={variant}
        />
      </div>

      <FoilPrototypeSwitcher tier={tier} variant={variant} />
    </div>
  );
}
