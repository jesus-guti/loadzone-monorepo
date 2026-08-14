"use client";

import { WELLNESS_LIMIT_PLACEHOLDERS } from "@repo/database/wellness-limits";
import { Input } from "@repo/design-system/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/select";
import { useState } from "react";
import {
  updateTeamFormAssignment,
  updateTeamReminderMinutes,
  updateTeamWellnessLimit,
} from "../actions/settings-field-actions";
import { useSettingsAutosave } from "../hooks/use-settings-autosave";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

const NONE_VALUE = "__none__";

type FormTemplateOption = {
  readonly id: string;
  readonly name: string;
};

function toSelectValue(value: string): string {
  return value === "" ? NONE_VALUE : value;
}

function fromSelectValue(value: string | null): string {
  if (!value || value === NONE_VALUE) {
    return "";
  }
  return value;
}

type WellnessSettingsFormProps = {
  readonly teamId: string;
  readonly preTemplates: ReadonlyArray<FormTemplateOption>;
  readonly postTemplates: ReadonlyArray<FormTemplateOption>;
  readonly selectedPreForm: string;
  readonly selectedPostForm: string;
  readonly preSessionReminderMinutes: number;
  readonly postSessionReminderMinutes: number;
  readonly wellnessLimits: {
    soreness: number | null;
    recovery: number | null;
    energy: number | null;
    sleepHours: number | null;
    sleepQuality: number | null;
  };
};

function toInputValue(value: number | null): string {
  return value === null ? "" : String(value);
}

export function WellnessSettingsForm({
  teamId,
  preTemplates,
  postTemplates,
  selectedPreForm,
  selectedPostForm,
  preSessionReminderMinutes,
  postSessionReminderMinutes,
  wellnessLimits,
}: WellnessSettingsFormProps) {
  const { saveImmediate, saveDebounced, flushDebounced } = useSettingsAutosave({
    teamId,
    routeKey: "wellness",
  });

  const [preForm, setPreForm] = useState(selectedPreForm);
  const [postForm, setPostForm] = useState(selectedPostForm);
  const [preMinutes, setPreMinutes] = useState(
    String(preSessionReminderMinutes)
  );
  const [postMinutes, setPostMinutes] = useState(
    String(postSessionReminderMinutes)
  );
  const [soreness, setSoreness] = useState(toInputValue(wellnessLimits.soreness));
  const [recovery, setRecovery] = useState(toInputValue(wellnessLimits.recovery));
  const [energy, setEnergy] = useState(toInputValue(wellnessLimits.energy));
  const [sleepHours, setSleepHours] = useState(
    toInputValue(wellnessLimits.sleepHours)
  );
  const [sleepQuality, setSleepQuality] = useState(
    toInputValue(wellnessLimits.sleepQuality)
  );

  return (
    <div>
      <SettingsSection id="formularios" title="Formularios">
        {/* Legacy alias for deep links during migrate */}
        <div className="sr-only" id="wellness-forms" />
        <SettingsRow htmlFor="settings-pre-form" label="Formulario pre-sesión">
          <Select
            items={[
              { value: NONE_VALUE, label: "Sin asignar" },
              ...preTemplates.map((template) => ({
                value: template.id,
                label: template.name,
              })),
            ]}
            value={toSelectValue(preForm)}
            onValueChange={(next) => {
              const value = fromSelectValue(next);
              setPreForm(value);
              saveImmediate(() =>
                updateTeamFormAssignment({
                  fillMoment: "PRE_SESSION",
                  templateId: value,
                })
              );
            }}
          >
            <SelectTrigger className="w-full" id="settings-pre-form">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Sin asignar</SelectItem>
              {preTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow htmlFor="settings-post-form" label="Formulario post-sesión">
          <Select
            items={[
              { value: NONE_VALUE, label: "Sin asignar" },
              ...postTemplates.map((template) => ({
                value: template.id,
                label: template.name,
              })),
            ]}
            value={toSelectValue(postForm)}
            onValueChange={(next) => {
              const value = fromSelectValue(next);
              setPostForm(value);
              saveImmediate(() =>
                updateTeamFormAssignment({
                  fillMoment: "POST_SESSION",
                  templateId: value,
                })
              );
            }}
          >
            <SelectTrigger className="w-full" id="settings-post-form">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Sin asignar</SelectItem>
              {postTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        description="Vacío = desactivado. La alerta de cuidado (Guardian) solo aplica a agujetas; el resto son alertas solo staff. La carga / ACWR no se configura aquí."
        title="Umbrales de alertas"
      >
        <SettingsRow htmlFor="settings-soreness" label="Agujetas">
          <Input
            id="settings-soreness"
            type="number"
            min={1}
            max={5}
            step={1}
            value={soreness}
            placeholder={`Ej: ${WELLNESS_LIMIT_PLACEHOLDERS.soreness}`}
            onChange={(event) => {
              const next = event.target.value;
              setSoreness(next);
              saveDebounced("soreness", () =>
                updateTeamWellnessLimit({ metric: "soreness", value: next })
              );
            }}
            onBlur={() => {
              flushDebounced("soreness", () =>
                updateTeamWellnessLimit({ metric: "soreness", value: soreness })
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-recovery" label="Recuperación">
          <Input
            id="settings-recovery"
            type="number"
            min={0}
            max={10}
            step={1}
            value={recovery}
            placeholder={`Ej: ${WELLNESS_LIMIT_PLACEHOLDERS.recovery}`}
            onChange={(event) => {
              const next = event.target.value;
              setRecovery(next);
              saveDebounced("recovery", () =>
                updateTeamWellnessLimit({ metric: "recovery", value: next })
              );
            }}
            onBlur={() => {
              flushDebounced("recovery", () =>
                updateTeamWellnessLimit({ metric: "recovery", value: recovery })
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-energy" label="Energía">
          <Input
            id="settings-energy"
            type="number"
            min={1}
            max={5}
            step={1}
            value={energy}
            placeholder={`Ej: ${WELLNESS_LIMIT_PLACEHOLDERS.energy}`}
            onChange={(event) => {
              const next = event.target.value;
              setEnergy(next);
              saveDebounced("energy", () =>
                updateTeamWellnessLimit({ metric: "energy", value: next })
              );
            }}
            onBlur={() => {
              flushDebounced("energy", () =>
                updateTeamWellnessLimit({ metric: "energy", value: energy })
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-sleep-hours" label="Horas de sueño">
          <Input
            id="settings-sleep-hours"
            type="number"
            min={0}
            max={24}
            step={1}
            value={sleepHours}
            placeholder={`Ej: ${WELLNESS_LIMIT_PLACEHOLDERS.sleepHours}`}
            onChange={(event) => {
              const next = event.target.value;
              setSleepHours(next);
              saveDebounced("sleepHours", () =>
                updateTeamWellnessLimit({ metric: "sleepHours", value: next })
              );
            }}
            onBlur={() => {
              flushDebounced("sleepHours", () =>
                updateTeamWellnessLimit({
                  metric: "sleepHours",
                  value: sleepHours,
                })
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-sleep-quality" label="Calidad del sueño">
          <Input
            id="settings-sleep-quality"
            type="number"
            min={1}
            max={5}
            step={1}
            value={sleepQuality}
            placeholder={`Ej: ${WELLNESS_LIMIT_PLACEHOLDERS.sleepQuality}`}
            onChange={(event) => {
              const next = event.target.value;
              setSleepQuality(next);
              saveDebounced("sleepQuality", () =>
                updateTeamWellnessLimit({ metric: "sleepQuality", value: next })
              );
            }}
            onBlur={() => {
              flushDebounced("sleepQuality", () =>
                updateTeamWellnessLimit({
                  metric: "sleepQuality",
                  value: sleepQuality,
                })
              );
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Recordatorios">
        <SettingsRow
          htmlFor="settings-pre-reminder"
          label="Recordatorio pre-sesión (min)"
        >
          <Input
            id="settings-pre-reminder"
            type="number"
            min={0}
            max={1440}
            value={preMinutes}
            onChange={(event) => {
              const next = event.target.value;
              setPreMinutes(next);
              const parsed = Number(next);
              if (!Number.isFinite(parsed)) {
                return;
              }
              saveDebounced("preMinutes", () =>
                updateTeamReminderMinutes({
                  field: "preSessionReminderMinutes",
                  value: parsed,
                })
              );
            }}
            onBlur={() => {
              const parsed = Number(preMinutes);
              if (!Number.isFinite(parsed)) {
                return;
              }
              flushDebounced("preMinutes", () =>
                updateTeamReminderMinutes({
                  field: "preSessionReminderMinutes",
                  value: parsed,
                })
              );
            }}
          />
        </SettingsRow>
        <SettingsRow
          htmlFor="settings-post-reminder"
          label="Recordatorio post-sesión (min)"
        >
          <Input
            id="settings-post-reminder"
            type="number"
            min={0}
            max={1440}
            value={postMinutes}
            onChange={(event) => {
              const next = event.target.value;
              setPostMinutes(next);
              const parsed = Number(next);
              if (!Number.isFinite(parsed)) {
                return;
              }
              saveDebounced("postMinutes", () =>
                updateTeamReminderMinutes({
                  field: "postSessionReminderMinutes",
                  value: parsed,
                })
              );
            }}
            onBlur={() => {
              const parsed = Number(postMinutes);
              if (!Number.isFinite(parsed)) {
                return;
              }
              flushDebounced("postMinutes", () =>
                updateTeamReminderMinutes({
                  field: "postSessionReminderMinutes",
                  value: parsed,
                })
              );
            }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
