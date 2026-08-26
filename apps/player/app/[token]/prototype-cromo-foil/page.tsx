import { Suspense } from "react";
import { PROTOTYPE_LAB_TOKEN } from "../prototype-dd-05/constants";
import { PrototypeCromoFoilLab } from "./index";
import { parseTier, parseVariant } from "./constants";

type PageProperties = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ variant?: string; tier?: string }>;
};

export default async function PrototypeCromoFoilPage({
  params,
  searchParams,
}: PageProperties) {
  const { token } = await params;
  const resolved = await searchParams;
  const variant = parseVariant(resolved.variant);
  const tier = parseTier(resolved.tier, variant);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center text-sm text-text-secondary">
          Cargando prototipo…
        </div>
      }
    >
      <PrototypeCromoFoilLab
        initialTier={tier}
        initialVariant={variant}
        token={token || PROTOTYPE_LAB_TOKEN}
      />
    </Suspense>
  );
}
