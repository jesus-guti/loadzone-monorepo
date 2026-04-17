"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { Switch } from "@repo/design-system/components/ui/switch";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useState } from "react";
import { FieldLabel } from "../../components/form-section";

const WEEKDAYS = [
  { id: "MO", short: "L", label: "Lunes" },
  { id: "TU", short: "M", label: "Martes" },
  { id: "WE", short: "X", label: "Miércoles" },
  { id: "TH", short: "J", label: "Jueves" },
  { id: "FR", short: "V", label: "Viernes" },
  { id: "SA", short: "S", label: "Sábado" },
  { id: "SU", short: "D", label: "Domingo" },
] as const;

type WeekdayId = (typeof WEEKDAYS)[number]["id"];

type RecurrencePickerProps = {
  readonly startsAt: string;
};

export function RecurrencePicker({
  startsAt,
}: RecurrencePickerProps) {
  const [enabled, setEnabled] = useState(false);
  const [byday, setByday] = useState<WeekdayId[]>([]);
  const [until, setUntil] = useState("");

  useEffect(() => {
    if (!enabled) {
      setByday([]);
      setUntil("");
    } else if (startsAt) {
      const start = new Date(startsAt);
      if (!Number.isNaN(start.getTime())) {
        const dayIndex = (start.getDay() + 6) % 7;
        const initialDay = WEEKDAYS[dayIndex]?.id;
        if (initialDay) {
          setByday([initialDay]);
        }
        const defaultUntil = new Date(start);
        defaultUntil.setDate(defaultUntil.getDate() + 7 * 8);
        setUntil(formatYmd(defaultUntil));
      }
    }
  }, [enabled, startsAt]);

  function toggleDay(id: WeekdayId): void {
    setByday((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );
  }

  const recurrenceValue =
    enabled && byday.length > 0 && until
      ? JSON.stringify({ byday, until })
      : "";

  const expectedCount =
    enabled && startsAt && until && byday.length > 0
      ? estimateInstances(startsAt, byday, until)
      : 0;

  return (
    <div className="space-y-4">
      <input name="recurrence" type="hidden" value={recurrenceValue} />

      <label className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Repetir sesión</p>
          <p className="text-xs text-text-secondary">
            Crea una serie semanal con los días seleccionados.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>

      {enabled ? (
        <div className="space-y-4 rounded-md border border-border-secondary bg-bg-secondary/40 p-4">
          <div className="space-y-2">
            <FieldLabel>Días de la semana</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = byday.includes(day.id);
                return (
                  <button
                    aria-label={day.label}
                    aria-pressed={active}
                    className={cn(
                      "size-9 rounded-md border text-sm font-medium transition-colors",
                      active
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border-secondary bg-bg-primary text-text-secondary hover:bg-bg-tertiary"
                    )}
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    type="button"
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="recurrence-until">Repetir hasta</FieldLabel>
            <Input
              id="recurrence-until"
              onChange={(event) => setUntil(event.target.value)}
              type="date"
              value={until}
            />
          </div>

          <p className="text-xs text-text-secondary">
            {expectedCount > 0
              ? `Se crearán ~${expectedCount} sesiones (máximo 60).`
              : "Selecciona días y una fecha de fin para previsualizar."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function formatYmd(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAY_TO_INDEX: Record<WeekdayId, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
};

function estimateInstances(
  startsAt: string,
  byday: WeekdayId[],
  until: string
): number {
  const start = new Date(startsAt);
  const end = new Date(until);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  end.setHours(23, 59, 59, 999);
  const targets = new Set(byday.map((d) => WEEKDAY_TO_INDEX[d]));
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= end.getTime() && count < 60) {
    if (targets.has(cursor.getDay())) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
