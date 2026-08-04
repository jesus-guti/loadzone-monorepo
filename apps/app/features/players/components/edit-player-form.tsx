"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/select";
import { toast } from "@repo/design-system/components/sonner";
import type { AgeBand, PlayerStatus } from "@repo/database";
import type { PlayerReminderConsentState } from "@repo/database/reminder-consent";
import { useActionState, useEffect } from "react";
import { updatePlayer } from "../actions/player-actions";

type EditPlayerFormProperties = {
  readonly player: {
    id: string;
    name: string;
    status: PlayerStatus;
    dateOfBirth: string | null;
    ageBandOverride: AgeBand | null;
    reminderConsentState: PlayerReminderConsentState;
    resolvedAgeBand: AgeBand | "UNASSIGNED";
  };
  readonly hasOpenInjury: boolean;
};

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "MODIFIED_TRAINING", label: "Entrenamiento modificado" },
  { value: "INJURED", label: "Lesionado" },
  { value: "ILL", label: "Enfermo" },
  { value: "UNAVAILABLE", label: "No disponible" },
] as const;

const CONSENT_STATE_LABEL: Record<PlayerReminderConsentState, string> = {
  ELIGIBLE: "Elegible",
  OPTED_IN: "Con suscripción / opt-in",
  OPTED_OUT: "Opt-out del jugador",
  GUARDIAN_BLOCKED: "Revocado (supervisión)",
  ASSISTED_GUARDIAN_GRANTED: "Tutor consintió (asistida)",
};

export function EditPlayerForm({
  player,
  hasOpenInjury,
}: EditPlayerFormProperties) {
  const [state, action, isPending] = useActionState(updatePlayer, {
    success: false,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={player.id} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={player.name}
          placeholder="Ej: Carlos García"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        {hasOpenInjury ? (
          <>
            <input type="hidden" name="status" value="INJURED" />
            <Select disabled defaultValue="INJURED">
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INJURED">Lesionado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-text-secondary">
              El estado se deriva de las lesiones abiertas. Cierra o da de alta
              la lesión para poder cambiarlo.
            </p>
          </>
        ) : (
          <Select name="status" defaultValue={player.status}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={player.dateOfBirth ?? ""}
        />
        <p className="text-xs text-text-secondary">
          Opcional. Sin fecha ni tramo manual, el jugador queda sin asignar.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageBandOverride">Tramo de edad (manual)</Label>
        <select
          id="ageBandOverride"
          name="ageBandOverride"
          defaultValue={player.ageBandOverride ?? "NONE"}
          className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
        >
          <option value="NONE">Automático (por fecha)</option>
          <option value="ASSISTED">Asistida</option>
          <option value="GUIDED">Guiada</option>
          <option value="INDEPENDENT">Independiente</option>
        </select>
      </div>

      <div className="space-y-2 border-t border-border-secondary pt-4">
        <Label htmlFor="reminderConsentAction">
          Consentimiento de recordatorios
        </Label>
        <p className="text-xs text-text-secondary">
          Estado actual: {CONSENT_STATE_LABEL[player.reminderConsentState]}
          {player.resolvedAgeBand !== "UNASSIGNED"
            ? ` · tramo ${player.resolvedAgeBand.toLowerCase()}`
            : " · sin tramo"}
          . La suscripción push es solo transporte.
        </p>
        <select
          id="reminderConsentAction"
          name="reminderConsentAction"
          defaultValue="LEAVE"
          className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
        >
          <option value="LEAVE">Mantener estado actual</option>
          <option value="GRANT_ASSISTED">
            Registrar consentimiento del tutor (asistida)
          </option>
          <option value="REVOKE_SUPERVISION">
            Revocar recordatorios (supervisión) — elimina push
          </option>
          <option value="CLEAR_TO_ELIGIBLE">
            Volver a elegible (quitar bloqueo / grant)
          </option>
        </select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
