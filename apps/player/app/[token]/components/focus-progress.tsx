"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { JSX } from "react";

type FocusProgressProperties = {
  readonly total: number;
  readonly current: number;
  readonly label: string;
};

/** Thin Focus progress: dots + current/total caption. */
export function FocusProgress({
  total,
  current,
  label,
}: FocusProgressProperties): JSX.Element {
  const clamped = Math.min(Math.max(current, 0), Math.max(total - 1, 0));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-2 rounded-full transition",
              index < clamped
                ? "bg-brand"
                : index === clamped
                  ? "scale-125 bg-text-primary"
                  : "bg-bg-tertiary"
            )}
          />
        ))}
      </div>
      <p className="text-center text-xs font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </p>
    </div>
  );
}
