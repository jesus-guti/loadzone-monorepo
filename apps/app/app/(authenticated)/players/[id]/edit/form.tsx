"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { toast } from "@repo/design-system/components/ui/sonner";
import type { PlayerStatus } from "@repo/database";
import { useActionState, useEffect } from "react";
import { updatePlayer } from "../../actions/player-actions";

type EditPlayerFormProperties = {
  readonly player: {
    id: string;
    name: string;
    status: PlayerStatus;
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
