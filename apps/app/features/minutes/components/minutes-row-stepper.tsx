"use client";

import type { ReactElement } from "react";
import { MinutesTabataStepper } from "./minutes-tabata-stepper";

const PLAYER_FLAVOR = [
  "¿Cuánto corre?",
  "A tope hoy",
  "Minutos de oro",
  "A fondo",
  "Sin reservas",
] as const;

function flavorForIndex(index: number): string {
  return PLAYER_FLAVOR[index % PLAYER_FLAVOR.length];
}

type MinutesRowStepperProps = {
  readonly playerName: string;
  readonly index: number;
  readonly value: number;
  readonly onChange: (next: number) => void;
  readonly disabled?: boolean;
};

export function MinutesRowStepper({
  playerName,
  index,
  value,
  onChange,
  disabled,
}: MinutesRowStepperProps): ReactElement {
  return (
    <div className="rounded-2xl bg-bg-secondary/80 px-3 py-4">
      <div className="mb-3 text-center">
        <p className="text-base font-semibold text-text-primary">
          {playerName}
        </p>
        <p className="text-[11px] text-text-tertiary">
          {flavorForIndex(index)}
        </p>
      </div>
      <MinutesTabataStepper
        disabled={disabled}
        onChange={onChange}
        size="default"
        value={value}
      />
    </div>
  );
}
