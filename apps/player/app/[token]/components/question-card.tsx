"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
const FIELD_DURATION_S = 0.22;
const REDUCED_DURATION_S = 0.15;

/**
 * Focus-frame step: the question header stays mounted. Only the field body
 * slides out when answered (summary remains) and the next step’s field slides in.
 * Upcoming steps stay hidden (OQAT).
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

  const isActive = state === "active";
  const duration = reduceMotion ? REDUCED_DURATION_S : FIELD_DURATION_S;

  return (
    <section
      style={style}
      aria-current={isActive ? "step" : undefined}
      className="space-y-5 rounded-3xl bg-bg-secondary p-6"
      data-focus-step={state}
    >
      <header className="space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Pregunta {index + 1}
        </p>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary">
          {label}
        </h2>
        {isActive && accessory ? (
          <div className="flex justify-center">{accessory}</div>
        ) : null}
      </header>

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="field"
            className="overflow-hidden"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, height: 0 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, height: "auto" }
            }
            exit={
              reduceMotion
                ? {
                    opacity: 0,
                    transition: { duration, ease: easeOut },
                  }
                : {
                    opacity: 0,
                    y: -10,
                    height: 0,
                    transition: { duration, ease: easeOut },
                  }
            }
            transition={{ duration, ease: easeOut }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.button
            key="summary"
            type="button"
            layout={false}
            onClick={onEdit}
            aria-label={`Editar ${label}`}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-bg-primary/50 px-4 py-3 text-center transition-colors hover:bg-bg-primary"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, transition: { duration, ease: easeOut } }
            }
            transition={{ duration, ease: easeOut }}
          >
            <CheckCircleIcon
              className="size-5 shrink-0 text-brand"
              weight="fill"
            />
            <span className="text-sm font-semibold text-text-primary">
              {summary}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
