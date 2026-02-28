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
        <Label htmlFor="name">Nombre del equipo</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: CD Villa Real"
          required
          minLength={2}
          maxLength={100}
          autoFocus
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Crear equipo"}
      </Button>
    </form>
  );
}
