"use client";

import type { AgeBandPolicy } from "@repo/database/age-band-policy";
import type {
  PlayerReminderMode,
  ReminderConsentBandKey,
  ReminderConsentPolicy,
} from "@repo/database/reminder-consent";
import { Input } from "@repo/design-system/components/input";
import { useState } from "react";
import {
  updateTeamAgeBandPolicyFromForm,
  updateTeamReminderConsentFromForm,
} from "../actions/settings-field-actions";
import { useSettingsAutosave } from "../hooks/use-settings-autosave";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type PoliticasSettingsFormProps = {
  readonly teamId: string;
  readonly policySourceLabel: string;
  readonly teamAgePolicy: AgeBandPolicy;
  readonly inheritsClubAgePolicy: boolean;
  readonly reminderConsentPolicy: ReminderConsentPolicy;
};

const BAND_ROWS: Array<{
  key: ReminderConsentBandKey;
  title: string;
  modeField: string;
  receiveField: string;
}> = [
  {
    key: "assisted",
    title: "Asistida",
    modeField: "rc_assisted_mode",
    receiveField: "rc_assisted_guardianReceive",
  },
  {
    key: "guided",
    title: "Guiada",
    modeField: "rc_guided_mode",
    receiveField: "rc_guided_guardianReceive",
  },
  {
    key: "independentYouth",
    title: "Independiente juvenil",
    modeField: "rc_independentYouth_mode",
    receiveField: "rc_independentYouth_guardianReceive",
  },
  {
    key: "independentMajority",
    title: "Independiente mayoría",
    modeField: "rc_independentMajority_mode",
    receiveField: "rc_independentMajority_guardianReceive",
  },
];

const MODE_OPTIONS: Array<{ value: PlayerReminderMode; label: string }> = [
  { value: "GUARDIAN_CONSENTS", label: "Tutor consiente (asistida)" },
  { value: "PLAYER_OPT_IN", label: "Jugador puede optar (guiada)" },
  { value: "PLAYER_CONSENTS", label: "Jugador consiente" },
  { value: "OFF", label: "Desactivado" },
];

export function PoliticasSettingsForm({
  teamId,
  policySourceLabel,
  teamAgePolicy,
  inheritsClubAgePolicy,
  reminderConsentPolicy,
}: PoliticasSettingsFormProps) {
  const { saveImmediate, saveDebounced, flushDebounced } = useSettingsAutosave({
    teamId,
    routeKey: "politicas",
  });

  const [inherit, setInherit] = useState(inheritsClubAgePolicy);
  const [assisted, setAssisted] = useState(
    String(teamAgePolicy.assistedMaxAgeExclusive)
  );
  const [guided, setGuided] = useState(
    String(teamAgePolicy.guidedMaxAgeExclusive)
  );
  const [majority, setMajority] = useState(
    String(teamAgePolicy.adultMajorityAge)
  );
  const [youthSupervision, setYouthSupervision] = useState(
    teamAgePolicy.independentYouthSupervisionEnabled
  );
  const [missReceive, setMissReceive] = useState(
    teamAgePolicy.guardianMissReceiveEnabled
  );
  const [careReceive, setCareReceive] = useState(
    teamAgePolicy.guardianCareAlertReceiveEnabled
  );
  const [consent, setConsent] = useState(reminderConsentPolicy);

  const buildAgeFormData = (overrides?: {
    inherit?: boolean;
    assisted?: string;
    guided?: string;
    majority?: string;
    youthSupervision?: boolean;
    missReceive?: boolean;
    careReceive?: boolean;
  }): FormData => {
    const formData = new FormData();
    const nextInherit =
      overrides?.inherit !== undefined ? overrides.inherit : inherit;
    if (nextInherit) {
      formData.set("age_useClubDefaults", "on");
    }
    formData.set(
      "age_assistedMaxAgeExclusive",
      overrides?.assisted ?? assisted
    );
    formData.set("age_guidedMaxAgeExclusive", overrides?.guided ?? guided);
    formData.set("age_adultMajorityAge", overrides?.majority ?? majority);
    const nextYouth =
      overrides?.youthSupervision !== undefined
        ? overrides.youthSupervision
        : youthSupervision;
    const nextMiss =
      overrides?.missReceive !== undefined
        ? overrides.missReceive
        : missReceive;
    const nextCare =
      overrides?.careReceive !== undefined
        ? overrides.careReceive
        : careReceive;
    if (nextYouth) {
      formData.set("age_independentYouthSupervisionEnabled", "on");
    }
    if (nextMiss) {
      formData.set("age_guardianMissReceiveEnabled", "on");
    }
    if (nextCare) {
      formData.set("age_guardianCareAlertReceiveEnabled", "on");
    }
    return formData;
  };

  const saveAgeImmediate = (overrides?: Parameters<typeof buildAgeFormData>[0]): void => {
    saveImmediate(() =>
      updateTeamAgeBandPolicyFromForm(buildAgeFormData(overrides))
    );
  };

  const saveAgeDebounced = (
    key: string,
    overrides?: Parameters<typeof buildAgeFormData>[0]
  ): void => {
    saveDebounced(key, () =>
      updateTeamAgeBandPolicyFromForm(buildAgeFormData(overrides))
    );
  };

  const flushAge = (
    key: string,
    overrides?: Parameters<typeof buildAgeFormData>[0]
  ): void => {
    flushDebounced(key, () =>
      updateTeamAgeBandPolicyFromForm(buildAgeFormData(overrides))
    );
  };

  const buildConsentFormData = (
    next: ReminderConsentPolicy = consent
  ): FormData => {
    const formData = new FormData();
    for (const row of BAND_ROWS) {
      const band = next[row.key];
      formData.set(row.modeField, band.playerRemindersMode);
      if (band.guardianReceiveEnabled) {
        formData.set(row.receiveField, "on");
      }
    }
    return formData;
  };

  return (
    <div>
      <SettingsSection
        description={`Política efectiva actual: ${policySourceLabel}. Los tramos deben ser contiguos (asistida < guiada ≤ mayoría).`}
        title="Tramos de edad"
      >
        <form className="contents" onSubmit={(e) => e.preventDefault()}>
          <SettingsRow htmlFor="team-age-use-club" label="Usar valores del club">
            <input
              id="team-age-use-club"
              type="checkbox"
              className="size-4 rounded border-border-secondary accent-brand"
              checked={inherit}
              onChange={(event) => {
                const next = event.target.checked;
                setInherit(next);
                saveAgeImmediate({ inherit: next });
              }}
            />
          </SettingsRow>
          <SettingsRow htmlFor="team-age-assisted" label="Asistida hasta">
            <Input
              id="team-age-assisted"
              type="number"
              min={0}
              max={100}
              disabled={inherit}
              value={assisted}
              onChange={(event) => {
                const next = event.target.value;
                setAssisted(next);
                saveAgeDebounced("assisted", { assisted: next });
              }}
              onBlur={() => flushAge("assisted")}
            />
          </SettingsRow>
          <SettingsRow htmlFor="team-age-guided" label="Guiada hasta">
            <Input
              id="team-age-guided"
              type="number"
              min={0}
              max={100}
              disabled={inherit}
              value={guided}
              onChange={(event) => {
                const next = event.target.value;
                setGuided(next);
                saveAgeDebounced("guided", { guided: next });
              }}
              onBlur={() => flushAge("guided")}
            />
          </SettingsRow>
          <SettingsRow htmlFor="team-age-majority" label="Mayoría desde">
            <Input
              id="team-age-majority"
              type="number"
              min={0}
              max={100}
              disabled={inherit}
              value={majority}
              onChange={(event) => {
                const next = event.target.value;
                setMajority(next);
                saveAgeDebounced("majority", { majority: next });
              }}
              onBlur={() => flushAge("majority")}
            />
          </SettingsRow>
          <SettingsRow
            htmlFor="team-age-youth"
            label="Supervisión en independiente juvenil"
          >
            <input
              id="team-age-youth"
              type="checkbox"
              disabled={inherit}
              className="size-4 rounded border-border-secondary accent-brand"
              checked={youthSupervision}
              onChange={(event) => {
                const next = event.target.checked;
                setYouthSupervision(next);
                saveAgeImmediate({ youthSupervision: next });
              }}
            />
          </SettingsRow>
          <SettingsRow
            htmlFor="team-age-miss"
            label="Tutor recibe avisos de falta"
          >
            <input
              id="team-age-miss"
              type="checkbox"
              disabled={inherit}
              className="size-4 rounded border-border-secondary accent-brand"
              checked={missReceive}
              onChange={(event) => {
                const next = event.target.checked;
                setMissReceive(next);
                saveAgeImmediate({ missReceive: next });
              }}
            />
          </SettingsRow>
          <SettingsRow
            htmlFor="team-age-care"
            label="Tutor recibe alertas de cuidado"
          >
            <input
              id="team-age-care"
              type="checkbox"
              disabled={inherit}
              className="size-4 rounded border-border-secondary accent-brand"
              checked={careReceive}
              onChange={(event) => {
                const next = event.target.checked;
                setCareReceive(next);
                saveAgeImmediate({ careReceive: next });
              }}
            />
          </SettingsRow>
        </form>
      </SettingsSection>

      <SettingsSection
        description="Valores por defecto del equipo según el tramo de edad. El estado por jugador se gestiona en la ficha del jugador."
        title="Consentimiento de recordatorios"
      >
        <form className="contents" onSubmit={(e) => e.preventDefault()}>
          {BAND_ROWS.map((row) => {
            const band = consent[row.key];
            return (
              <div key={row.key}>
                <SettingsRow htmlFor={row.modeField} label={`${row.title} — modo`}>
                  <select
                    id={row.modeField}
                    className="h-9 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
                    value={band.playerRemindersMode}
                    onChange={(event) => {
                      const nextMode = event.target
                        .value as PlayerReminderMode;
                      const next = {
                        ...consent,
                        [row.key]: {
                          ...band,
                          playerRemindersMode: nextMode,
                        },
                      };
                      setConsent(next);
                      saveImmediate(() =>
                        updateTeamReminderConsentFromForm(
                          buildConsentFormData(next)
                        )
                      );
                    }}
                  >
                    {MODE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </SettingsRow>
                <SettingsRow
                  htmlFor={row.receiveField}
                  label={`${row.title} — tutor recibe`}
                >
                  <input
                    id={row.receiveField}
                    type="checkbox"
                    className="size-4 rounded border-border-secondary accent-brand"
                    checked={band.guardianReceiveEnabled}
                    onChange={(event) => {
                      const next = {
                        ...consent,
                        [row.key]: {
                          ...band,
                          guardianReceiveEnabled: event.target.checked,
                        },
                      };
                      setConsent(next);
                      saveImmediate(() =>
                        updateTeamReminderConsentFromForm(
                          buildConsentFormData(next)
                        )
                      );
                    }}
                  />
                </SettingsRow>
              </div>
            );
          })}
        </form>
      </SettingsSection>
    </div>
  );
}
