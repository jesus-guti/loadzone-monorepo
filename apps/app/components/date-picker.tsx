"use client";

import {
  DatePicker as DesignSystemDatePicker,
  type DatePickerProps,
} from "@repo/design-system/components/date-picker";

export type { DatePickerProps };

/** Staff-app date picker with Spanish calendar + display defaults. */
export function DatePicker({
  placeholder = "Seleccionar fecha",
  displayLocale = "es-ES",
  calendarLocale = "es",
  ...props
}: DatePickerProps) {
  return (
    <DesignSystemDatePicker
      calendarLocale={calendarLocale}
      displayLocale={displayLocale}
      placeholder={placeholder}
      {...props}
    />
  );
}
