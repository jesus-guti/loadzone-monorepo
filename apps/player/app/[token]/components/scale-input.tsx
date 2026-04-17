"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

type ScaleInputProperties = {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly renderLabel?: (value: number) => ReactNode;
  readonly renderCaption?: (value: number) => ReactNode;
  readonly getColor?: (value: number, max: number) => string;
  readonly anchorLabels?: readonly [string, string];
  readonly valueLabels?: Record<number, string>;
};

function defaultColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.35) return "bg-danger text-danger-foreground";
  if (ratio <= 0.7) return "bg-premium text-premium-foreground";
  return "bg-brand text-brand-foreground";
}

export function ScaleInput({
  name,
  min,
  max,
  value,
  onChange,
  renderLabel,
  renderCaption,
  getColor = defaultColor,
  anchorLabels,
  valueLabels,
}: ScaleInputProperties) {
  const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  function handleSelect(next: number) {
    onChange(next);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value ?? ""} />

      <div
        className={cn(
          "grid gap-2",
          options.length <= 5
            ? "grid-cols-5"
            : "grid-cols-6 sm:grid-cols-11"
        )}
      >
        {options.map((option) => {
          const isSelected = value === option;
          const color = getColor(option, max);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex aspect-square min-h-14 flex-col items-center justify-center rounded-2xl text-lg font-bold transition-all active:scale-95",
                color,
                isSelected
                  ? "scale-[1.04] shadow-elevated ring-2 ring-text-primary/10"
                  : "opacity-30 hover:opacity-70"
              )}
            >
              {renderLabel ? renderLabel(option) : option}
            </button>
          );
        })}
      </div>

      {anchorLabels ? (
        <div className="flex items-center justify-between px-1 text-xs font-medium text-text-secondary">
          <span>{anchorLabels[0]}</span>
          <span>{anchorLabels[1]}</span>
        </div>
      ) : null}

      {renderCaption && value !== null ? (
        <p className="text-center text-sm font-semibold text-text-primary">
          {renderCaption(value)}
        </p>
      ) : value !== null && valueLabels?.[value] ? (
        <p className="text-center text-sm font-semibold text-text-primary">
          {valueLabels[value]}
        </p>
      ) : null}
    </div>
  );
}
