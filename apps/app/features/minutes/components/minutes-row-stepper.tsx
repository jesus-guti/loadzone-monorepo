"use client";

import { Button } from "@repo/design-system/components/button";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";
import { adjustSessionMinutes } from "@/features/minutes/clamp-minutes";

type MinutesRowStepperProperties = {
  readonly value: number;
  readonly onChange: (next: number) => void;
  readonly disabled?: boolean;
  readonly className?: string;
};

export function MinutesRowStepper({
  value,
  onChange,
  disabled = false,
  className,
}: MinutesRowStepperProperties): ReactElement {
  return (
    <div
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        className="h-9 min-w-9 px-2 tabular-nums text-xs"
        disabled={disabled}
        onClick={() => {
          onChange(adjustSessionMinutes(value, -5));
        }}
        type="button"
        variant="outline"
      >
        −5
      </Button>
      <Button
        className="h-9 min-w-9 px-2 tabular-nums text-sm"
        disabled={disabled}
        onClick={() => {
          onChange(adjustSessionMinutes(value, -1));
        }}
        type="button"
        variant="outline"
      >
        −1
      </Button>
      <span
        className="flex h-11 min-w-14 items-center justify-center rounded-full border border-brand bg-bg-primary px-2 tabular-nums text-lg font-bold text-text-primary"
      >
        {value}
      </span>
      <Button
        className="h-9 min-w-9 px-2 tabular-nums text-sm"
        disabled={disabled}
        onClick={() => {
          onChange(adjustSessionMinutes(value, 1));
        }}
        type="button"
        variant="outline"
      >
        +1
      </Button>
      <Button
        className="h-9 min-w-9 px-2 tabular-nums text-xs"
        disabled={disabled}
        onClick={() => {
          onChange(adjustSessionMinutes(value, 5));
        }}
        type="button"
        variant="outline"
      >
        +5
      </Button>
    </div>
  );
}
