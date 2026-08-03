"use client";

import type { JSX } from "react";

import { Button } from "@repo/design-system/components/button";
import type { AgeBand } from "./constants";
import { DEMO_STREAK, STUB_QUESTIONS } from "./constants";
import { COPY, optionLabel, questionPrompt } from "./copy";
import {
  AnswerGrid,
  BandCaption,
  CalmStreakChip,
  FootballTeaser,
  ProgressDots,
  PrototypeMark,
} from "./shared";

type VariantCProperties = {
  readonly band: AgeBand;
  readonly step: number;
  readonly answers: Record<string, number>;
  readonly completed: boolean;
  readonly simulateMiss: boolean;
  readonly careTriggered: boolean;
  readonly onAnswer: (questionId: string, value: number) => void;
  readonly onRestart: () => void;
};

export function VariantCReward({
  band,
  step,
  answers: _answers,
  completed,
  simulateMiss,
  careTriggered,
  onAnswer,
  onRestart,
}: VariantCProperties): JSX.Element {
  const question = STUB_QUESTIONS[step];
  const total = STUB_QUESTIONS.length;
  const showDeferred =
    band !== "independent" && !completed && step === 0;

  if (completed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-5 px-5 pb-36 pt-6">
        <PrototypeMark />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <FootballTeaser prominent />
          <p className="text-center text-xl font-semibold text-text-primary">
            {COPY.completionTitle[band]}
          </p>
          <p className="max-w-xs text-center text-sm text-text-secondary">
            {COPY.completionBody[band]}
          </p>
          <CalmStreakChip days={DEMO_STREAK} simulateMiss={simulateMiss} />
          {careTriggered && band !== "independent" && COPY.careSilentNote ? (
            <p className="text-center text-xs text-text-tertiary">
              {COPY.careSilentNote}
            </p>
          ) : null}
          {band !== "independent" && COPY.deferredBanner ? (
            <p className="rounded-2xl bg-bg-tertiary px-4 py-3 text-center text-xs text-text-secondary">
              {COPY.deferredBanner}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          size="lg"
          className="min-h-12 w-full rounded-2xl"
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
      <PrototypeMark />

      {showDeferred && COPY.deferredBanner ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border-secondary bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          {COPY.deferredBanner}
        </p>
      ) : null}

      {band === "assisted" && COPY.assistedPresence ? (
        <p className="mt-3 text-sm text-text-secondary">{COPY.assistedPresence}</p>
      ) : null}

      <div className="mt-4">
        <BandCaption band={band} />
      </div>

      <div className="mt-6 rounded-3xl bg-bg-tertiary/40 px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <ProgressDots total={total} current={step} />
          <span className="text-xs text-text-tertiary">
            {COPY.stepOf(step + 1, total)}
          </span>
        </div>
        <h1 className="mt-5 text-xl font-semibold leading-snug text-text-primary">
          {questionPrompt(question.key, band)}
        </h1>
        <div className="mt-4">
          <AnswerGrid
            options={options}
            onSelect={(value) => onAnswer(question.id, value)}
          />
        </div>
      </div>
    </div>
  );
}
