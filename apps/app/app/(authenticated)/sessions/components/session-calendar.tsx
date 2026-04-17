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

const TYPE_DOT_CLASSES: Record<CalendarSession["type"], string> = {
  TRAINING: "bg-brand",
  MATCH: "bg-danger",
  RECOVERY: "bg-text-tertiary",
  OTHER: "bg-text-secondary",
};

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
    <div className="rounded-xl border border-border-primary bg-bg-primary">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
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
          <Button onClick={goToday} size="sm" variant="outline">
            Hoy
          </Button>
          <p className="ml-3 text-sm font-medium text-text-primary">
            {headerLabel}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-md border border-border-secondary bg-bg-secondary p-0.5">
          <button
            className={cn(
              "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
              view === "month"
                ? "bg-bg-primary text-text-primary shadow"
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
                ? "bg-bg-primary text-text-primary shadow"
                : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setView("week")}
            type="button"
          >
            Semana
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-border-secondary/60 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
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
                "group relative min-h-[110px] border-t border-l border-border-secondary/40 px-2 py-1.5",
                index % 7 === 6 && "border-r",
                index >= days.length - 7 && "border-b",
                !isCurrentMonth && "bg-bg-secondary/40"
              )}
              key={`${key}-${index}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    !isCurrentMonth && "text-text-tertiary",
                    isCurrentMonth && "text-text-secondary",
                    isToday &&
                      "rounded-full bg-brand px-1.5 py-0.5 text-brand-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              <div className="mt-1 flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <Link
                    className={cn(
                      "flex items-center gap-1.5 truncate rounded-sm px-1.5 py-0.5 text-[11px] text-text-primary transition-colors hover:bg-bg-secondary",
                      event.status === "CANCELLED" && "line-through opacity-60"
                    )}
                    href={`/sessions/${event.id}`}
                    key={event.id}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        TYPE_DOT_CLASSES[event.type]
                      )}
                    />
                    <span className="truncate">
                      {new Intl.DateTimeFormat("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(event.startsAt))}{" "}
                      · {event.title}
                    </span>
                  </Link>
                ))}
                {dayEvents.length > 3 ? (
                  <p className="px-1.5 text-[10px] text-text-tertiary">
                    +{dayEvents.length - 3} más
                  </p>
                ) : null}
              </div>

              <Link
                aria-label={`Crear sesión el ${formatYmd(day)}`}
                className="absolute inset-x-2 bottom-2 hidden items-center justify-center rounded-md border border-dashed border-border-primary py-1 text-xs text-text-tertiary opacity-0 transition-opacity hover:border-brand hover:text-brand group-hover:flex group-hover:opacity-100"
                href={buildHrefForNew(day)}
              >
                <PlusIcon className="mr-1 size-3" />
                Nueva
              </Link>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border-secondary px-4 py-2 text-[11px] text-text-tertiary">
        {(["TRAINING", "MATCH", "RECOVERY", "OTHER"] as const).map((type) => (
          <span className="inline-flex items-center gap-1.5" key={type}>
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", TYPE_DOT_CLASSES[type])}
            />
            {TYPE_LABEL[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
