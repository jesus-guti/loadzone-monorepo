import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ScaleBattery,
  ScaleIntensity,
  ScaleMatrixRadio,
  ScaleSegmented,
  ScaleSlider,
  ScaleStars,
  ScaleThermometer,
  type ScaleSize,
} from "@/features/wellness/components/wellness-scales";

export const metadata: Metadata = {
  title: "Prototype — Wellness scale cells",
};

const SIZES: ScaleSize[] = ["sm", "md"];

function SizePair({
  label,
  children,
}: {
  readonly label: string;
  readonly children: (size: ScaleSize) => ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border-secondary bg-bg-primary p-4">
      <h3 className="text-sm font-medium text-text-primary">{label}</h3>
      <div className="flex flex-wrap items-end gap-8">
        {SIZES.map((size) => (
          <div key={size} className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              {size}
            </p>
            {children(size)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Throwaway prototype: smoke-check Scale/* concepts.
 * Production wiring lives under features/wellness (JES-76).
 */
export default function WellnessScalesPrototypePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-8">
      <header className="space-y-2 border-b border-border-secondary pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Prototype · throwaway · wellness scales
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          Escalas visuales — smoke check
        </h1>
        <p className="text-sm text-text-secondary">
          Primitivos sm/md reutilizados desde features/wellness. Sin pulgares.
          No es diseño final ni DS compartido.
        </p>
        <Link
          href="/prototype/form-system"
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          ← Otros prototipos
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text-primary">
          Primitivos sm / md
        </h2>

        <SizePair label="01 · Slider (RPE)">
          {(size) => (
            <ScaleSlider size={size} value={7} label="Exigente" />
          )}
        </SizePair>

        <SizePair label="01b · Slider (recuperación, higher better)">
          {(size) => (
            <ScaleSlider
              size={size}
              value={7}
              label="TQR"
              polarity="higherIsBetter"
            />
          )}
        </SizePair>

        <SizePair label="02 · Segmented">
          {(size) => <ScaleSegmented size={size} value={4} />}
        </SizePair>

        <SizePair label="03 · Intensity (agujetas)">
          {(size) => <ScaleIntensity size={size} level={4} />}
        </SizePair>

        <SizePair label="04a · Battery (energía)">
          {(size) => <ScaleBattery size={size} level={4} />}
        </SizePair>

        <SizePair label="04b · Thermometer (riesgo)">
          {(size) => <ScaleThermometer size={size} level={3} />}
        </SizePair>

        <SizePair label="04c · Stars (sueño)">
          {(size) => <ScaleStars size={size} level={4} />}
        </SizePair>

        <SizePair label="05 · Matrix radio">
          {(size) => (
            <div className="flex items-center gap-2">
              <ScaleMatrixRadio size={size} state="off" />
              <ScaleMatrixRadio size={size} state="hover" />
              <ScaleMatrixRadio size={size} state="on" />
            </div>
          )}
        </SizePair>
      </section>
    </div>
  );
}
