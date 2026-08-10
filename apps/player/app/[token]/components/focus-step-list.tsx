"use client";

import type { ReactElement } from "react";
import type { QuestionState } from "./question-card";

type FocusStepItem = {
  readonly key: string;
  readonly state: QuestionState;
  readonly render: (order: number) => ReactElement;
};

type FocusStepListProperties = {
  readonly items: readonly FocusStepItem[];
};

/**
 * Renders completed + active Focus steps in order. Each `QuestionCard` keeps
 * its question header mounted; field slide lives inside the card.
 */
export function FocusStepList({ items }: FocusStepListProperties) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        if (item.state === "upcoming") return null;
        return item.render(index);
      })}
    </div>
  );
}
