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
import { PLAYING_POSITION_STAFF_LABEL } from "@repo/database/playing-position";
import { useActionState, useEffect } from "react";
import { DatePicker } from "@/components/date-picker";
import { createPlayer } from "../actions/player-actions";

const AGE_BAND_OPTIONS = [
  { value: "NONE", label: "Automático (por fecha)" },
  { value: "ASSISTED", label: "Asistida" },
  { value: "GUIDED", label: "Guiada" },
  { value: "INDEPENDENT", label: "Independiente" },
] as const;

const PLAYING_POSITION_OPTIONS = [
  { value: "NONE", label: "Sin posición" },
  { value: "POR", label: PLAYING_POSITION_STAFF_LABEL.POR },
  { value: "DEF", label: PLAYING_POSITION_STAFF_LABEL.DEF },
  { value: "MED", label: PLAYING_POSITION_STAFF_LABEL.MED },
  { value: "DEL", label: PLAYING_POSITION_STAFF_LABEL.DEL },
] as const;

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
        <DatePicker
          id="dateOfBirth"
          max={new Date().toISOString().slice(0, 10)}
          name="dateOfBirth"
        />
        <p className="text-xs text-text-secondary">
          Opcional. Sin fecha ni tramo manual, el jugador queda sin asignar (sin
          supervisión parental).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageBandOverride">Tramo de edad (manual)</Label>
        <Select
          defaultValue="NONE"
          items={AGE_BAND_OPTIONS}
          name="ageBandOverride"
        >
          <SelectTrigger className="w-full" id="ageBandOverride">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGE_BAND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="playingPosition">Posición de juego</Label>
        <Select
          defaultValue="NONE"
          items={PLAYING_POSITION_OPTIONS}
          name="playingPosition"
        >
          <SelectTrigger className="w-full" id="playingPosition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAYING_POSITION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-text-secondary">
          Opcional. Línea gruesa (POR / DEF / MED / DEL) para el cromo de racha.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shirtNumber">Dorsal</Label>
        <Input
          id="shirtNumber"
          inputMode="numeric"
          max={99}
          min={1}
          name="shirtNumber"
          placeholder="Ej: 10"
          type="number"
        />
        <p className="text-xs text-text-secondary">
          Opcional. Vacío no muestra el sello en el cromo de racha.
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando..." : "Crear jugador"}
      </Button>
    </form>
  );
}
