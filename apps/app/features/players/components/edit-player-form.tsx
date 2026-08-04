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
import { useActionState, useEffect } from "react";
import { updatePlayer } from "../actions/player-actions";

type EditPlayerFormProperties = {
  readonly player: {
    id: string;
    name: string;
    status: PlayerStatus;
    dateOfBirth: string | null;
    ageBandOverride: AgeBand | null;
  };
};

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "MODIFIED_TRAINING", label: "Entrenamiento modificado" },
  { value: "INJURED", label: "Lesionado" },
  { value: "ILL", label: "Enfermo" },
  { value: "UNAVAILABLE", label: "No disponible" },
] as const;

export function EditPlayerForm({ player }: EditPlayerFormProperties) {
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
        <Select name="status" defaultValue={player.status}>
          <SelectTrigger>
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
