"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type ReactElement } from "react";
import type { QuestionState } from "./question-card";

type FocusStepItem = {
  readonly key: string;
  readonly state: QuestionState;
  /** Must return a keyed motion root (e.g. QuestionCard) for exit animations. */
  readonly render: (order: number) => ReactElement;
};

type FocusStepListProperties = {
  readonly items: readonly FocusStepItem[];
};

/**
 * Completed rows + one active Focus card. `AnimatePresence mode="wait"`
 * sequences active height close→open. Flex `order` preserves step order
 * when editing an earlier completed row.
 *
 * While an active card is exiting, its completed twin is withheld so the
 * collapsing section and compact row do not stack for the same step.
 */
export function FocusStepList({ items }: FocusStepListProperties) {
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

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        if (item.state !== "completed") return null;
        if (item.key === exitingKey) return null;
        return item.render(index);
      })}

      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          setExitingKey(null);
        }}
      >
        {activeIndex >= 0 ? items[activeIndex].render(activeIndex) : null}
      </AnimatePresence>
    </div>
  );
}
