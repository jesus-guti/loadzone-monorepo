"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { savePreSession } from "../actions/save-entry";
import { ScaleInput } from "./scale-input";
import { SliderInput } from "./slider-input";
import { ChipInput } from "./chip-input";
import { QuestionCard, type QuestionState } from "./question-card";
import {
  BatteryFullIcon,
  BatteryMediumIcon,
  BatteryLowIcon,
  BatteryWarningIcon,
  BatteryHighIcon,
  CheckCircleIcon,
  FlameIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

type PreSessionFormProperties = {
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

const ENERGY_ICONS: Record<number, ReactNode> = {
  1: <BatteryHighIcon className="h-5 w-5" />,
  2: <BatteryWarningIcon className="h-5 w-5" />,
  3: <BatteryLowIcon className="h-5 w-5" />,
  4: <BatteryMediumIcon className="h-5 w-5" />,
  5: <BatteryFullIcon className="h-5 w-5" />,
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
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(savePreSession, {
    success: false,
  });

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
    if (sleepQualityQuestion) list.push({ key: "sleepQuality", hasValue: sleepQuality !== null });
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

  useEffect(() => {
    if (state.success) {
      if (state.physioAlert) {
        toast.info("Se programará una sesión de fisioterapia.");
      } else {
        toast.success("Pre-sesión guardada");
      }
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
    const labels: Record<StepKey, string> = {
      recovery: recoveryQuestion?.label ?? "Recuperación",
      energy: energyQuestion?.label ?? "Energía",
      soreness: sorenessQuestion?.label ?? "Agujetas",
      sleepHours: sleepHoursQuestion?.label ?? "Horas de sueño",
      sleepQuality: sleepQualityQuestion?.label ?? "Calidad del sueño",
    };
    return labels[step];
  }

  const progressPercent = totalSteps === 0 ? 0 : Math.round((answeredCount / totalSteps) * 100);

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
      <form ref={formRef} action={action} className="pb-28">
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

        <div className="space-y-3">
          {steps.map((step, index) => {
            const questionState = stateFor(index);

            if (step.key === "recovery" && recoveryQuestion) {
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
                    label={labelFor("recovery")}
                    summary={recovery !== null ? `${recovery}/10` : undefined}
                    onEdit={() => handleEdit(index)}
                  >
                    <SliderInput
                      name={recoveryQuestion.key}
                      min={recoveryQuestion.minValue ?? 0}
                      max={recoveryQuestion.maxValue ?? 10}
                      value={recovery}
                      onChange={setRecovery}
                      onCommit={() => advanceFrom(index)}
                      anchorLabels={["Nada recuperado", "Al 100%"]}
                      labelForValue={recoveryCaption}
                      colorForValue={recoveryNumberColor}
                      gradientClassName="from-danger via-premium to-brand"
                    />
                  </QuestionCard>
                </div>
              );
            }

            if (step.key === "energy" && energyQuestion) {
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
                    label={labelFor("energy")}
                    summary={
                      energy !== null
                        ? `${ENERGY_LABELS[energy]} · ${energy}/5`
                        : undefined
                    }
                    onEdit={() => handleEdit(index)}
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
                </div>
              );
            }

            if (step.key === "soreness" && sorenessQuestion) {
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
                    label={labelFor("soreness")}
                    summary={
                      soreness !== null
                        ? `${SORENESS_LABELS[soreness]} · ${soreness}/5`
                        : undefined
                    }
                    onEdit={() => handleEdit(index)}
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
                </div>
              );
            }

            if (step.key === "sleepHours" && sleepHoursQuestion) {
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
                    label={labelFor("sleepHours")}
                    summary={sleepHours !== null ? `${sleepHours} h` : undefined}
                    onEdit={() => handleEdit(index)}
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
                </div>
              );
            }

            if (step.key === "sleepQuality" && sleepQualityQuestion) {
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
                    label={labelFor("sleepQuality")}
                    summary={
                      sleepQuality !== null
                        ? `${SLEEP_QUALITY_LABELS[sleepQuality]} · ${sleepQuality}/5`
                        : undefined
                    }
                    onEdit={() => handleEdit(index)}
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
            {sorenessQuestion && soreness === 5 ? (
              <Badge
                variant="secondary"
                className="bg-danger/15 text-danger"
              >
                Aviso fisio
              </Badge>
            ) : null}
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
                <CheckCircleIcon className="h-5 w-5 opacity-60" />
                Falta{totalSteps - answeredCount === 1 ? "" : "n"}{" "}
                {totalSteps - answeredCount} respuesta
                {totalSteps - answeredCount === 1 ? "" : "s"}
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
