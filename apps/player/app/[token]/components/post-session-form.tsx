"use client";

import { Button } from "@repo/design-system/components/button";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@repo/design-system/components/sonner";
import { savePostSession } from "../actions/save-entry";
import { SliderInput } from "./slider-input";
import { QuestionCard, type QuestionState } from "./question-card";
import { FocusStepList } from "./focus-step-list";
import { FocusProgress } from "./focus-progress";
import {
  DEFAULT_AGE_BAND,
  FOCUS_COPY,
  resolveQuestionLabel,
  shouldShowAssistedPresence,
  type AgeBand,
} from "../lib/focus-copy";
import { nextFocusStepIndex } from "../lib/focus-step";
import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";

const BORG_LABELS: Record<number, string> = {
  0: "Nada",
  1: "Muy muy fácil",
  2: "Fácil",
  3: "Moderado",
  4: "Algo duro",
  5: "Duro",
  6: "Más duro",
  7: "Muy duro",
  8: "Muy muy duro",
  9: "Casi máximo",
  10: "Máximo",
};

function borgColor(value: number): string {
  if (value <= 3) return "text-brand";
  if (value <= 6) return "text-premium";
  return "text-danger";
}

type PostSessionFormProperties = {
  readonly token: string;
  readonly date: string;
  readonly teamSessionId: string | null;
  readonly ageBand?: AgeBand;
  readonly template: {
    id: string;
    name: string;
    questions: Array<{
      id: string;
      key: string;
      label: string;
      type: "SCALE" | "NUMBER" | "BOOLEAN" | "TEXT" | "SINGLE_SELECT";
      mappingKey: string | null;
      minValue: number | null;
      maxValue: number | null;
      step: number | null;
    }>;
  } | null;
  readonly onComplete: (result?: {
    currentStreak?: number;
    restarted?: boolean;
  }) => void;
};

type StepKey = "rpe";

export function PostSessionForm({
  token,
  date,
  teamSessionId,
  ageBand = DEFAULT_AGE_BAND,
  template,
  onComplete,
}: PostSessionFormProperties) {
  const [rpe, setRpe] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(savePostSession, {
    success: false,
  });

  const questions = (template?.questions ?? []).filter(
    (question) => question.mappingKey !== "duration"
  );
  const rpeQuestion =
    questions.find((question) => question.mappingKey === "rpe") ?? null;

  const steps = useMemo(() => {
    const list: Array<{ key: StepKey; hasValue: boolean }> = [];
    if (rpeQuestion) list.push({ key: "rpe", hasValue: rpe !== null });
    return list;
  }, [rpeQuestion, rpe]);

  const answeredCount = steps.filter((step) => step.hasValue).length;
  const totalSteps = steps.length;
  const isValid = totalSteps > 0 && answeredCount === totalSteps;
  const allAnswered = isValid;

  useEffect(() => {
    if (state.success) {
      toast.success("Post-sesión guardada");
      onComplete({
        currentStreak: state.currentStreak,
        restarted: state.restarted,
      });
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  function stateFor(index: number): QuestionState {
    if (index === currentStep) return "active";
    if (steps[index]?.hasValue) return "completed";
    return "upcoming";
  }

  function advanceFrom(index: number, answeredIndex?: number) {
    const hasValues = steps.map((step, stepIndex) =>
      stepIndex === answeredIndex ? true : step.hasValue
    );
    setCurrentStep(nextFocusStepIndex(hasValues, index));
  }

  function handleEdit(index: number) {
    setCurrentStep(index);
  }

  function handleSubmit() {
    formRef.current?.requestSubmit();
  }

  const progressCurrent = allAnswered
    ? Math.max(totalSteps - 1, 0)
    : Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const progressLabel = FOCUS_COPY.stepOf(
    allAnswered ? totalSteps : progressCurrent + 1,
    totalSteps
  );

  if (!template) {
    return (
      <div className="rounded-3xl bg-bg-secondary p-6 text-center">
        <p className="text-sm text-danger">
          No hay formulario post-sesión configurado para este equipo.
        </p>
      </div>
    );
  }

  return (
    <>
      <form ref={formRef} action={action} className="pb-28">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="templateId" value={template.id} />
        <input type="hidden" name="teamSessionId" value={teamSessionId ?? ""} />
        {rpeQuestion ? (
          <input type="hidden" name={rpeQuestion.key} value={rpe ?? ""} />
        ) : null}

        <div className="space-y-4">
          {shouldShowAssistedPresence(ageBand) ? (
            <p className="text-sm text-text-secondary">
              {FOCUS_COPY.assistedPresence}
            </p>
          ) : null}

          {totalSteps > 0 ? (
            <FocusProgress
              total={totalSteps}
              current={progressCurrent}
              label={progressLabel}
            />
          ) : null}

          <FocusStepList
            items={steps.map((step, index) => {
              const questionState = stateFor(index);

              if (step.key === "rpe" && rpeQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={resolveQuestionLabel(
                        "rpe",
                        ageBand,
                        rpeQuestion.label
                      )}
                      summary={
                        rpe !== null
                          ? `${BORG_LABELS[rpe]} · ${rpe}`
                          : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <SliderInput
                        name={rpeQuestion.key}
                        min={rpeQuestion.minValue ?? 0}
                        max={rpeQuestion.maxValue ?? 10}
                        value={rpe}
                        onChange={setRpe}
                        onCommit={() => advanceFrom(index, index)}
                        anchorLabels={["Muy suave", "Máximo"]}
                        labelForValue={(value) => BORG_LABELS[value]}
                        colorForValue={borgColor}
                        gradientClassName="from-brand via-premium to-danger"
                      />
                    </QuestionCard>
                  ),
                };
              }

              return {
                key: step.key,
                state: questionState,
                render: (_order: number) => <></>,
              };
            })}
          />
        </div>
      </form>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
        <div className="pointer-events-auto mx-auto max-w-md bg-linear-to-t from-bg-primary via-bg-primary to-transparent px-4 pb-4 pt-6">
          <div className="flex items-center justify-between pb-2 text-xs font-medium text-text-secondary">
            <span>
              {answeredCount} / {totalSteps}
            </span>
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="h-14 min-h-12 w-full rounded-full text-base font-semibold"
            size="lg"
          >
            {isPending ? (
              FOCUS_COPY.saving
            ) : isValid ? (
              FOCUS_COPY.save
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 opacity-60" weight="fill" />
                {totalSteps - answeredCount === 1
                  ? FOCUS_COPY.remainingOne
                  : FOCUS_COPY.remainingMany(totalSteps - answeredCount)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
