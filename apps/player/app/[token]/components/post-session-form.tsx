"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useActionState, useState, useEffect } from "react";
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

export function PostSessionForm({
  token,
  date,
  teamSessionId,
  template,
  onComplete,
}: PostSessionFormProperties) {
  const [rpe, setRpe] = useState<number | null>(null);
  const [duration, setDuration] = useState<string>("");

  const [state, action, isPending] = useActionState(savePostSession, {
    success: false,
  });

  const questions = template?.questions ?? [];
  const rpeQuestion =
    questions.find((question) => question.mappingKey === "rpe") ?? null;
  const durationQuestion =
    questions.find((question) => question.mappingKey === "duration") ?? null;

  useEffect(() => {
    if (state.success) {
      toast.success("Post-sesión guardada correctamente.");
      onComplete();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  const isValid =
    (!rpeQuestion || rpe !== null) &&
    (!durationQuestion || (duration !== "" && Number(duration) > 0));

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="templateId" value={template?.id ?? ""} />
      <input
        type="hidden"
        name="teamSessionId"
        value={teamSessionId ?? ""}
      />

      {rpeQuestion ? (
        <ScaleInput
          name={rpeQuestion.key}
          label={rpeQuestion.label}
          min={rpeQuestion.minValue ?? 0}
          max={rpeQuestion.maxValue ?? 10}
          value={rpe}
          onChange={setRpe}
          renderLabel={(n) => (
            <span className="flex flex-col items-center text-xs">
              <span className="text-base font-bold">{n}</span>
            </span>
          )}
          getColor={(v) => borgColor(v)}
        />
      ) : null}

      {rpeQuestion && rpe !== null && (
        <p className="text-center text-sm text-text-secondary">
          {BORG_LABELS[rpe]}
        </p>
      )}

      {durationQuestion ? (
        <div className="space-y-3 rounded-3xl bg-bg-secondary p-4">
          <label
            htmlFor={durationQuestion.key}
            className="text-sm font-medium text-text-primary"
          >
            {durationQuestion.label}
          </label>
          <div className="flex items-center gap-3 rounded-[1.25rem] bg-bg-primary px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-bg-tertiary">
              <TimerIcon className="h-4 w-4 text-text-secondary" />
            </div>
            <input
              id={durationQuestion.key}
              name={durationQuestion.key}
              type="number"
              min={String(durationQuestion.minValue ?? 1)}
              max={String(durationQuestion.maxValue ?? 600)}
              placeholder="90"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-12 w-full bg-transparent text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      {!template ? (
        <p className="text-sm text-danger">
          No hay formulario post-sesión configurado para este equipo.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!template || !isValid || isPending}
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
