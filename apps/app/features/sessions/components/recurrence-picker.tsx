"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { Switch } from "@repo/design-system/components/ui/switch";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useState } from "react";
import { FieldLabel } from "./form-section";

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

      <label
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
          enabled
            ? "border-brand/30 bg-brand/5"
            : "border-border-secondary hover:bg-bg-secondary/50"
        )}
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">Repetir sesión</p>
          {!enabled ? (
            <p className="text-xs text-text-secondary">
              No se repetirá. Activa para crear una serie semanal.
            </p>
          ) : (
            <p className="text-xs font-medium text-brand">
              {expectedCount > 0 && until
                ? `Se crearán ~${expectedCount} sesiones hasta el ${new Date(until).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
                : "Configura los días y la fecha de fin"}
            </p>
          )}
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>

      {enabled ? (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-5 rounded-lg border border-border-secondary bg-bg-secondary/20 p-4">
          <div className="space-y-3">
            <FieldLabel>Días de la semana</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = byday.includes(day.id);
                return (
                  <button
                    aria-label={day.label}
                    aria-pressed={active}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all",
                      active
                        ? "border-brand bg-brand text-brand-foreground shadow-sm"
                        : "border-border-secondary bg-bg-primary text-text-secondary hover:border-border-tertiary hover:bg-bg-tertiary"
                    )}
                    key={day.id}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDay(day.id);
                    }}
                    type="button"
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel htmlFor="recurrence-until">Repetir hasta</FieldLabel>
            <Input
              className="w-full sm:max-w-[200px]"
              id="recurrence-until"
              onChange={(event) => setUntil(event.target.value)}
              type="date"
              value={until}
            />
          </div>
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
