"use client";

import { Button } from "@repo/design-system/components/button";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";
import { adjustSessionMinutes } from "@/features/minutes/clamp-minutes";

type MinutesTabataStepperProperties = {
  readonly value: number;
  readonly onChange: (next: number) => void;
  readonly disabled?: boolean;
  readonly className?: string;
};

function StepButton({
  label,
  onClick,
  disabled,
  variant,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant: "inner" | "outer";
}): ReactElement {
  return (
    <Button
      className={cn(
        "tabular-nums font-semibold",
        variant === "outer" ? "size-12 text-sm" : "size-14 text-base"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {label}
    </Button>
  );
}

export function MinutesTabataStepper({
  value,
  onChange,
  disabled = false,
  className,
}: MinutesTabataStepperProperties): ReactElement {
  return (
    <div
      className={cn(
        "grid grid-cols-3 grid-rows-3 items-center justify-items-center gap-2",
        className
      )}
    >
      <span />
      <StepButton
        disabled={disabled}
        label="−5"
        onClick={() => {
          onChange(adjustSessionMinutes(value, -5));
        }}
        variant="outer"
      />
      <span />
      <StepButton
        disabled={disabled}
        label="−1"
        onClick={() => {
          onChange(adjustSessionMinutes(value, -1));
        }}
        variant="inner"
      />
      <div
        aria-live="polite"
        className="flex size-24 flex-col items-center justify-center rounded-full border-2 border-brand bg-bg-primary shadow-[0_0_0_4px_var(--color-brand)_inset] tabular-nums"
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
          min
        </span>
        <span className="text-4xl font-bold leading-none text-text-primary">
          {value}
        </span>
      </div>
      <StepButton
        disabled={disabled}
        label="+1"
        onClick={() => {
          onChange(adjustSessionMinutes(value, 1));
        }}
        variant="inner"
      />
      <span />
      <StepButton
        disabled={disabled}
        label="+5"
        onClick={() => {
          onChange(adjustSessionMinutes(value, 5));
        }}
        variant="outer"
      />
      <span />
    </div>
  );
}
