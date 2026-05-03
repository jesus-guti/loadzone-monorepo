"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { useMemo, useState } from "react";

export type CalendarSession = {
  id: string;
  title: string;
  type: "TRAINING" | "MATCH" | "RECOVERY" | "OTHER";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  startsAt: string;
  endsAt: string;
};

type ViewMode = "month" | "week";

type SessionCalendarProps = {
  readonly sessions: ReadonlyArray<CalendarSession>;
  readonly initialDate?: string;
};

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Pastel fills (tinted surfaces, not solid brand/danger). */
const TYPE_EVENT_SURFACE: Record<CalendarSession["type"], string> = {
  TRAINING: "bg-brand/14 text-text-primary dark:bg-brand/20",
  MATCH: "bg-danger/12 text-text-primary dark:bg-danger/18",
  RECOVERY: "bg-success/13 text-text-primary dark:bg-success/18",
  OTHER: "bg-chart-3/14 text-text-primary dark:bg-chart-3/18",
};

const TYPE_LEGEND_SWATCH: Record<CalendarSession["type"], string> = {
  TRAINING: "bg-brand/55 dark:bg-brand/45",
  MATCH: "bg-danger/50 dark:bg-danger/45",
  RECOVERY: "bg-success/50 dark:bg-success/45",
  OTHER: "bg-chart-3/48 dark:bg-chart-3/42",
};

function formatSessionTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const TYPE_LABEL: Record<CalendarSession["type"], string> = {
  TRAINING: "Entreno",
  MATCH: "Partido",
  RECOVERY: "Recuperación",
  OTHER: "Otro",
};

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMondayBased(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(reference: Date): Date[] {
  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const offset = getMondayBased(first);
  const start = new Date(first);
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 42 }, (_, index) => {
    const value = new Date(start);
    value.setDate(start.getDate() + index);
    return value;
  });
}

function buildWeekGrid(reference: Date): Date[] {
  const offset = getMondayBased(reference);
  const start = new Date(reference);
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(start);
    value.setDate(start.getDate() + index);
    return value;
  });
}

function formatYmd(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildHrefForNew(date: Date): string {
  return `/sessions/new?date=${formatYmd(date)}`;
}

export function SessionCalendar({
  sessions,
  initialDate,
}: SessionCalendarProps) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(() =>
    initialDate ? new Date(initialDate) : startOfDay(new Date())
  );

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const session of sessions) {
      const key = formatYmd(new Date(session.startsAt));
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
    }
    return map;
  }, [sessions]);

  const days = view === "month" ? buildMonthGrid(cursor) : buildWeekGrid(cursor);
  const today = startOfDay(new Date());

  function goPrev(): void {
    const next = new Date(cursor);
    if (view === "month") {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCursor(next);
  }

  function goNext(): void {
    const next = new Date(cursor);
    if (view === "month") {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCursor(next);
  }

  function goToday(): void {
    setCursor(startOfDay(new Date()));
  }

  const headerLabel =
    view === "month"
      ? `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`
      : (() => {
          const firstDay = days[0]!;
          const lastDay = days[days.length - 1]!;
          if (firstDay.getMonth() === lastDay.getMonth()) {
            return `${firstDay.getDate()} - ${lastDay.getDate()} ${MONTH_LABELS[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
          }
          return `${firstDay.getDate()} ${MONTH_LABELS[firstDay.getMonth()]} - ${lastDay.getDate()} ${MONTH_LABELS[lastDay.getMonth()]} ${firstDay.getFullYear()}`;
        })();

  return (
    <div
      className={cn(
        "bg-bg-primary max-md:-mx-4 max-md:w-[calc(100%+2rem)] max-md:rounded-none max-md:border-0",
        "md:rounded-lg md:border md:border-border-tertiary"
      )}
    >
      <div className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-4">
        <div className="flex items-center justify-between md:justify-start md:gap-1">
          <div className="flex items-center gap-1">
            <Button
              aria-label="Anterior"
              onClick={goPrev}
              size="icon"
              variant="ghost"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              aria-label="Siguiente"
              onClick={goNext}
              size="icon"
              variant="ghost"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              className="border-border-tertiary text-text-primary"
              onClick={goToday}
              size="sm"
              variant="outline"
            >
              Hoy
            </Button>
          </div>
          <p className="ml-3 text-base font-semibold tracking-tight text-text-primary md:ml-3">
            {headerLabel}
          </p>
        </div>
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-md border border-border-tertiary bg-bg-primary p-0.5">
            <button
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                view === "month"
                  ? "bg-bg-secondary text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
              onClick={() => setView("month")}
              type="button"
            >
              Mes
            </button>
            <button
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                view === "week"
                  ? "bg-bg-secondary text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
              onClick={() => setView("week")}
              type="button"
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-text-tertiary">
        {WEEKDAY_LABELS.map((label) => (
          <div className="py-2" key={label}>
            {label}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid grid-cols-7",
          view === "month" ? "grid-rows-6" : "grid-rows-1"
        )}
      >
        {days.map((day, index) => {
          const key = formatYmd(day);
          const dayEvents = sessionsByDay.get(key) ?? [];
          const isCurrentMonth =
            view === "week" || day.getMonth() === cursor.getMonth();
          const isToday = isSameDay(day, today);

          return (
            <div
              className={cn(
                "group relative flex flex-col min-h-[110px] px-1 py-1 md:min-h-[130px] md:border-l md:border-t md:border-border-tertiary/60 md:px-2 md:py-1.5",
                index % 7 === 6 && "md:border-r",
                index >= days.length - 7 && "md:border-b",
                !isCurrentMonth && "bg-bg-secondary/40"
              )}
              key={`${key}-${index}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    !isCurrentMonth && "text-text-tertiary",
                    isCurrentMonth && !isToday && "text-text-secondary",
                    isToday &&
                      "glass-surface rounded-full bg-brand/15 px-2 py-0.5 font-semibold text-brand"
                  )}
                >
                  {day.getDate()}
                </span>
                <Link
                  aria-label={`Crear sesión el ${formatYmd(day)}`}
                  className="text-text-tertiary hover:text-brand md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  href={buildHrefForNew(day)}
                >
                  <PlusIcon className="size-4" />
                </Link>
              </div>

              <div className="mt-1 flex flex-col gap-1 flex-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <Link
                    className={cn(
                      TYPE_EVENT_SURFACE[event.type],
                      "flex w-full min-w-0 flex-col gap-0.5 rounded-sm px-2 py-1 text-left md:flex-row md:items-center md:gap-2 md:py-1",
                      event.status === "CANCELLED" && "line-through opacity-60"
                    )}
                    href={`/sessions/${event.id}`}
                    key={event.id}
                  >
                    <span className="min-w-0 line-clamp-2 text-[11px] font-medium leading-snug hover:underline md:line-clamp-none md:flex-1 md:truncate md:leading-tight">
                      {event.title}
                    </span>
                    <span className="shrink-0 text-[10px] leading-tight text-text-secondary md:ml-auto md:text-[11px]">
                      {formatSessionTime(event.startsAt)}
                    </span>
                  </Link>
                ))}
                {dayEvents.length > 3 ? (
                  <p className="px-0.5 text-[11px] text-text-tertiary md:px-1.5">
                    +{dayEvents.length - 3} más
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-3 px-3 py-2 text-xs text-text-tertiary md:px-4",
          "max-md:border-0 md:border-t md:border-border-tertiary"
        )}
      >
        {(["TRAINING", "MATCH", "RECOVERY", "OTHER"] as const).map((type) => (
          <span className="inline-flex items-center gap-2" key={type}>
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-[2px]",
                TYPE_LEGEND_SWATCH[type]
              )}
            />
            {TYPE_LABEL[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
