import {
  DEFAULT_REMINDER_CONSENT_POLICY,
  reminderConsentPolicySchema,
  type PlayerReminderMode,
  type ReminderConsentPolicy,
} from "@repo/database/reminder-consent";

const BAND_KEYS = [
  "assisted",
  "guided",
  "independentYouth",
  "independentMajority",
] as const;

function readCheckbox(formData: FormData, key: string): boolean {
  const raw = formData.get(key);
  return raw === "on" || raw === "true" || raw === "1";
}

function readMode(
  formData: FormData,
  key: string,
  fallback: PlayerReminderMode
): PlayerReminderMode {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.length === 0) {
    return fallback;
  }
  const parsed = reminderConsentPolicySchema.shape.assisted.shape.playerRemindersMode.safeParse(
    raw
  );
  return parsed.success ? parsed.data : fallback;
}

/**
 * Parse Reminder Consent × band fields from Team settings FormData.
 */
export function parseReminderConsentPolicyFromFormData(
  formData: FormData
):
  | { success: true; policy: ReminderConsentPolicy }
  | { success: false; error: string } {
  const defaults = DEFAULT_REMINDER_CONSENT_POLICY;
  const candidate: ReminderConsentPolicy = {
    assisted: {
      playerRemindersMode: readMode(
        formData,
        "rc_assisted_mode",
        defaults.assisted.playerRemindersMode
      ),
      guardianReceiveEnabled: readCheckbox(
        formData,
        "rc_assisted_guardianReceive"
      ),
    },
    guided: {
      playerRemindersMode: readMode(
        formData,
        "rc_guided_mode",
        defaults.guided.playerRemindersMode
      ),
      guardianReceiveEnabled: readCheckbox(
        formData,
        "rc_guided_guardianReceive"
      ),
    },
    independentYouth: {
      playerRemindersMode: readMode(
        formData,
        "rc_independentYouth_mode",
        defaults.independentYouth.playerRemindersMode
      ),
      guardianReceiveEnabled: readCheckbox(
        formData,
        "rc_independentYouth_guardianReceive"
      ),
    },
    independentMajority: {
      playerRemindersMode: readMode(
        formData,
        "rc_independentMajority_mode",
        defaults.independentMajority.playerRemindersMode
      ),
      guardianReceiveEnabled: readCheckbox(
        formData,
        "rc_independentMajority_guardianReceive"
      ),
    },
  };

  // Ensure all checkbox-only bands still parse when unchecked (false).
  void BAND_KEYS;

  const parsed = reminderConsentPolicySchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "La política de consentimiento de recordatorios no es válida.",
    };
  }

  return { success: true, policy: parsed.data };
}
