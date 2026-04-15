"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

type ScaleInputProperties = {
  readonly name: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly renderLabel?: (value: number) => ReactNode;
  readonly getColor?: (value: number, max: number) => string;
};

function defaultColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return "bg-danger text-danger-foreground";
  if (ratio <= 0.6) return "bg-premium text-premium-foreground";
  return "bg-brand text-brand-foreground";
}

export function ScaleInput({
  name,
  label,
  min,
  max,
  value,
  onChange,
  renderLabel,
  getColor = defaultColor,
}: ScaleInputProperties) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-3 rounded-3xl bg-bg-secondary p-4">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex flex-wrap gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              onChange(n);
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className={cn(
              "flex min-h-14 min-w-14 items-center justify-center rounded-[1.25rem] border border-transparent bg-bg-secondary px-3 text-base font-semibold text-text-secondary transition-all active:scale-[0.98]",
              value === n
                ? `${getColor(n, max)} ring-1 ring-ring/15`
                : "hover:bg-bg-tertiary hover:text-text-primary"
            )}
          >
            {renderLabel ? renderLabel(n) : n}
          </button>
        ))}
      </div>
    </div>
  );
}
