import type {
  PlayerReminderMode,
  ReminderConsentBandKey,
  ReminderConsentPolicy,
} from "@repo/database/reminder-consent";
import { Label } from "@repo/design-system/components/label";

type ReminderConsentPolicyFieldsProperties = {
  readonly policy: ReminderConsentPolicy;
};

const BAND_ROWS: Array<{
  key: ReminderConsentBandKey;
  title: string;
  description: string;
  modeField: string;
  receiveField: string;
}> = [
  {
    key: "assisted",
    title: "Asistida",
    description:
      "El tutor consiente; el dispositivo con adulto presente puede suscribirse. Sin CTA independiente del menor.",
    modeField: "rc_assisted_mode",
    receiveField: "rc_assisted_guardianReceive",
  },
  {
    key: "guided",
    title: "Guiada",
    description:
      "El jugador puede optar; el staff puede revocar recordatorios en nombre de la supervisión.",
    modeField: "rc_guided_mode",
    receiveField: "rc_guided_guardianReceive",
  },
  {
    key: "independentYouth",
    title: "Independiente juvenil",
    description:
      "Por debajo de la mayoría de edad del equipo (p. ej. 14–15). El jugador consiente; el tutor recibe solo si la capa parental está activa.",
    modeField: "rc_independentYouth_mode",
    receiveField: "rc_independentYouth_guardianReceive",
  },
  {
    key: "independentMajority",
    title: "Independiente mayoría",
    description:
      "En o por encima de la mayoría de edad (p. ej. 16+). El jugador consiente; recepción del tutor apagada por defecto.",
    modeField: "rc_independentMajority_mode",
    receiveField: "rc_independentMajority_guardianReceive",
  },
];

const MODE_OPTIONS: Array<{ value: PlayerReminderMode; label: string }> = [
  {
    value: "GUARDIAN_CONSENTS",
    label: "Tutor consiente (asistida)",
  },
  {
    value: "PLAYER_OPT_IN",
    label: "Jugador puede optar (guiada)",
  },
  {
    value: "PLAYER_CONSENTS",
    label: "Jugador consiente",
  },
  {
    value: "OFF",
    label: "Desactivado",
  },
];

export function ReminderConsentPolicyFields({
  policy,
}: ReminderConsentPolicyFieldsProperties) {
  return (
    <div className="space-y-0">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
        Consentimiento de recordatorios por tramo
      </p>
      {BAND_ROWS.map((row) => {
        const band = policy[row.key];
        return (
          <div
            key={row.key}
            className="border-t border-border-secondary py-4 first:border-t-0 first:pt-0"
          >
            <p className="text-sm font-medium text-text-primary">{row.title}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{row.description}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={row.modeField}>Recordatorios al jugador</Label>
                <select
                  id={row.modeField}
                  name={row.modeField}
                  defaultValue={band.playerRemindersMode}
                  className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
                >
                  {MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <label
                htmlFor={row.receiveField}
                className="flex cursor-pointer items-start gap-3 pt-6"
              >
                <input
                  id={row.receiveField}
                  name={row.receiveField}
                  type="checkbox"
                  defaultChecked={band.guardianReceiveEnabled}
                  className="mt-1 size-4 rounded border-border-secondary accent-brand"
                />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium text-text-primary">
                    Tutor puede recibir avisos
                  </span>
                  <span className="block text-xs text-text-secondary">
                    Falta y alertas de cuidado (el envío es otro trabajo). Solo
                    aplica con capa parental activa.
                  </span>
                </span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
