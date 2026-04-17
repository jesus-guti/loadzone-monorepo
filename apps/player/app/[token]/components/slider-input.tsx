"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useRef } from "react";

type SliderInputProperties = {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly onCommit?: (value: number) => void;
  readonly anchorLabels: readonly [string, string];
  readonly labelForValue?: (value: number) => string;
  readonly colorForValue?: (value: number) => string;
  readonly gradientClassName?: string;
};

function defaultColor(): string {
  return "text-text-primary";
}

export function SliderInput({
  name,
  min,
  max,
  step = 1,
  value,
  onChange,
  onCommit,
  anchorLabels,
  labelForValue,
  colorForValue = defaultColor,
  gradientClassName = "from-danger via-premium to-brand",
}: SliderInputProperties) {
  const displayValue = value ?? Math.round((min + max) / 2);
  const committedRef = useRef(false);

  function handleChange(next: number) {
    onChange(next);
    if (navigator.vibrate) navigator.vibrate(6);
  }

  function handleRelease() {
    if (value === null) return;
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit?.(value);
    queueMicrotask(() => {
      committedRef.current = false;
    });
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name={name} value={value ?? ""} />

      <div className="flex flex-col items-center gap-2">
        <span
          className={cn(
            "text-7xl font-black leading-none tabular-nums transition-colors",
            value === null ? "text-text-tertiary" : colorForValue(value)
          )}
        >
          {value ?? "–"}
        </span>
        {value !== null && labelForValue ? (
          <span className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            {labelForValue(value)}
          </span>
        ) : (
          <span className="text-sm text-text-tertiary">
            Desliza para elegir
          </span>
        )}
      </div>

      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r",
            gradientClassName
          )}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(event) => handleChange(Number(event.target.value))}
          onPointerUp={handleRelease}
          onTouchEnd={handleRelease}
          onKeyUp={handleRelease}
          className={cn(
            "relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-text-primary [&::-webkit-slider-thumb]:bg-bg-primary [&::-webkit-slider-thumb]:shadow-elevated",
            "[&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-text-primary [&::-moz-range-thumb]:bg-bg-primary"
          )}
          aria-label={`Valor de ${min} a ${max}`}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
        <span>{anchorLabels[0]}</span>
        <span>{anchorLabels[1]}</span>
      </div>
    </div>
  );
}
