"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useActionState, useState, useRef, useEffect } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { savePostSession } from "../actions/save-entry";
import { ScaleInput } from "./scale-input";
import { CheckCircle2Icon, TimerIcon } from "lucide-react";

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
  if (value <= 2) return "bg-brand text-brand-foreground";
  if (value <= 4) return "bg-brand text-brand-foreground";
  if (value <= 6) return "bg-bg-quaternary text-text-primary";
  if (value <= 8) return "bg-premium text-premium-foreground";
  return "bg-danger text-danger-foreground";
}

type PostSessionFormProperties = {
  readonly token: string;
  readonly date: string;
  readonly onComplete: () => void;
};

export function PostSessionForm({
  token,
  date,
  onComplete,
}: PostSessionFormProperties) {
  const [rpe, setRpe] = useState<number | null>(null);
  const [duration, setDuration] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(savePostSession, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Post-sesión guardada correctamente.");
      onComplete();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  const isValid = rpe !== null && duration !== "" && Number(duration) > 0;

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="date" value={date} />

      <ScaleInput
        name="rpe"
        label="Esfuerzo percibido (RPE - Borg)"
        min={0}
        max={10}
        value={rpe}
        onChange={setRpe}
        renderLabel={(n) => (
          <span className="flex flex-col items-center text-xs">
            <span className="text-base font-bold">{n}</span>
          </span>
        )}
        getColor={(v) => borgColor(v)}
      />

      {rpe !== null && (
        <p className="text-center text-sm text-text-secondary">
          {BORG_LABELS[rpe]}
        </p>
      )}

      <div className="space-y-3 rounded-3xl bg-bg-secondary p-4">
        <label
          htmlFor="duration"
          className="text-sm font-medium text-text-primary"
        >
          Duración de la sesión (minutos)
        </label>
        <div className="flex items-center gap-3 rounded-[1.25rem] bg-bg-primary px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-bg-tertiary">
            <TimerIcon className="h-4 w-4 text-text-secondary" />
          </div>
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            max="600"
            placeholder="90"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="h-12 w-full bg-transparent text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isPending}
        className="h-14 w-full rounded-full text-lg font-semibold"
        size="lg"
      >
        {isPending ? (
          "Guardando..."
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle2Icon className="h-5 w-5" />
            Guardar Post-Sesión
          </span>
        )}
      </Button>
    </form>
  );
}
