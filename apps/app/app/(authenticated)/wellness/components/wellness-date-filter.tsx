"use client";

import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import { Calendar } from "@repo/design-system/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { setActiveWellnessDate } from "../../actions/active-wellness-date";

type WellnessDateFilterProperties = {
  readonly initialDate: string;
};

function parseDateValue(dateValue: string): Date {
  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    const fallbackDate = new Date();
    fallbackDate.setHours(0, 0, 0, 0);
    return fallbackDate;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(leftDate: Date, rightDate: Date): boolean {
  return formatDateValue(leftDate) === formatDateValue(rightDate);
}

function formatButtonLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isSameDay(date, today)) {
    return "Hoy";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function WellnessDateFilter({
  initialDate,
}: WellnessDateFilterProperties) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDateValue(initialDate)
  );

  const buttonLabel = useMemo(
    () => formatButtonLabel(selectedDate),
    [selectedDate]
  );

  const handleDateSelect = (date: Date | undefined): void => {
    if (!date) {
      return;
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    setSelectedDate(normalizedDate);
    setIsOpen(false);

    startTransition(async () => {
      await setActiveWellnessDate(formatDateValue(normalizedDate));
      router.refresh();
    });
  };

  const goToToday = (): void => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    handleDateSelect(today);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="rounded-md"
          disabled={isPending}
          size="sm"
          variant="outline"
        >
          <CalendarDaysIcon className="size-4" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="border-b border-border-secondary px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            Día evaluado
          </p>
        </div>
        <Calendar
          buttonVariant="ghost"
          disabled={{ after: new Date() }}
          mode="single"
          onSelect={handleDateSelect}
          selected={selectedDate}
        />
        <div className="flex justify-end border-t border-border-secondary px-3 py-3">
          <Button
            className="rounded-md"
            disabled={isPending}
            onClick={goToToday}
            size="sm"
            variant="ghost"
          >
            Ir a hoy
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
