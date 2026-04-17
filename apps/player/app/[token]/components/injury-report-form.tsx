"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useActionState, useEffect } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { saveInjuryReport } from "../actions/save-injury";
import { HeartPulseIcon } from "lucide-react";

type InjuryReportFormProperties = {
  readonly token: string;
};

export function InjuryReportForm({ token }: InjuryReportFormProperties) {
  const [state, action, isPending] = useActionState(saveInjuryReport, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Lesión reportada");
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

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
        <select
          id="severity"
          name="severity"
          defaultValue="UNKNOWN"
          className="h-12 w-full rounded-2xl bg-bg-secondary px-4 text-base text-text-primary outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="UNKNOWN">No lo sé</option>
          <option value="MINOR">Leve</option>
          <option value="MODERATE">Moderada</option>
          <option value="MAJOR">Alta</option>
        </select>
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
            <HeartPulseIcon className="h-5 w-5" />
            Enviar aviso
          </span>
        )}
      </Button>
    </form>
  );
}
