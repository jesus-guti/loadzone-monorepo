"use client";

import { Button } from "@repo/design-system/components/ui/button";
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
import { useActionState, useState, useRef, useEffect } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { savePreSession } from "../actions/save-entry";
import { ScaleInput } from "./scale-input";
import {
  BatteryFullIcon,
  BatteryMediumIcon,
  BatteryLowIcon,
  BatteryWarningIcon,
  BatteryIcon,
  MoonIcon,
  CheckCircle2Icon,
} from "lucide-react";
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
  1: <BatteryIcon className="h-4 w-4" />,
  2: <BatteryWarningIcon className="h-4 w-4" />,
  3: <BatteryLowIcon className="h-4 w-4" />,
  4: <BatteryMediumIcon className="h-4 w-4" />,
  5: <BatteryFullIcon className="h-4 w-4" />,
};

function energyColor(value: number): string {
  const colors: Record<number, string> = {
    1: "bg-danger text-danger-foreground",
    2: "bg-premium text-premium-foreground",
    3: "bg-bg-quaternary text-text-primary",
    4: "bg-brand text-brand-foreground",
    5: "bg-brand text-brand-foreground",
  };
  return colors[value] ?? "bg-bg-tertiary text-text-secondary";
}

function sorenessColor(value: number): string {
  const colors: Record<number, string> = {
    1: "bg-brand text-brand-foreground",
    2: "bg-brand text-brand-foreground",
    3: "bg-bg-quaternary text-text-primary",
    4: "bg-premium text-premium-foreground",
    5: "bg-danger text-danger-foreground",
  };
  return colors[value] ?? "bg-bg-tertiary text-text-secondary";
}

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
  const [sleepHours, setSleepHours] = useState<string>("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [showPhysioAlert, setShowPhysioAlert] = useState(false);
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

  useEffect(() => {
    if (state.success) {
      if (state.physioAlert) {
        toast.info("Se programará una sesión de fisioterapia.");
      } else {
        toast.success("Pre-sesión guardada correctamente.");
      }
      onComplete();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  const isValid =
    (!recoveryQuestion || recovery !== null) &&
    (!energyQuestion || energy !== null) &&
    (!sorenessQuestion || soreness !== null) &&
    (!sleepHoursQuestion || sleepHours !== "") &&
    (!sleepQualityQuestion || sleepQuality !== null);

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

  return (
    <>
      <form ref={formRef} action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="templateId" value={template?.id ?? ""} />
        <input
          type="hidden"
          name="teamSessionId"
          value={teamSessionId ?? ""}
        />

        {recoveryQuestion ? (
          <ScaleInput
            name={recoveryQuestion.key}
            label={recoveryQuestion.label}
            min={recoveryQuestion.minValue ?? 0}
            max={recoveryQuestion.maxValue ?? 10}
            value={recovery}
            onChange={setRecovery}
          />
        ) : null}

        {energyQuestion ? (
          <ScaleInput
            name={energyQuestion.key}
            label={energyQuestion.label}
            min={energyQuestion.minValue ?? 1}
            max={energyQuestion.maxValue ?? 5}
            value={energy}
            onChange={setEnergy}
            renderLabel={(n) => (
              <span className="flex items-center gap-1">
                {ENERGY_ICONS[n]} {n}
              </span>
            )}
            getColor={(v) => energyColor(v)}
          />
        ) : null}

        {sorenessQuestion ? (
          <ScaleInput
            name={sorenessQuestion.key}
            label={sorenessQuestion.label}
            min={sorenessQuestion.minValue ?? 1}
            max={sorenessQuestion.maxValue ?? 5}
            value={soreness}
            onChange={setSoreness}
            getColor={(v) => sorenessColor(v)}
          />
        ) : null}

        {sleepHoursQuestion ? (
          <div className="space-y-3 rounded-3xl bg-bg-secondary p-4">
            <label
              htmlFor={sleepHoursQuestion.key}
              className="text-sm font-medium text-text-primary"
            >
              {sleepHoursQuestion.label}
            </label>
            <div className="flex items-center gap-3 rounded-[1.25rem] bg-bg-primary px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-bg-tertiary">
                <MoonIcon className="h-4 w-4 text-text-secondary" />
              </div>
              <input
                id={sleepHoursQuestion.key}
                name={sleepHoursQuestion.key}
                type="number"
                step={String(sleepHoursQuestion.step ?? 0.5)}
                min={String(sleepHoursQuestion.minValue ?? 0)}
                max={String(sleepHoursQuestion.maxValue ?? 24)}
                placeholder="7.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="h-12 w-full bg-transparent text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {sleepQualityQuestion ? (
          <ScaleInput
            name={sleepQualityQuestion.key}
            label={sleepQualityQuestion.label}
            min={sleepQualityQuestion.minValue ?? 1}
            max={sleepQualityQuestion.maxValue ?? 5}
            value={sleepQuality}
            onChange={setSleepQuality}
            renderLabel={(n) => (
              <span className="flex items-center gap-1">
                <MoonIcon className="h-3 w-3" /> {n}
              </span>
            )}
            getColor={(v) => energyColor(v)}
          />
        ) : null}

        {!template ? (
          <p className="text-sm text-danger">
            No hay formulario pre-sesión configurado para este equipo.
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!template || !isValid || isPending}
          className="h-14 w-full rounded-full text-lg font-semibold"
          size="lg"
        >
          {isPending ? (
            "Guardando..."
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5" />
              Guardar Pre-Sesión
            </span>
          )}
        </Button>
      </form>

      <AlertDialog open={showPhysioAlert} onOpenChange={setShowPhysioAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alerta de fisioterapia</AlertDialogTitle>
            <AlertDialogDescription>
              Has indicado el nivel máximo de agujetas. Se programará una sesión
              de fisioterapia antes del entrenamiento. ¿Deseas continuar?
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
