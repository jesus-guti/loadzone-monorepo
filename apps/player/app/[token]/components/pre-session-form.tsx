"use client";

import { Button } from "@repo/design-system/components/button";
import { Badge } from "@repo/design-system/components/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/alert-dialog";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@repo/design-system/components/sonner";
import { savePreSession } from "../actions/save-entry";
import { ScaleInput } from "./scale-input";
import { SliderInput } from "./slider-input";
import { ChipInput } from "./chip-input";
import { QuestionCard, type QuestionState } from "./question-card";
import { FocusStepList } from "./focus-step-list";
import { FocusProgress } from "./focus-progress";
import {
  DEFAULT_AGE_BAND,
  FOCUS_COPY,
  isCareRelevantAnswer,
  resolveQuestionLabel,
  shouldShowAssistedPresence,
  type AgeBand,
} from "../lib/focus-copy";
import { createFocusAdvanceScheduler } from "../lib/focus-advance";
import { nextFocusStepIndex } from "../lib/focus-step";
import {
  FIXED_SAVE_CTA_INNER_CLASS,
  FIXED_SAVE_CTA_INNER_STYLE,
  FOCUS_FORM_SCROLL_PADDING_STYLE,
} from "../lib/session-chrome";
import { BatteryFullIcon } from "@phosphor-icons/react/BatteryFull";
import { BatteryHighIcon } from "@phosphor-icons/react/BatteryHigh";
import { BatteryLowIcon } from "@phosphor-icons/react/BatteryLow";
import { BatteryMediumIcon } from "@phosphor-icons/react/BatteryMedium";
import { BatteryWarningIcon } from "@phosphor-icons/react/BatteryWarning";
import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";
import type { ReactNode } from "react";

type PreSessionFormProperties = {
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
    careTriggered?: boolean;
    currentStreak?: number;
    restarted?: boolean;
  }) => void;
};

const ENERGY_ICONS: Record<number, ReactNode> = {
  1: <BatteryHighIcon className="h-5 w-5" weight="fill" />,
  2: <BatteryWarningIcon className="h-5 w-5" weight="fill" />,
  3: <BatteryLowIcon className="h-5 w-5" weight="fill" />,
  4: <BatteryMediumIcon className="h-5 w-5" weight="fill" />,
  5: <BatteryFullIcon className="h-5 w-5" weight="fill" />,
};

const ENERGY_LABELS: Record<number, string> = {
  1: "En reserva",
  2: "Justo",
  3: "Correcto",
  4: "Con chispa",
  5: "A tope",
};

const SORENESS_LABELS: Record<number, string> = {
  1: "Casi nada",
  2: "Ligeras",
  3: "Notables",
  4: "Fuertes",
  5: "Sobrecarga",
};

const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: "Muy mal",
  2: "Flojo",
  3: "Regular",
  4: "Bueno",
  5: "Reparador",
};

function recoveryCaption(value: number): string {
  if (value <= 3) return "Muy fundido";
  if (value <= 6) return "A medio gas";
  if (value <= 8) return "Fresco";
  return "Al 100%";
}

function recoveryNumberColor(value: number): string {
  if (value <= 3) return "text-danger";
  if (value <= 6) return "text-premium";
  return "text-brand";
}

function energyColor(value: number): string {
  if (value <= 2) return "bg-danger text-danger-foreground";
  if (value === 3) return "bg-premium text-premium-foreground";
  return "bg-brand text-brand-foreground";
}

function sorenessColor(value: number): string {
  if (value <= 2) return "bg-brand text-brand-foreground";
  if (value === 3) return "bg-premium text-premium-foreground";
  return "bg-danger text-danger-foreground";
}

function sleepQualityColor(value: number): string {
  if (value <= 2) return "bg-danger text-danger-foreground";
  if (value === 3) return "bg-premium text-premium-foreground";
  return "bg-brand text-brand-foreground";
}

type StepKey =
  | "recovery"
  | "energy"
  | "soreness"
  | "sleepHours"
  | "sleepQuality";

export function PreSessionForm({
  token,
  date,
  teamSessionId,
  ageBand = DEFAULT_AGE_BAND,
  template,
  onComplete,
}: PreSessionFormProperties) {
  const [recovery, setRecovery] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [showPhysioAlert, setShowPhysioAlert] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const advanceSchedulerRef = useRef(createFocusAdvanceScheduler());

  const [state, action, isPending] = useActionState(savePreSession, {
    success: false,
  });

  useEffect(() => {
    const scheduler = advanceSchedulerRef.current;
    return (): void => {
      scheduler.dispose();
    };
  }, []);

  const questions = template?.questions ?? [];

  function getQuestion(mappingKey: string) {
    return (
      questions.find((question) => question.mappingKey === mappingKey) ?? null
    );
  }

  const recoveryQuestion = getQuestion("recovery");
  const energyQuestion = getQuestion("energy");
  const sorenessQuestion = getQuestion("soreness");
  const sleepHoursQuestion = getQuestion("sleepHours");
  const sleepQualityQuestion = getQuestion("sleepQuality");

  const steps = useMemo(() => {
    const list: Array<{ key: StepKey; hasValue: boolean }> = [];
    if (recoveryQuestion) list.push({ key: "recovery", hasValue: recovery !== null });
    if (energyQuestion) list.push({ key: "energy", hasValue: energy !== null });
    if (sorenessQuestion) list.push({ key: "soreness", hasValue: soreness !== null });
    if (sleepHoursQuestion) list.push({ key: "sleepHours", hasValue: sleepHours !== null });
    if (sleepQualityQuestion) {
      list.push({ key: "sleepQuality", hasValue: sleepQuality !== null });
    }
    return list;
  }, [
    recoveryQuestion,
    energyQuestion,
    sorenessQuestion,
    sleepHoursQuestion,
    sleepQualityQuestion,
    recovery,
    energy,
    soreness,
    sleepHours,
    sleepQuality,
  ]);

  const answeredCount = steps.filter((step) => step.hasValue).length;
  const totalSteps = steps.length;
  const isValid = totalSteps > 0 && answeredCount === totalSteps;
  const allAnswered = isValid;

  useEffect(() => {
    if (state.success) {
      if (state.careConfirm && state.careConfirmMessage) {
        toast.info(state.careConfirmMessage);
      } else if (state.physioAlert) {
        toast.info("Se programará una sesión de fisioterapia.");
      } else {
        toast.success("Pre-sesión guardada");
      }
      onComplete({
        careTriggered: isCareRelevantAnswer("soreness", soreness),
        currentStreak: state.currentStreak,
        restarted: state.restarted,
      });
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onComplete, soreness]);

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

  const advanceFromRef = useRef(advanceFrom);
  advanceFromRef.current = advanceFrom;

  function handleAnswer(index: number, apply: () => void) {
    apply();
    advanceSchedulerRef.current.schedule(() => {
      advanceFromRef.current(index, index);
    });
  }

  function handleEdit(index: number) {
    advanceSchedulerRef.current.cancel();
    setCurrentStep(index);
  }

  function handleSubmit() {
    if (sorenessQuestion && soreness === 5) {
      setShowPhysioAlert(true);
      return;
    }
    formRef.current?.requestSubmit();
  }

  function confirmPhysioAndSubmit() {
    setShowPhysioAlert(false);
    formRef.current?.requestSubmit();
  }

  function labelFor(step: StepKey): string {
    const fallbacks: Record<StepKey, string> = {
      recovery: recoveryQuestion?.label ?? "Recuperación",
      energy: energyQuestion?.label ?? "Energía",
      soreness: sorenessQuestion?.label ?? "Agujetas",
      sleepHours: sleepHoursQuestion?.label ?? "Horas de sueño",
      sleepQuality: sleepQualityQuestion?.label ?? "Calidad del sueño",
    };
    return resolveQuestionLabel(step, ageBand, fallbacks[step]);
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
          No hay formulario pre-sesión configurado para este equipo.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        ref={formRef}
        action={action}
        style={FOCUS_FORM_SCROLL_PADDING_STYLE}
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="templateId" value={template.id} />
        <input type="hidden" name="teamSessionId" value={teamSessionId ?? ""} />
        {recoveryQuestion ? (
          <input
            type="hidden"
            name={recoveryQuestion.key}
            value={recovery ?? ""}
          />
        ) : null}
        {energyQuestion ? (
          <input type="hidden" name={energyQuestion.key} value={energy ?? ""} />
        ) : null}
        {sorenessQuestion ? (
          <input
            type="hidden"
            name={sorenessQuestion.key}
            value={soreness ?? ""}
          />
        ) : null}
        {sleepHoursQuestion ? (
          <input
            type="hidden"
            name={sleepHoursQuestion.key}
            value={sleepHours ?? ""}
          />
        ) : null}
        {sleepQualityQuestion ? (
          <input
            type="hidden"
            name={sleepQualityQuestion.key}
            value={sleepQuality ?? ""}
          />
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

              if (step.key === "recovery" && recoveryQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={labelFor("recovery")}
                      summary={
                        recovery !== null ? `${recovery}/10` : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <SliderInput
                        name={recoveryQuestion.key}
                        min={recoveryQuestion.minValue ?? 0}
                        max={recoveryQuestion.maxValue ?? 10}
                        value={recovery}
                        onChange={setRecovery}
                        onCommit={() => advanceFrom(index, index)}
                        anchorLabels={["Nada recuperado", "Al 100%"]}
                        labelForValue={recoveryCaption}
                        colorForValue={recoveryNumberColor}
                        gradientClassName="from-danger via-premium to-brand"
                      />
                    </QuestionCard>
                  ),
                };
              }

              if (step.key === "energy" && energyQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={labelFor("energy")}
                      summary={
                        energy !== null
                          ? `${ENERGY_LABELS[energy]} · ${energy}/5`
                          : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <ScaleInput
                        name={energyQuestion.key}
                        min={energyQuestion.minValue ?? 1}
                        max={energyQuestion.maxValue ?? 5}
                        value={energy}
                        onChange={(next) =>
                          handleAnswer(index, () => setEnergy(next))
                        }
                        renderLabel={(n) => (
                          <span className="flex flex-col items-center gap-1">
                            {ENERGY_ICONS[n]}
                            <span className="text-xs">{n}</span>
                          </span>
                        )}
                        getColor={(n) => energyColor(n)}
                        valueLabels={ENERGY_LABELS}
                        anchorLabels={["Sin gasolina", "A tope"]}
                      />
                    </QuestionCard>
                  ),
                };
              }

              if (step.key === "soreness" && sorenessQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={labelFor("soreness")}
                      summary={
                        soreness !== null
                          ? `${SORENESS_LABELS[soreness]} · ${soreness}/5`
                          : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <ScaleInput
                        name={sorenessQuestion.key}
                        min={sorenessQuestion.minValue ?? 1}
                        max={sorenessQuestion.maxValue ?? 5}
                        value={soreness}
                        onChange={(next) =>
                          handleAnswer(index, () => setSoreness(next))
                        }
                        renderLabel={(n) => (
                          <span className="flex flex-col items-center gap-1">
                            <span className="text-lg">{n}</span>
                            {n === 5 ? (
                              <span className="text-[10px] font-semibold uppercase tracking-wider">
                                Fisio
                              </span>
                            ) : null}
                          </span>
                        )}
                        getColor={(n) => sorenessColor(n)}
                        valueLabels={SORENESS_LABELS}
                        anchorLabels={["Nada", "Sobrecarga"]}
                      />
                    </QuestionCard>
                  ),
                };
              }

              if (step.key === "sleepHours" && sleepHoursQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={labelFor("sleepHours")}
                      summary={
                        sleepHours !== null ? `${sleepHours} h` : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <ChipInput
                        name={sleepHoursQuestion.key}
                        options={[
                          { value: 5, label: "5 h" },
                          { value: 6, label: "6 h" },
                          { value: 7, label: "7 h" },
                          { value: 7.5, label: "7.5 h" },
                          { value: 8, label: "8 h" },
                          { value: 9, label: "9 h" },
                        ]}
                        value={sleepHours}
                        onChange={(next) =>
                          handleAnswer(index, () => setSleepHours(next))
                        }
                        min={sleepHoursQuestion.minValue ?? 0}
                        max={sleepHoursQuestion.maxValue ?? 24}
                        step={sleepHoursQuestion.step ?? 0.5}
                      />
                    </QuestionCard>
                  ),
                };
              }

              if (step.key === "sleepQuality" && sleepQualityQuestion) {
                return {
                  key: step.key,
                  state: questionState,
                  render: (order: number) => (
                    <QuestionCard
                      key={step.key}
                      state={questionState}
                      index={index}
                      label={labelFor("sleepQuality")}
                      summary={
                        sleepQuality !== null
                          ? `${SLEEP_QUALITY_LABELS[sleepQuality]} · ${sleepQuality}/5`
                          : undefined
                      }
                      onEdit={() => handleEdit(index)}
                      style={{ order }}
                    >
                      <ScaleInput
                        name={sleepQualityQuestion.key}
                        min={sleepQualityQuestion.minValue ?? 1}
                        max={sleepQualityQuestion.maxValue ?? 5}
                        value={sleepQuality}
                        onChange={(next) =>
                          handleAnswer(index, () => setSleepQuality(next))
                        }
                        getColor={(n) => sleepQualityColor(n)}
                        valueLabels={SLEEP_QUALITY_LABELS}
                        anchorLabels={["Muy mal", "Reparador"]}
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

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
        data-fixed-save-cta
      >
        <div
          className={FIXED_SAVE_CTA_INNER_CLASS}
          style={FIXED_SAVE_CTA_INNER_STYLE}
        >
          <div className="flex items-center justify-between pb-2 text-xs font-medium text-text-secondary">
            <span>
              {answeredCount} / {totalSteps}
            </span>
            {sorenessQuestion && soreness === 5 ? (
              <Badge variant="secondary" className="bg-danger/15 text-danger">
                Aviso fisio
              </Badge>
            ) : null}
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

      <AlertDialog open={showPhysioAlert} onOpenChange={setShowPhysioAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso a fisioterapia</AlertDialogTitle>
            <AlertDialogDescription>
              Has marcado el nivel máximo de agujetas. Se programará una sesión
              con el fisio antes del entrenamiento. ¿Confirmas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPhysioAndSubmit}>
              Confirmar y guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
