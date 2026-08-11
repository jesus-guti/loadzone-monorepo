"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import { Calendar } from "@repo/design-system/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/popover";
import { cn } from "@repo/design-system/lib/utils";
import * as React from "react";
import type { Locale } from "react-day-picker";
import { es as localeEs } from "react-day-picker/locale";

const CALENDAR_LOCALES = {
  es: localeEs,
} as const;

export type DatePickerCalendarLocale = keyof typeof CALENDAR_LOCALES;

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseCivilDate(value: string): Date | undefined {
  const match = CIVIL_DATE_PATTERN.exec(value);
  if (!match) {
    return;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return;
  }

  return parsed;
}

function formatCivilDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultFormatDisplay(date: Date, displayLocale?: string): string {
  return new Intl.DateTimeFormat(displayLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function yearsFromNow(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  date.setHours(0, 0, 0, 0);
  return date;
}

export type DatePickerProps = {
  readonly id?: string;
  readonly name?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (value: string) => void;
  readonly required?: boolean;
  readonly disabled?: boolean;
  /** Inclusive minimum civil date (`YYYY-MM-DD`). */
  readonly min?: string;
  /** Inclusive maximum civil date (`YYYY-MM-DD`). */
  readonly max?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly triggerClassName?: string;
  /** Named calendar locale shipped with the package (weekdays / months). */
  readonly calendarLocale?: DatePickerCalendarLocale;
  /** Full `react-day-picker` locale object; wins over `calendarLocale`. */
  readonly locale?: Partial<Locale>;
  /** BCP 47 tag for the trigger label (e.g. `es-ES`). */
  readonly displayLocale?: string;
  readonly formatDisplay?: (date: Date) => string;
  readonly align?: "start" | "center" | "end";
};

function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  min,
  max,
  placeholder = "Select date",
  className,
  triggerClassName,
  calendarLocale,
  locale,
  displayLocale,
  formatDisplay,
  align = "start",
}: DatePickerProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => defaultValue ?? ""
  );
  const [open, setOpen] = React.useState(false);
  const selectedValue = isControlled ? value : uncontrolledValue;
  const selectedDate = selectedValue
    ? parseCivilDate(selectedValue)
    : undefined;
  const minDate = min ? parseCivilDate(min) : undefined;
  const maxDate = max ? parseCivilDate(max) : undefined;

  const setSelectedValue = (next: string): void => {
    if (!isControlled) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const handleSelect = (date: Date | undefined): void => {
    if (!date) {
      return;
    }

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedValue(formatCivilDate(normalized));
    setOpen(false);
  };

  const label = selectedDate
    ? (formatDisplay?.(selectedDate) ??
      defaultFormatDisplay(selectedDate, displayLocale))
    : placeholder;

  const startMonth = minDate ?? yearsFromNow(-100);
  const endMonth = maxDate ?? yearsFromNow(10);
  const resolvedLocale =
    locale ?? (calendarLocale ? CALENDAR_LOCALES[calendarLocale] : undefined);

  return (
    <div className={cn("relative w-full", className)}>
      {name ? (
        <input
          aria-hidden={true}
          className="sr-only"
          disabled={disabled}
          name={name}
          readOnly
          required={required}
          tabIndex={-1}
          value={selectedValue}
        />
      ) : null}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              aria-invalid={required && !selectedValue ? true : undefined}
              className={cn(
                "h-8 w-full justify-start font-normal bg-bg-tertiary",
                !selectedDate && "text-text-secondary",
                triggerClassName
              )}
              disabled={disabled}
              id={id}
              type="button"
              variant="outline"
            >
              <CalendarBlankIcon className="size-4" weight="fill" />
              <span className="truncate">{label}</span>
            </Button>
          }
        />
        <PopoverContent align={align} className="w-auto p-0">
          <Calendar
            buttonVariant="ghost"
            captionLayout="dropdown"
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            endMonth={endMonth}
            locale={resolvedLocale}
            mode="single"
            onSelect={handleSelect}
            selected={selectedDate}
            startMonth={startMonth}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DatePicker, formatCivilDate, parseCivilDate };
