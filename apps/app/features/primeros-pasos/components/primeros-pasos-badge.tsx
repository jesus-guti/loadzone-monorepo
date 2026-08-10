"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";

type PrimerosPasosBadgeProperties = {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly onExpand: () => void;
  readonly className?: string;
};

/**
 * Minimized Primeros pasos affordance — brand-bordered progress badge.
 */
export function PrimerosPasosBadge({
  completedCount,
  totalCount,
  onExpand,
  className,
}: PrimerosPasosBadgeProperties): ReactElement {
  return (
    <button
      aria-label={`Primeros pasos ${completedCount} de ${totalCount}. Expandir.`}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm border border-brand bg-bg-primary px-2.5 py-2 text-left text-xs font-medium text-text-primary transition-colors hover:bg-bg-secondary",
        className,
      )}
      onClick={onExpand}
      type="button"
    >
      <span className="truncate">Primeros pasos</span>
      <span className="shrink-0 tabular-nums text-text-secondary">
        {completedCount}/{totalCount}
      </span>
    </button>
  );
}
