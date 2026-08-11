"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { useActionState, useEffect } from "react";
import { toast } from "@repo/design-system/components/sonner";
import { DatePicker } from "@/components/date-picker";
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
        <DatePicker id="startDate" name="startDate" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Fecha de fin</Label>
        <DatePicker id="endDate" name="endDate" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preSeasonEnd">Fin de pre-temporada (opcional)</Label>
        <DatePicker id="preSeasonEnd" name="preSeasonEnd" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando..." : "Crear temporada"}
      </Button>
    </form>
  );
}
