import {
  ageBandPolicySchema,
  DEFAULT_AGE_BAND_POLICY,
  type AgeBandPolicy,
} from "@repo/database/age-band-policy";

function readOptionalNumber(formData: FormData, key: string): number | undefined {
  const raw = formData.get(key);
  if (raw === null || raw === "") {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function readCheckbox(formData: FormData, key: string): boolean {
  const raw = formData.get(key);
  return raw === "on" || raw === "true" || raw === "1";
}

/**
 * Parse Age Band policy fields from settings FormData.
 * Empty cutoff fields fall back to documented defaults so partial edits remain valid.
 */
export function parseAgeBandPolicyFromFormData(
  formData: FormData
):
  | { success: true; policy: AgeBandPolicy }
  | { success: false; error: string } {
  const parsed = ageBandPolicySchema.safeParse({
    assistedMaxAgeExclusive:
      readOptionalNumber(formData, "age_assistedMaxAgeExclusive") ??
      DEFAULT_AGE_BAND_POLICY.assistedMaxAgeExclusive,
    guidedMaxAgeExclusive:
      readOptionalNumber(formData, "age_guidedMaxAgeExclusive") ??
      DEFAULT_AGE_BAND_POLICY.guidedMaxAgeExclusive,
    adultMajorityAge:
      readOptionalNumber(formData, "age_adultMajorityAge") ??
      DEFAULT_AGE_BAND_POLICY.adultMajorityAge,
    independentYouthSupervisionEnabled: readCheckbox(
      formData,
      "age_independentYouthSupervisionEnabled"
    ),
    guardianMissReceiveEnabled: readCheckbox(
      formData,
      "age_guardianMissReceiveEnabled"
    ),
    guardianCareAlertReceiveEnabled: readCheckbox(
      formData,
      "age_guardianCareAlertReceiveEnabled"
    ),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "La política de tramos de edad no es válida.",
    };
  }

  return { success: true, policy: parsed.data };
}
