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
  if (value <= 2) return "bg-green-500 text-white";
  if (value <= 4) return "bg-lime-500 text-white";
  if (value <= 6) return "bg-yellow-500 text-white";
  if (value <= 8) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
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
    <form ref={formRef} action={action} className="space-y-6">
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
        <p className="text-center text-sm text-muted-foreground">
          {BORG_LABELS[rpe]}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="duration"
          className="text-sm font-medium text-foreground"
        >
          Duración de la sesión (minutos)
        </label>
        <div className="flex items-center gap-2">
          <TimerIcon className="h-4 w-4 text-muted-foreground" />
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            max="600"
            placeholder="90"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isPending}
        className="h-14 w-full rounded-2xl text-lg font-semibold"
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
