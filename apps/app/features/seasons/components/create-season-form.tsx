"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { useActionState, useEffect } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import { createSeason } from "../actions/season-actions";

export function CreateSeasonForm() {
  const [state, action, isPending] = useActionState(createSeason, {
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
        <Label htmlFor="name">Nombre de la temporada</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: 2025/2026"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Fecha de inicio</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Fecha de fin</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preSeasonEnd">Fin de pre-temporada (opcional)</Label>
        <Input id="preSeasonEnd" name="preSeasonEnd" type="date" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando..." : "Crear temporada"}
      </Button>
    </form>
  );
}
