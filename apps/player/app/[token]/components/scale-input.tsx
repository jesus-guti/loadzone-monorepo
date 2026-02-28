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
  if (ratio <= 0.3) return "bg-red-500 text-white";
  if (ratio <= 0.6) return "bg-yellow-500 text-white";
  return "bg-green-500 text-white";
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
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
              "flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 text-base font-semibold transition-all active:scale-95",
              value === n
                ? `${getColor(n, max)} border-transparent shadow-md`
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            )}
          >
            {renderLabel ? renderLabel(n) : n}
          </button>
        ))}
      </div>
    </div>
  );
}
