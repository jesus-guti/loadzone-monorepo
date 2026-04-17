"use client";

import { cn } from "@repo/design-system/lib/utils";
import { CheckCircle2Icon } from "lucide-react";
import type { ReactNode } from "react";

export type QuestionState = "upcoming" | "active" | "completed";

type QuestionCardProperties = {
  readonly state: QuestionState;
  readonly index: number;
  readonly label: string;
  readonly summary?: ReactNode;
  readonly accessory?: ReactNode;
  readonly onEdit?: () => void;
  readonly children?: ReactNode;
};

export function QuestionCard({
  state,
  index,
  label,
  summary,
  accessory,
  onEdit,
  children,
}: QuestionCardProperties) {
  if (state === "completed") {
    return (
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${label}`}
        className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-bg-secondary/60 px-4 py-3 text-left transition hover:bg-bg-secondary"
      >
        <span className="flex min-w-0 items-center gap-3">
          <CheckCircle2Icon className="size-5 shrink-0 text-brand" />
          <span className="truncate text-sm font-medium text-text-secondary">
            {label}
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-text-primary">
          {summary}
        </span>
      </button>
    );
  }

  const isActive = state === "active";

  return (
    <section
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "space-y-5 rounded-3xl bg-bg-secondary p-5 transition-all",
        isActive
          ? "shadow-elevated ring-1 ring-brand/25"
          : "opacity-50 saturate-50"
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-bold",
              isActive
                ? "bg-brand text-brand-foreground"
                : "bg-bg-tertiary text-text-tertiary"
            )}
          >
            {index + 1}
          </span>
          <h2 className="text-base font-semibold text-text-primary">{label}</h2>
        </div>
        {accessory}
      </header>
      {isActive ? children : null}
    </section>
  );
}
