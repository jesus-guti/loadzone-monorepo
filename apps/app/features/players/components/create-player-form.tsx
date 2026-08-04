"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect } from "react";
import { createPlayer } from "../actions/player-actions";

export function CreatePlayerForm() {
  const [state, action, isPending] = useActionState(createPlayer, {
    success: false,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del jugador</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: Carlos García"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
        <Input id="dateOfBirth" name="dateOfBirth" type="date" />
        <p className="text-xs text-text-secondary">
          Opcional. Sin fecha ni tramo manual, el jugador queda sin asignar (sin
          supervisión parental).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageBandOverride">Tramo de edad (manual)</Label>
        <select
          id="ageBandOverride"
          name="ageBandOverride"
          defaultValue="NONE"
          className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
        >
          <option value="NONE">Automático (por fecha)</option>
          <option value="ASSISTED">Asistida</option>
          <option value="GUIDED">Guiada</option>
          <option value="INDEPENDENT">Independiente</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando..." : "Crear jugador"}
      </Button>
    </form>
  );
}
