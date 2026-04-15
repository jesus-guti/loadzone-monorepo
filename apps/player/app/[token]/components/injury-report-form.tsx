"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useActionState, useEffect } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { saveInjuryReport } from "../actions/save-injury";

type InjuryReportFormProperties = {
  readonly token: string;
};

export function InjuryReportForm({ token }: InjuryReportFormProperties) {
  const [state, action, isPending] = useActionState(saveInjuryReport, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Lesión reportada correctamente.");
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4 rounded-3xl bg-bg-secondary p-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-text-primary">
          ¿Qué te ocurre?
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Molestia en isquio derecho"
          className="h-11 w-full rounded-xl bg-bg-primary px-3 text-sm text-text-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bodyPart"
          className="text-sm font-medium text-text-primary"
        >
          Zona
        </label>
        <input
          id="bodyPart"
          name="bodyPart"
          placeholder="Isquio, tobillo, espalda..."
          className="h-11 w-full rounded-xl bg-bg-primary px-3 text-sm text-text-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="severity"
          className="text-sm font-medium text-text-primary"
        >
          Severidad
        </label>
        <select
          id="severity"
          name="severity"
          defaultValue="UNKNOWN"
          className="h-11 w-full rounded-xl bg-bg-primary px-3 text-sm text-text-primary outline-none"
        >
          <option value="UNKNOWN">No lo sé</option>
          <option value="MINOR">Leve</option>
          <option value="MODERATE">Moderada</option>
          <option value="MAJOR">Alta</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-text-primary"
        >
          Detalles
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Cuándo empezó, cómo te limita o cualquier detalle útil."
          className="w-full rounded-xl bg-bg-primary px-3 py-3 text-sm text-text-primary outline-none"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando..." : "Reportar lesión"}
      </Button>
    </form>
  );
}
