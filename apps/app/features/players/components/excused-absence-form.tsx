"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect, useState } from "react";
import {
  markExcusedAbsence,
  unmarkExcusedAbsence,
} from "../actions/excuse-absence";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

type ExcusedAbsenceFormProperties = {
  readonly playerId: string;
  readonly excusedDates: readonly string[];
};

export function ExcusedAbsenceForm({
  playerId,
  excusedDates,
}: ExcusedAbsenceFormProperties) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayIso);
  const [reason, setReason] = useState("");

  const [markState, markAction, markPending] = useActionState(
    markExcusedAbsence,
    { success: false }
  );
  const [unmarkState, unmarkAction, unmarkPending] = useActionState(
    unmarkExcusedAbsence,
    { success: false }
  );

  useEffect(() => {
    if (markState.success) {
      toast.success("Ausencia justificada marcada");
      setReason("");
    }
    if (markState.error) {
      toast.error(markState.error);
    }
  }, [markState]);

  useEffect(() => {
    if (unmarkState.success) {
      toast.success("Ausencia justificada eliminada");
    }
    if (unmarkState.error) {
      toast.error(unmarkState.error);
    }
  }, [unmarkState]);

  const isExcused = excusedDates.includes(date);

  return (
    <div className="space-y-3">
      <form action={isExcused ? unmarkAction : markAction} className="space-y-3">
        <input type="hidden" name="playerId" value={playerId} />
        <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="excuse-date">Fecha</Label>
            <Input
              id="excuse-date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          {!isExcused ? (
            <div className="space-y-1.5">
              <Label htmlFor="excuse-reason">Motivo (opcional)</Label>
              <Input
                id="excuse-reason"
                name="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Viaje, enfermedad…"
                maxLength={200}
              />
            </div>
          ) : (
            <p className="text-sm text-text-secondary sm:pb-2">
              Esta fecha ya está justificada.
            </p>
          )}
          <Button
            type="submit"
            variant={isExcused ? "secondary" : "default"}
            disabled={markPending || unmarkPending}
            className="min-h-10"
          >
            {isExcused
              ? unmarkPending
                ? "Quitando…"
                : "Quitar justificación"
              : markPending
                ? "Marcando…"
                : "Marcar justificada"}
          </Button>
        </div>
      </form>
      {excusedDates.length > 0 ? (
        <p className="text-sm text-text-secondary">
          Fechas ya justificadas:{" "}
          {excusedDates.map((excusedDate) => formatDate(excusedDate)).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
