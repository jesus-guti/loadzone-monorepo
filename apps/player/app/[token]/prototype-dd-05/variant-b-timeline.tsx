"use client";

import type { JSX } from "react";

import { Button } from "@repo/design-system/components/button";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { cn } from "@repo/design-system/lib/utils";
import type { AgeBand } from "./constants";
import { DEMO_STREAK, STUB_QUESTIONS } from "./constants";
import { COPY, optionLabel, questionPrompt } from "./copy";
import {
  AnswerGrid,
  BandCaption,
  CalmStreakChip,
  PrototypeMark,
} from "./shared";

type VariantBProperties = {
  readonly band: AgeBand;
  readonly step: number;
  readonly answers: Record<string, number>;
  readonly completed: boolean;
  readonly simulateMiss: boolean;
  readonly careTriggered: boolean;
  readonly onAnswer: (questionId: string, value: number) => void;
  readonly onRestart: () => void;
};

export function VariantBTimeline({
  band,
  step,
  answers,
  completed,
  simulateMiss,
  careTriggered,
  onAnswer,
  onRestart,
}: VariantBProperties): JSX.Element {
  const question = STUB_QUESTIONS[step];
  const total = STUB_QUESTIONS.length;
  const showPeek = band !== "assisted";

  if (completed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-5 px-5 pb-36 pt-6">
        <header className="flex items-start justify-between gap-3">
          <PrototypeMark />
          <CalmStreakChip days={DEMO_STREAK} simulateMiss={simulateMiss} />
        </header>
        <div className="rounded-3xl bg-bg-tertiary/70 px-5 py-8 text-center">
          <p className="text-2xl font-semibold text-text-primary">
            {COPY.completionTitle[band]}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {COPY.completionBody[band]}
          </p>
        </div>
        {careTriggered && band !== "independent" && COPY.careSilentNote ? (
          <p className="border-t border-border-secondary pt-3 text-sm text-text-secondary">
            {COPY.careSilentNote}
          </p>
        ) : null}
        <Button
          type="button"
          size="lg"
          className="mt-auto min-h-12 w-full rounded-2xl"
          onClick={onRestart}
        >
          {COPY.restart}
        </Button>
      </div>
    );
  }

  if (!question) return <div />;

  const options = question.options.map((option) => ({
    value: option.value,
    label: optionLabel(option, band),
    emoji: option.emoji,
  }));

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-36 pt-6">
      <header className="flex items-start justify-between gap-3">
        <PrototypeMark />
        <CalmStreakChip days={DEMO_STREAK} simulateMiss={simulateMiss} />
      </header>

      <div className="mt-4">
        <BandCaption band={band} />
      </div>

      <ol className="mt-6 space-y-0">
        {STUB_QUESTIONS.map((item, index) => {
          const answered = answers[item.id];
          const isActive = index === step;
          const isDone = answered !== undefined;

          if (!isActive && !isDone && band === "assisted") {
            return null;
          }

          if (!isActive && !isDone && !showPeek) {
            return null;
          }

          if (isDone && !isActive) {
            const selected = item.options.find((o) => o.value === answered);
            const showCare =
              item.careRelevant &&
              careTriggered &&
              band !== "independent";
            return (
              <li
                key={item.id}
                className="border-t border-border-secondary py-3 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <CheckCircleIcon
                    weight="fill"
                    className="size-5 shrink-0 text-brand"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-secondary">
                      {questionPrompt(item.key, band)}
                    </p>
                    <p className="text-sm font-medium text-text-primary">
                      {selected
                        ? optionLabel(selected, band)
                        : String(answered)}
                    </p>
                  </div>
                </div>
                {showCare && COPY.careSilentNote ? (
                  <p className="mt-2 pl-8 text-xs text-text-secondary">
                    {COPY.careSilentNote}
                  </p>
                ) : null}
              </li>
            );
          }

          if (!isActive && showPeek && !isDone) {
            return (
              <li
                key={item.id}
                className="border-t border-border-secondary py-3 text-sm text-text-tertiary first:border-t-0"
              >
                {questionPrompt(item.key, band)}
              </li>
            );
          }

          return (
            <li
              key={item.id}
              className={cn(
                "border-t border-border-secondary py-5 first:border-t-0",
                "rounded-3xl bg-bg-tertiary/50 px-4"
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                {COPY.stepOf(step + 1, total)}
              </p>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-text-primary">
                {questionPrompt(item.key, band)}
              </h2>
              <div className="mt-4">
                <AnswerGrid
                  options={options}
                  onSelect={(value) => onAnswer(item.id, value)}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
