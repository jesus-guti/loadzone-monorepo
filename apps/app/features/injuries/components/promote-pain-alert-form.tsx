"use client";

import { useActionState, useEffect } from "react";
import { toast } from "@repo/design-system/components/sonner";
import { bodyRegionCatalog } from "@repo/database/body-region-catalog";
import { promotePainAlert } from "../actions/injury-actions";

type PromotePainAlertFormProperties = {
  readonly painAlertId: string;
  readonly bodyPartHint: string | null;
};

export function PromotePainAlertForm({
  painAlertId,
  bodyPartHint,
}: PromotePainAlertFormProperties) {
  const [state, action, isPending] = useActionState(promotePainAlert, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Aviso promovido a lesión oficial");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-3 border-t border-border-secondary pt-3">
      <input type="hidden" name="painAlertId" value={painAlertId} />
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">
          Promover a lesión
        </p>
        <p className="text-xs text-text-secondary">
          Prefill: causa y severidad del aviso. Elige ≥1 zona del catálogo
          {bodyPartHint ? ` (pista jugador: ${bodyPartHint})` : ""}.
        </p>
      </div>
      <fieldset className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border-secondary p-2">
        <legend className="sr-only">Zonas corporales</legend>
        {bodyRegionCatalog.regions.map((region) => (
          <label
            key={region.id}
            className="flex items-center gap-2 text-xs text-text-primary"
          >
            <input
              type="checkbox"
              name="regionIds"
              value={region.id}
              className="size-3.5 accent-brand"
            />
            {region.labelEs}
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground disabled:opacity-60"
      >
        {isPending ? "Promoviendo..." : "Promover a lesión"}
      </button>
    </form>
  );
}
