"use client";

import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect, useState } from "react";
import {
  reopenInjury,
  type InjuryActionResult,
} from "../actions/injury-actions";
import type { InjuryListItem } from "../types";
import { CloseInjuryDialog } from "./close-injury-dialog";
import { InjuryLogForm } from "./injury-log-form";

type PanelMode =
  | { kind: "profile" }
  | { kind: "create" }
  | { kind: "edit"; injury: InjuryListItem };

type PlayerInjuriesPanelProperties = {
  readonly playerId: string;
  readonly todayCivil: string;
  readonly openInjuries: readonly InjuryListItem[];
  readonly closedInjuries: readonly InjuryListItem[];
};

const emptyResult: InjuryActionResult = { success: false };

function InjuryMeta({ injury }: { readonly injury: InjuryListItem }) {
  const labels = injury.regionLabels.join(", ");
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-text-primary">
        {labels || "Sin zona"}
      </p>
      <p className="truncate text-xs text-text-secondary">
        {injury.startDate}
        {injury.endDate ? ` → ${injury.endDate}` : ""} · {injury.cause}
        {injury.regionDetail ? ` · ${injury.regionDetail}` : ""}
      </p>
    </div>
  );
}

function ReopenButton({ injuryId }: { readonly injuryId: string }) {
  const [state, formAction, pending] = useActionState(
    reopenInjury,
    emptyResult
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Lesión reabierta");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="injuryId" value={injuryId} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Reabriendo…" : "Reabrir"}
      </Button>
    </form>
  );
}

export function PlayerInjuriesPanel({
  playerId,
  todayCivil,
  openInjuries,
  closedInjuries,
}: PlayerInjuriesPanelProperties) {
  const [mode, setMode] = useState<PanelMode>({ kind: "profile" });
  const [closing, setClosing] = useState<InjuryListItem | null>(null);

  if (mode.kind === "create" || mode.kind === "edit") {
    return (
      <InjuryLogForm
        playerId={playerId}
        todayCivil={todayCivil}
        mode={mode.kind}
        initial={mode.kind === "edit" ? mode.injury : null}
        onCancel={() => setMode({ kind: "profile" })}
        onSuccess={() => setMode({ kind: "profile" })}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Lesiones
        </h2>
        <Button type="button" onClick={() => setMode({ kind: "create" })}>
          Registrar lesión
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Lesiones abiertas
        </h3>
        {openInjuries.length === 0 ? (
          <p className="px-1 text-sm text-text-tertiary">
            Sin lesiones abiertas
          </p>
        ) : (
          <ul className="divide-y divide-border-secondary border-t border-border-secondary">
            {openInjuries.map((injury) => (
              <li
                key={injury.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <InjuryMeta injury={injury} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setMode({ kind: "edit", injury })
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setClosing(injury)}
                  >
                    Dar de alta
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Cerradas
        </h3>
        {closedInjuries.length === 0 ? (
          <p className="px-1 text-sm text-text-tertiary">
            Sin lesiones cerradas
          </p>
        ) : (
          <ul className="divide-y divide-border-secondary border-t border-border-secondary">
            {closedInjuries.map((injury) => (
              <li
                key={injury.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <InjuryMeta injury={injury} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setMode({ kind: "edit", injury })
                    }
                  >
                    Editar
                  </Button>
                  <ReopenButton injuryId={injury.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CloseInjuryDialog
        injury={closing}
        todayCivil={todayCivil}
        open={closing !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setClosing(null);
          }
        }}
      />
    </section>
  );
}
