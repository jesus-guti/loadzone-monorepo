"use client";

import { Button } from "@repo/design-system/components/button";
import { Label } from "@repo/design-system/components/label";
import { cn } from "@repo/design-system/lib/utils";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import type { ReactElement } from "react";
import { toast } from "@repo/design-system/components/sonner";
import { DatePicker } from "@/components/date-picker";
import { createSeason, createSeasonFromShell } from "../actions/season-actions";
import {
  addWeeksToCivilDate,
  canShiftOfficialEnd,
  canShiftPreseasonEnd,
  currentStartYear,
  cycleMonthSpan,
  defaultSeasonCycle,
  officialStartDate,
  roundedWeeks,
  seasonCycleLabel,
  seasonPersistedName,
  seasonRangeError,
  startYearOptions,
  type SeasonCycleDates,
} from "../lib/season-cycle";

type ConfigureSeasonFormProps = {
  readonly variant: "dialog" | "page";
  readonly onCancel?: () => void;
};

function DurationControl({
  label,
  weeks,
  onShift,
  canMinus,
  canPlus,
}: {
  readonly label: string;
  readonly weeks: number | undefined;
  readonly onShift: (weeks: number) => void;
  readonly canMinus: boolean;
  readonly canPlus: boolean;
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          disabled={!canMinus}
          onClick={() => onShift(-1)}
          size="xs"
          type="button"
          variant="outline"
        >
          −1 sem
        </Button>
        <span className="min-w-16 px-1 text-center tabular-nums text-text-primary">
          {weeks === undefined ? "—" : `${weeks} semanas`}
        </span>
        <Button
          disabled={!canPlus}
          onClick={() => onShift(1)}
          size="xs"
          type="button"
          variant="outline"
        >
          +1 sem
        </Button>
      </div>
    </div>
  );
}

export function ConfigureSeasonForm({
  variant,
  onCancel,
}: ConfigureSeasonFormProps): ReactElement {
  const [cycle, setCycle] = useState<SeasonCycleDates>(() =>
    defaultSeasonCycle(currentStartYear())
  );
  const [isPendingShell, startTransition] = useTransition();
  const [pageState, pageAction, isPendingPage] = useActionState(createSeason, {
    success: false,
  });

  useEffect(() => {
    if (pageState.error) {
      toast.error(pageState.error);
    }
  }, [pageState]);

  const officialStart = officialStartDate(cycle.preSeasonEnd) ?? "";
  const rangeError = seasonRangeError(cycle);
  const isPending = variant === "page" ? isPendingPage : isPendingShell;
  const years = useMemo(() => startYearOptions(), []);
  const span = cycleMonthSpan(cycle);
  const preWeeks = roundedWeeks(cycle.startDate, cycle.preSeasonEnd);
  const officialWeeks = roundedWeeks(officialStart, cycle.endDate);

  const applyCycle = (next: SeasonCycleDates): void => {
    setCycle(next);
  };

  const shiftPreseason = (weeks: number): void => {
    const nextEnd = addWeeksToCivilDate(cycle.preSeasonEnd, weeks);
    if (!nextEnd) {
      return;
    }
    applyCycle({ ...cycle, preSeasonEnd: nextEnd });
  };

  const shiftOfficial = (weeks: number): void => {
    const nextEnd = addWeeksToCivilDate(cycle.endDate, weeks);
    if (!nextEnd) {
      return;
    }
    applyCycle({ ...cycle, endDate: nextEnd });
  };

  const hiddenFields = (
    <>
      <input name="name" type="hidden" value={seasonPersistedName(cycle.startYear)} />
      <input name="startDate" type="hidden" value={cycle.startDate} />
      <input name="preSeasonEnd" type="hidden" value={cycle.preSeasonEnd} />
      <input name="endDate" type="hidden" value={cycle.endDate} />
    </>
  );

  const body = (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor="season-start-year">Año de inicio</Label>
          <select
            className="h-8 rounded-lg border border-border-primary bg-bg-tertiary px-2 text-sm text-text-primary"
            id="season-start-year"
            onChange={(event) => {
              applyCycle(defaultSeasonCycle(Number(event.target.value)));
            }}
            value={cycle.startYear}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <p className="font-medium text-sm text-text-secondary">
          {seasonCycleLabel(cycle.startYear)}
        </p>
      </div>

      <section className="space-y-3 border-t border-border-secondary pt-4">
        <span className="inline-flex h-5 items-center rounded-full bg-bg-secondary px-2 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
          Pretemporada
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="configure-season-pre-start">Inicio</Label>
            <DatePicker
              id="configure-season-pre-start"
              onChange={(value) => applyCycle({ ...cycle, startDate: value })}
              required
              value={cycle.startDate}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="configure-season-pre-end">Fin</Label>
            <DatePicker
              id="configure-season-pre-end"
              onChange={(value) => applyCycle({ ...cycle, preSeasonEnd: value })}
              required
              value={cycle.preSeasonEnd}
            />
          </div>
        </div>
        <DurationControl
          canMinus={canShiftPreseasonEnd(cycle, -1)}
          canPlus={canShiftPreseasonEnd(cycle, 1)}
          label="Duración:"
          onShift={shiftPreseason}
          weeks={preWeeks}
        />
      </section>

      <section className="space-y-3 border-t border-border-secondary pt-4">
        <span className="inline-flex h-5 items-center rounded-full bg-brand/15 px-2 text-xs font-medium uppercase tracking-[0.16em] text-brand">
          Temporada oficial
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="configure-season-official-start">Inicio</Label>
            <DatePicker
              disabled
              id="configure-season-official-start"
              required
              value={officialStart}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="configure-season-official-end">Fin</Label>
            <DatePicker
              id="configure-season-official-end"
              onChange={(value) => applyCycle({ ...cycle, endDate: value })}
              required
              value={cycle.endDate}
            />
          </div>
        </div>
        <DurationControl
          canMinus={canShiftOfficialEnd(cycle, -1)}
          canPlus={canShiftOfficialEnd(cycle, 1)}
          label="Duración:"
          onShift={shiftOfficial}
          weeks={officialWeeks}
        />
        <div className="space-y-1">
          <p className="text-xs text-text-secondary">
            Ciclo · {span.totalMonths} meses
          </p>
          <div
            aria-hidden
            className="flex h-1.5 overflow-hidden rounded-full bg-bg-secondary"
          >
            <span
              className="h-full bg-bg-tertiary"
              style={{ width: `${Math.round(span.preseasonRatio * 100)}%` }}
            />
            <span className="h-full flex-1 bg-brand/50" />
          </div>
        </div>
      </section>

      {rangeError ? (
        <p className="text-sm text-danger" role="alert">
          {rangeError}
        </p>
      ) : null}

      <div
        className={cn(
          "flex gap-2",
          variant === "dialog" ? "justify-end" : "flex-col"
        )}
      >
        {variant === "dialog" && onCancel ? (
          <Button
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
        ) : null}
        <Button disabled={isPending || rangeError !== null} type="submit">
          {isPending ? "Guardando..." : "Guardar temporada"}
        </Button>
      </div>
    </div>
  );

  if (variant === "page") {
    return (
      <form action={pageAction} className="space-y-4">
        {hiddenFields}
        {body}
      </form>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await createSeasonFromShell(formData);
        });
      }}
      className="space-y-4"
    >
      {hiddenFields}
      {body}
    </form>
  );
}
