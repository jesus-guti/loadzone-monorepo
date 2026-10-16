"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";
import {
  clampMinutesStepper,
  stepMinutesStepper,
} from "@/features/minutes/clamp-minutes";

type MinutesTabataStepperProps = {
  readonly value: number;
  readonly onChange: (next: number) => void;
  readonly disabled?: boolean;
  readonly size?: "default" | "hero";
};

export function MinutesTabataStepper({
  value,
  onChange,
  disabled = false,
  size = "hero",
}: MinutesTabataStepperProps): ReactElement {
  const hero = size === "hero";
  const outerClass = hero ? "size-11" : "size-9";
  const innerClass = hero ? "size-14" : "size-11";
  const iconInner = hero ? "size-7" : "size-5";
  const valueClass = hero
    ? "w-24 text-5xl font-semibold"
    : "w-16 text-2xl font-semibold";

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        hero ? "gap-3" : "gap-1.5"
      )}
    >
      <Button
        aria-label="Restar cinco minutos"
        className={cn(outerClass, "text-xs font-semibold tabular-nums")}
        disabled={disabled}
        onClick={() => onChange(stepMinutesStepper(value, -5))}
        size="icon"
        type="button"
        variant="outline"
      >
        −5
      </Button>
      <Button
        aria-label="Restar un minuto"
        className={innerClass}
        disabled={disabled}
        onClick={() => onChange(stepMinutesStepper(value, -1))}
        size="icon"
        type="button"
        variant="outline"
      >
        <MinusIcon className={iconInner} weight="fill" />
      </Button>
      <label className="sr-only" htmlFor="minutes-tabata-value">
        Minutos
      </label>
      <input
        className={cn(
          "border-0 bg-transparent text-center text-text-primary tabular-nums outline-none ring-2 ring-brand/30 rounded-sm",
          valueClass
        )}
        disabled={disabled}
        id="minutes-tabata-value"
        inputMode="numeric"
        max={300}
        min={1}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (Number.isNaN(next)) {
            return;
          }
          onChange(clampMinutesStepper(next));
        }}
        type="number"
        value={value}
      />
      <Button
        aria-label="Añadir un minuto"
        className={innerClass}
        disabled={disabled}
        onClick={() => onChange(stepMinutesStepper(value, 1))}
        size="icon"
        type="button"
        variant="outline"
      >
        <PlusIcon className={iconInner} weight="fill" />
      </Button>
      <Button
        aria-label="Añadir cinco minutos"
        className={cn(outerClass, "text-xs font-semibold tabular-nums")}
        disabled={disabled}
        onClick={() => onChange(stepMinutesStepper(value, 5))}
        size="icon"
        type="button"
        variant="outline"
      >
        +5
      </Button>
    </div>
  );
}
