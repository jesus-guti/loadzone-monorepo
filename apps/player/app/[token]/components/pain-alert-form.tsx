"use client";

import { HeartbeatIcon } from "@phosphor-icons/react/Heartbeat";
import { Button } from "@repo/design-system/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/select";
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect } from "react";
import { savePainAlert } from "../actions/save-pain-alert";

type PainAlertFormProperties = {
  readonly token: string;
  readonly onSuccess?: () => void;
};

const SEVERITY_OPTIONS = [
  { value: "UNKNOWN", label: "No lo sé" },
  { value: "MINOR", label: "Leve" },
  { value: "MODERATE", label: "Moderada" },
  { value: "MAJOR", label: "Alta" },
] as const;

export function PainAlertForm({ token, onSuccess }: PainAlertFormProperties) {
  const [state, action, isPending] = useActionState(savePainAlert, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.careConfirmMessage ?? "Tu equipo ya lo tiene");
      onSuccess?.();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4 pt-2">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          ¿Qué te ocurre?
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Molestia en isquio derecho"
          className="h-12 w-full rounded-2xl bg-bg-secondary px-4 text-base text-text-primary outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="bodyPart"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Zona
        </label>
        <input
          id="bodyPart"
          name="bodyPart"
          placeholder="Isquio, tobillo, espalda..."
          className="h-12 w-full rounded-2xl bg-bg-secondary px-4 text-base text-text-primary outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="severity"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Severidad
        </label>
        <Select
          defaultValue="UNKNOWN"
          items={SEVERITY_OPTIONS}
          name="severity"
        >
          <SelectTrigger
            className="h-12 w-full rounded-2xl border-0 bg-bg-secondary px-4 text-base"
            id="severity"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Detalles (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Cuándo empezó, cómo te limita o cualquier detalle útil."
          className="w-full rounded-2xl bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full text-base font-bold"
        size="lg"
      >
        {isPending ? (
          "Enviando..."
        ) : (
          <span className="flex items-center gap-2">
            <HeartbeatIcon className="h-5 w-5" />
            Enviar aviso
          </span>
        )}
      </Button>
    </form>
  );
}
