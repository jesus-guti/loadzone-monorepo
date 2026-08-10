"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";
import type { CSSProperties, ReactNode } from "react";

export type QuestionState = "upcoming" | "active" | "completed";

type QuestionCardProperties = {
  readonly state: QuestionState;
  readonly index: number;
  readonly label: string;
  readonly summary?: ReactNode;
  readonly accessory?: ReactNode;
  readonly onEdit?: () => void;
  readonly children?: ReactNode;
  /** Flex order when parent uses a reordered Focus step stack. */
  readonly style?: CSSProperties;
};

const easeOut = [0.22, 1, 0.36, 1] as const;
const CLOSE_DURATION_S = 0.2;
const REDUCED_DURATION_S = 0.15;

/**
 * Focus-frame question chrome: compact completed rows, and active body
 * content for the persistent shell in `FocusStepList` (OQAT).
 *
 * Active state is content-only (no outer card / height motion) so the parent
 * shell can close→open as one continuous panel.
 */
export function QuestionCard({
  state,
  index,
  label,
  summary,
  accessory,
  onEdit,
  children,
  style,
}: QuestionCardProperties) {
  const reduceMotion = useReducedMotion();

  if (state === "upcoming") {
    return null;
  }

  if (state === "completed") {
    return (
      <motion.button
        type="button"
        layout={false}
        style={style}
        onClick={onEdit}
        aria-label={`Editar ${label}`}
        className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-bg-secondary/60 px-4 py-3 text-left transition-colors hover:bg-bg-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceMotion ? REDUCED_DURATION_S : CLOSE_DURATION_S,
          ease: easeOut,
        }}
      >
        <span className="flex min-w-0 items-center gap-3">
          <CheckCircleIcon
            className="size-5 shrink-0 text-brand"
            weight="fill"
          />
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

  return (
    <div style={style} aria-current="step" className="space-y-6 p-6">
      <header className="space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Pregunta {index + 1}
        </p>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary">
          {label}
        </h2>
        {accessory ? (
          <div className="flex justify-center">{accessory}</div>
        ) : null}
      </header>
      <div>{children}</div>
    </div>
  );
}
