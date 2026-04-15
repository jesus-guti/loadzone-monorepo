"use client";

import { useActionState } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { createTeam } from "../actions/create-team";

export function CreateTeamForm() {
  const [state, action, isPending] = useActionState(createTeam, {
    success: false,
  });

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clubName">Nombre del club</Label>
        <Input
          id="clubName"
          name="clubName"
          placeholder="Ej: Club Deportivo Villa Real"
          required
          minLength={2}
          maxLength={100}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamName">Nombre del equipo</Label>
        <Input
          id="teamName"
          name="teamName"
          placeholder="Ej: Juvenil A"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamCategory">Categoría (opcional)</Label>
        <Input
          id="teamCategory"
          name="teamCategory"
          placeholder="Ej: Juvenil, Cadete, Senior"
          maxLength={100}
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Crear club y equipo"}
      </Button>
    </form>
  );
}
