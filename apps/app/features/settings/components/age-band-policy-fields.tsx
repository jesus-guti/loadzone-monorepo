import type { AgeBandPolicy } from "@repo/database/age-band-policy";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";

type AgeBandPolicyFieldsProperties = {
  readonly idPrefix: string;
  readonly policy: AgeBandPolicy;
  readonly showInheritToggle?: boolean;
  readonly inheritChecked?: boolean;
};

function CheckboxRow({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly defaultChecked: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 border-t border-border-secondary py-3 first:border-t-0"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 rounded border-border-secondary accent-brand"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        <span className="block text-xs text-text-secondary">{description}</span>
      </span>
    </label>
  );
}

export function AgeBandPolicyFields({
  idPrefix,
  policy,
  showInheritToggle = false,
  inheritChecked = false,
}: AgeBandPolicyFieldsProperties) {
  return (
    <div className="space-y-4">
      {showInheritToggle ? (
        <CheckboxRow
          id={`${idPrefix}-use-club`}
          name="age_useClubDefaults"
          label="Usar valores del club"
          description="Si está marcado, este equipo hereda la política del club (o los valores seguros por defecto)."
          defaultChecked={inheritChecked}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-assisted`}>
            Asistida hasta (edad exclusiva)
          </Label>
          <Input
            id={`${idPrefix}-assisted`}
            name="age_assistedMaxAgeExclusive"
            type="number"
            min={0}
            max={100}
            defaultValue={String(policy.assistedMaxAgeExclusive)}
            required
          />
          <p className="text-xs text-text-secondary">
            Ejemplo: 10 → asistida de 0 a 9 años.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-guided`}>
            Guiada hasta (edad exclusiva)
          </Label>
          <Input
            id={`${idPrefix}-guided`}
            name="age_guidedMaxAgeExclusive"
            type="number"
            min={0}
            max={100}
            defaultValue={String(policy.guidedMaxAgeExclusive)}
            required
          />
          <p className="text-xs text-text-secondary">
            Independiente empieza en este valor.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-majority`}>Mayoría de edad</Label>
          <Input
            id={`${idPrefix}-majority`}
            name="age_adultMajorityAge"
            type="number"
            min={0}
            max={100}
            defaultValue={String(policy.adultMajorityAge)}
            required
          />
          <p className="text-xs text-text-secondary">
            Bajo este umbral, la supervisión independiente opcional puede aplicar.
          </p>
        </div>
      </div>

      <div className="border-t border-border-secondary pt-2">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Supervisión parental
        </p>
        <CheckboxRow
          id={`${idPrefix}-youth-supervision`}
          name="age_independentYouthSupervisionEnabled"
          label="Supervisión en independiente juvenil"
          description="Activa la capa parental para jugadores independientes por debajo de la mayoría de edad (p. ej. 14–15)."
          defaultChecked={policy.independentYouthSupervisionEnabled}
        />
        <CheckboxRow
          id={`${idPrefix}-miss`}
          name="age_guardianMissReceiveEnabled"
          label="Tutor recibe avisos de falta"
          description="Cuando la capa parental está activa, el tutor puede recibir avisos de check-in no completado."
          defaultChecked={policy.guardianMissReceiveEnabled}
        />
        <CheckboxRow
          id={`${idPrefix}-care`}
          name="age_guardianCareAlertReceiveEnabled"
          label="Tutor recibe alertas de cuidado"
          description="Cuando la capa parental está activa, el tutor puede recibir alertas de cuidado relevantes."
          defaultChecked={policy.guardianCareAlertReceiveEnabled}
        />
      </div>
    </div>
  );
}
