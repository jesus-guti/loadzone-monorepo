"use client";

import { cn } from "@repo/design-system/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
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

const easeOut = [0.22, 1, 0.36, 1] as const;

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
      <motion.button
        type="button"
        layout={false}
        onClick={onEdit}
        aria-label={`Editar ${label}`}
        className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-bg-secondary/60 px-4 py-3 text-left transition-colors hover:bg-bg-secondary"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: easeOut }}
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
      </motion.button>
    );
  }

  const isActive = state === "active";

  return (
    <motion.section
      layout={false}
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "space-y-5 rounded-3xl bg-bg-secondary p-5 transition-colors duration-200",
        isActive
          ? "shadow-elevated ring-1 ring-brand/25"
          : "opacity-50 saturate-50"
      )}
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.55 }}
      transition={{ duration: 0.2, ease: easeOut }}
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
      <AnimatePresence initial={false} mode="wait">
        {isActive ? (
          <motion.div
            key="active-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
