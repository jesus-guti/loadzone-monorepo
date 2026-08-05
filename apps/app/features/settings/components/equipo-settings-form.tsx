"use client";

import { Input } from "@repo/design-system/components/input";
import { useState } from "react";
import {
  updateTeamCategory,
  updateTeamTimezone,
} from "../actions/settings-field-actions";
import { useSettingsAutosave } from "../hooks/use-settings-autosave";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type EquipoSettingsFormProps = {
  readonly teamId: string;
  readonly initialCategory: string;
  readonly initialTimezone: string;
};

export function EquipoSettingsForm({
  teamId,
  initialCategory,
  initialTimezone,
}: EquipoSettingsFormProps) {
  const { saveDebounced, flushDebounced } = useSettingsAutosave({
    teamId,
    routeKey: "equipo",
  });
  const [category, setCategory] = useState(initialCategory);
  const [timezone, setTimezone] = useState(initialTimezone);

  return (
    <div>
      <SettingsSection title="Identidad">
        <SettingsRow htmlFor="settings-category" label="Categoría">
          <Input
            id="settings-category"
            value={category}
            onChange={(event) => {
              const next = event.target.value;
              setCategory(next);
              saveDebounced("category", () => updateTeamCategory(next));
            }}
            onBlur={() => {
              flushDebounced("category", () => updateTeamCategory(category));
            }}
            placeholder="Ej: Juvenil, Senior, Cadete"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Zona horaria">
        <SettingsRow htmlFor="settings-timezone" label="Zona horaria">
          <Input
            id="settings-timezone"
            value={timezone}
            onChange={(event) => {
              const next = event.target.value;
              setTimezone(next);
              saveDebounced("timezone", () => updateTeamTimezone(next));
            }}
            onBlur={() => {
              flushDebounced("timezone", () => updateTeamTimezone(timezone));
            }}
            placeholder="Europe/Madrid"
            required
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
