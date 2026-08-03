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

type VariantAProperties = {
  readonly band: AgeBand;
  readonly step: number;
  readonly answers: Record<string, number>;
  readonly completed: boolean;
  readonly simulateMiss: boolean;
  readonly careTriggered: boolean;
  readonly onAnswer: (questionId: string, value: number) => void;
  readonly onRestart: () => void;
};

export function VariantAFocus({
  band,
  step,
  answers,
  completed,
  simulateMiss,
  careTriggered,
  onAnswer,
  onRestart,
}: VariantAProperties): JSX.Element {
  const question = STUB_QUESTIONS[step];
  const total = STUB_QUESTIONS.length;

  if (completed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-6 px-5 pb-36 pt-8">
        <PrototypeMark />
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <p className="text-3xl font-semibold tracking-tight text-text-primary">
            {COPY.completionTitle[band]}
          </p>
          <p className="max-w-xs text-base text-text-secondary">
            {COPY.completionBody[band]}
          </p>
          <CalmStreakChip days={DEMO_STREAK} simulateMiss={simulateMiss} />
          {careTriggered && band !== "independent" ? (
            <p className="rounded-2xl bg-bg-tertiary px-4 py-3 text-sm text-text-secondary">
              {COPY.careSilentNote}
            </p>
          ) : null}
          <FootballTeaser />
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

      {band === "assisted" ? (
        <p className="mt-4 rounded-2xl bg-brand/10 px-4 py-3 text-sm leading-snug text-text-primary">
          {COPY.assistedPresence}
        </p>
      ) : null}

      {band === "independent" ? (
        <p className="mt-4 text-xs text-text-tertiary">{COPY.independentFootnote}</p>
      ) : null}

      <div className="mt-6">
        <BandCaption band={band} />
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <ProgressDots total={total} current={step} />
        <p className="mt-3 text-center text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {COPY.stepOf(step + 1, total)}
        </p>

        <h1 className="mt-10 text-center text-2xl font-semibold leading-tight tracking-tight text-text-primary">
          {questionPrompt(question.key, band)}
        </h1>

        <div className="mt-8 flex-1">
          <AnswerGrid
            large
            options={options}
            onSelect={(value) => onAnswer(question.id, value)}
          />
        </div>

        {Object.keys(answers).length > 0 ? (
          <p className="mt-4 text-center text-xs text-text-tertiary">
            Estado: {Object.keys(answers).length}/{total} respondidas
          </p>
        ) : null}
      </div>
    </div>
  );
}
