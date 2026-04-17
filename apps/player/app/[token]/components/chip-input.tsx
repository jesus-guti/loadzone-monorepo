"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

type ChipOption = {
  readonly value: number;
  readonly label: string;
  readonly icon?: ReactNode;
};

type ChipInputProperties = {
  readonly name: string;
  readonly options: readonly ChipOption[];
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly customPlaceholder?: string;
};

export function ChipInput({
  name,
  options,
  value,
  onChange,
  min,
  max,
  step,
  customPlaceholder = "Otro",
}: ChipInputProperties) {
  const presetValues = options.map((option) => option.value);
  const isCustom = value !== null && !presetValues.includes(value);

  function handleSelect(next: number) {
    onChange(next);
    if (navigator.vibrate) navigator.vibrate(8);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value ?? ""} />

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex min-h-12 items-center gap-1.5 rounded-full px-5 text-base font-semibold transition-all active:scale-[0.96]",
                isSelected
                  ? "bg-brand text-brand-foreground shadow-elevated ring-2 ring-brand/40"
                  : "bg-bg-primary text-text-primary hover:bg-bg-tertiary"
              )}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2 transition",
          isCustom
            ? "bg-brand/10 ring-2 ring-brand/30"
            : "bg-bg-primary hover:bg-bg-tertiary"
        )}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          {customPlaceholder}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={isCustom && value !== null ? String(value) : ""}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "") return;
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) onChange(parsed);
          }}
          placeholder="—"
          className="h-10 w-full bg-transparent text-right text-base font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
      </div>
    </div>
  );
}
