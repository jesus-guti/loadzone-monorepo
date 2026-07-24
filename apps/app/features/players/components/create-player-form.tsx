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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando..." : "Crear jugador"}
      </Button>
    </form>
  );
}
