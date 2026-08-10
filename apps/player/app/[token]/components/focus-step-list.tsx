"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactElement } from "react";
import type { QuestionState } from "./question-card";

type FocusStepItem = {
  readonly key: string;
  readonly state: QuestionState;
  /** Must return a keyed root; active content is wrapped in the shared shell. */
  readonly render: (order: number) => ReactElement;
};

type FocusStepListProperties = {
  readonly items: readonly FocusStepItem[];
};

const easeOut = [0.22, 1, 0.36, 1] as const;
const CLOSE_DURATION_S = 0.2;
const OPEN_DURATION_S = 0.22;
const REDUCED_DURATION_S = 0.15;

/**
 * Completed rows + one persistent Focus card shell. Height close→open runs
 * inside the same chrome so the panel feels continuous, not a div swap.
 *
 * While an active step is exiting, its completed twin is withheld so the
 * collapsing content and compact row do not stack for the same step.
 */
export function FocusStepList({ items }: FocusStepListProperties) {
  const reduceMotion = useReducedMotion();
  const activeIndex = items.findIndex((item) => item.state === "active");
  const activeKey = activeIndex >= 0 ? items[activeIndex].key : null;
  const prevActiveKeyRef = useRef<string | null>(activeKey);
  const [exitingKey, setExitingKey] = useState<string | null>(null);

  useEffect(() => {
    const prev = prevActiveKeyRef.current;
    if (prev !== null && prev !== activeKey) {
      setExitingKey(prev);
    }
    prevActiveKeyRef.current = activeKey;
  }, [activeKey]);

  const showShell = activeIndex >= 0 || exitingKey !== null;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        if (item.state !== "completed") return null;
        if (item.key === exitingKey) return null;
        return item.render(index);
      })}

      {showShell ? (
        <div
          className="overflow-hidden rounded-3xl bg-bg-secondary"
          style={activeIndex >= 0 ? { order: activeIndex } : undefined}
          data-focus-active-shell=""
        >
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => {
              setExitingKey(null);
            }}
          >
            {activeIndex >= 0 ? (
              <motion.div
                key={items[activeIndex].key}
                className="overflow-hidden"
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, height: "auto" }
                }
                exit={
                  reduceMotion
                    ? {
                        opacity: 0,
                        transition: {
                          duration: REDUCED_DURATION_S,
                          ease: easeOut,
                        },
                      }
                    : {
                        opacity: 0,
                        height: 0,
                        transition: {
                          duration: CLOSE_DURATION_S,
                          ease: easeOut,
                        },
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: REDUCED_DURATION_S, ease: easeOut }
                    : { duration: OPEN_DURATION_S, ease: easeOut }
                }
              >
                {items[activeIndex].render(activeIndex)}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
