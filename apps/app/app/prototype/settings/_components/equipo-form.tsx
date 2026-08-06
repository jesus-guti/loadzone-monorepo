"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/select";
import { useState, type ReactNode } from "react";

const CATEGORY_OPTIONS = [
  "Juvenil",
  "Cadete",
  "Infantil",
  "Senior",
] as const;

const TIMEZONE_OPTIONS = [
  "Europe/Madrid",
  "Atlantic/Canary",
  "America/Mexico_City",
  "America/Bogota",
] as const;

type EquipoFormProps = {
  readonly initialCategory: string;
  readonly initialTimezone: string;
};

function SettingsSection({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="pt-8 first:pt-4">
      <h2 className="font-medium text-xs text-text-secondary uppercase tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SettingsRow({
  label,
  htmlFor,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-border-secondary border-t py-3">
      <label
        className="shrink-0 font-medium text-sm text-text-primary"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      <div className="min-w-0 max-w-[min(100%,16rem)] flex-1 sm:max-w-[18rem]">
        {children}
      </div>
    </div>
  );
}

export function EquipoForm({
  initialCategory,
  initialTimezone,
}: EquipoFormProps) {
  const [category, setCategory] = useState(initialCategory);
  const [timezone, setTimezone] = useState(initialTimezone);

  return (
    <div>
      <SettingsSection
        description="Datos básicos del equipo activo."
        title="Identidad"
      >
        <SettingsRow htmlFor="prototype-category" label="Categoría">
          <Select
            items={CATEGORY_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
            value={category}
            onValueChange={(value: string | null) => {
              if (value) {
                setCategory(value);
              }
            }}
          >
            <SelectTrigger
              className="w-full"
              id="prototype-category"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        description="Define el día local para check-ins y reportes."
        title="Zona horaria"
      >
        <SettingsRow htmlFor="prototype-timezone" label="Zona horaria">
          <Select
            items={TIMEZONE_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
            value={timezone}
            onValueChange={(value: string | null) => {
              if (value) {
                setTimezone(value);
              }
            }}
          >
            <SelectTrigger
              className="w-full"
              id="prototype-timezone"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
