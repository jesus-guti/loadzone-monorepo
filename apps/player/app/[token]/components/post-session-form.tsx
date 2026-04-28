"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { savePostSession } from "../actions/save-entry";
import { SliderInput } from "./slider-input";
import { ChipInput } from "./chip-input";
import { QuestionCard, type QuestionState } from "./question-card";
import { CheckCircle2Icon, FlameIcon } from "lucide-react";

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
  readonly onComplete: () => void;
};

type StepKey = "rpe" | "duration";

export function PostSessionForm({
  token,
  date,
  teamSessionId,
  template,
  onComplete,
}: PostSessionFormProperties) {
  const [rpe, setRpe] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(savePostSession, {
    success: false,
  });

  const questions = template?.questions ?? [];
  const rpeQuestion =
    questions.find((question) => question.mappingKey === "rpe") ?? null;
  const durationQuestion =
    questions.find((question) => question.mappingKey === "duration") ?? null;

  const steps = useMemo(() => {
    const list: Array<{ key: StepKey; hasValue: boolean }> = [];
    if (rpeQuestion) list.push({ key: "rpe", hasValue: rpe !== null });
    if (durationQuestion)
      list.push({ key: "duration", hasValue: duration !== null });
    return list;
  }, [rpeQuestion, durationQuestion, rpe, duration]);

  const answeredCount = steps.filter((step) => step.hasValue).length;
  const totalSteps = steps.length;
  const isValid = totalSteps > 0 && answeredCount === totalSteps;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((answeredCount / totalSteps) * 100);

  useEffect(() => {
    if (state.success) {
      toast.success("Post-sesión guardada");
      onComplete();
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

  function advanceFrom(index: number) {
    const nextUnanswered = steps.findIndex(
      (step, idx) => idx > index && !step.hasValue
    );
    const targetIndex =
      nextUnanswered === -1
        ? steps.findIndex((step) => !step.hasValue)
        : nextUnanswered;

    if (targetIndex === -1) {
      setCurrentStep(steps.length);
      return;
    }

    setCurrentStep(targetIndex);
    requestAnimationFrame(() => {
      const target = stepRefs.current[targetIndex];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function handleAnswer(index: number, apply: () => void) {
    apply();
    requestAnimationFrame(() => advanceFrom(index));
  }

  function handleEdit(index: number) {
    setCurrentStep(index);
    requestAnimationFrame(() => {
      const target = stepRefs.current[index];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function handleSubmit() {
    formRef.current?.requestSubmit();
  }

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
        {durationQuestion ? (
          <input
            type="hidden"
            name={durationQuestion.key}
            value={duration ?? ""}
          />
        ) : null}

        <div className="space-y-3">
          {steps.map((step, index) => {
            const questionState = stateFor(index);

            if (step.key === "rpe" && rpeQuestion) {
              return (
                <div
                  key={step.key}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                >
                  <QuestionCard
                    state={questionState}
                    index={index}
                    label={rpeQuestion.label}
                    summary={
                      rpe !== null ? `${BORG_LABELS[rpe]} · ${rpe}` : undefined
                    }
                    onEdit={() => handleEdit(index)}
                  >
                    <SliderInput
                      name={rpeQuestion.key}
                      min={rpeQuestion.minValue ?? 0}
                      max={rpeQuestion.maxValue ?? 10}
                      value={rpe}
                      onChange={setRpe}
                      onCommit={() => advanceFrom(index)}
                      anchorLabels={["Muy suave", "Máximo"]}
                      labelForValue={(value) => BORG_LABELS[value]}
                      colorForValue={borgColor}
                      gradientClassName="from-brand via-premium to-danger"
                    />
                  </QuestionCard>
                </div>
              );
            }

            if (step.key === "duration" && durationQuestion) {
              return (
                <div
                  key={step.key}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                >
                  <QuestionCard
                    state={questionState}
                    index={index}
                    label={durationQuestion.label}
                    summary={duration !== null ? `${duration} min` : undefined}
                    onEdit={() => handleEdit(index)}
                  >
                    <ChipInput
                      name={durationQuestion.key}
                      options={[
                        { value: 45, label: "45 min" },
                        { value: 60, label: "60 min" },
                        { value: 75, label: "75 min" },
                        { value: 90, label: "90 min" },
                        { value: 105, label: "105 min" },
                        { value: 120, label: "120 min" },
                      ]}
                      value={duration}
                      onChange={(next) =>
                        handleAnswer(index, () => setDuration(next))
                      }
                      min={durationQuestion.minValue ?? 1}
                      max={durationQuestion.maxValue ?? 600}
                      step={durationQuestion.step ?? 5}
                      customPlaceholder="Otro (min)"
                    />
                  </QuestionCard>
                </div>
              );
            }

            return null;
          })}
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
        <div className="mx-auto max-w-md px-4 pb-4 pt-6 pointer-events-auto bg-linear-to-t from-bg-primary via-bg-primary to-transparent">
          <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <span>
              {answeredCount} / {totalSteps}
            </span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="h-14 w-full rounded-full text-base font-bold shadow-elevated"
            size="lg"
          >
            {isPending ? (
              "Guardando..."
            ) : isValid ? (
              <span className="flex items-center gap-2">
                <FlameIcon className="h-5 w-5" />
                Guardar y sumar racha
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 opacity-60" />
                Falta{totalSteps - answeredCount === 1 ? "" : "n"}{" "}
                {totalSteps - answeredCount} respuesta
                {totalSteps - answeredCount === 1 ? "" : "s"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
