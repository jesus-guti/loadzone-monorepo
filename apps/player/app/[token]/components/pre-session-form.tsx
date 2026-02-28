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
    1: "bg-red-500 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-yellow-500 text-white",
    4: "bg-lime-500 text-white",
    5: "bg-green-500 text-white",
  };
  return colors[value] ?? "bg-muted text-muted-foreground";
}

function sorenessColor(value: number): string {
  const colors: Record<number, string> = {
    1: "bg-green-500 text-white",
    2: "bg-lime-500 text-white",
    3: "bg-yellow-500 text-white",
    4: "bg-orange-500 text-white",
    5: "bg-red-500 text-white",
  };
  return colors[value] ?? "bg-muted text-muted-foreground";
}

export function PreSessionForm({
  token,
  date,
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
    recovery !== null &&
    energy !== null &&
    soreness !== null &&
    sleepHours !== "" &&
    sleepQuality !== null;

  function handleSubmit() {
    if (soreness === 5) {
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
      <form ref={formRef} action={action} className="space-y-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="date" value={date} />

        <ScaleInput
          name="recovery"
          label="Recuperación (TQR)"
          min={0}
          max={10}
          value={recovery}
          onChange={setRecovery}
        />

        <ScaleInput
          name="energy"
          label="Nivel de energía"
          min={1}
          max={5}
          value={energy}
          onChange={setEnergy}
          renderLabel={(n) => (
            <span className="flex items-center gap-1">
              {ENERGY_ICONS[n]} {n}
            </span>
          )}
          getColor={(v) => energyColor(v)}
        />

        <ScaleInput
          name="soreness"
          label="Agujetas / Dolor muscular"
          min={1}
          max={5}
          value={soreness}
          onChange={setSoreness}
          getColor={(v) => sorenessColor(v)}
        />

        <div className="space-y-2">
          <label
            htmlFor="sleepHours"
            className="text-sm font-medium text-foreground"
          >
            Horas de sueño
          </label>
          <div className="flex items-center gap-2">
            <MoonIcon className="h-4 w-4 text-muted-foreground" />
            <input
              id="sleepHours"
              name="sleepHours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="7.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <ScaleInput
          name="sleepQuality"
          label="Calidad del sueño"
          min={1}
          max={5}
          value={sleepQuality}
          onChange={setSleepQuality}
          renderLabel={(n) => (
            <span className="flex items-center gap-1">
              <MoonIcon className="h-3 w-3" /> {n}
            </span>
          )}
          getColor={(v) => energyColor(v)}
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isPending}
          className="h-14 w-full rounded-2xl text-lg font-semibold"
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
