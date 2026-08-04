/**
 * Reminder Consent defaults × Age Band and per-Player consent state.
 *
 * Team JSON (`reminderConsentPolicy`) seeds SPEC §5 matrix (retunable).
 * Player enum (`reminderConsentState`) is the consent ledger; PushSubscription
 * is transport only (JES-45 HITL C).
 *
 * Band keys map to Assisted / Guided / Independent youth (below adultMajorityAge)
 * / Independent majority — not hard-coded 16–17 / 18+ labels (JES-43 cutoffs).
 *
 * Import from `@repo/database/reminder-consent` so client bundles avoid `server-only`.
 */

import { z } from "zod";
import type {
  AgeBandPolicy,
  ResolvedAgeBand,
  ResolvedAgeBandPolicy,
} from "./age-band-policy";

export const REMINDER_CONSENT_BAND_KEYS = [
  "assisted",
  "guided",
  "independentYouth",
  "independentMajority",
] as const;
export type ReminderConsentBandKey = (typeof REMINDER_CONSENT_BAND_KEYS)[number];

export const PLAYER_REMINDER_MODES = [
  "GUARDIAN_CONSENTS",
  "PLAYER_OPT_IN",
  "PLAYER_CONSENTS",
  "OFF",
] as const;
export type PlayerReminderMode = (typeof PLAYER_REMINDER_MODES)[number];

export const PLAYER_REMINDER_CONSENT_STATES = [
  "ELIGIBLE",
  "OPTED_IN",
  "OPTED_OUT",
  "GUARDIAN_BLOCKED",
  "ASSISTED_GUARDIAN_GRANTED",
] as const;
export type PlayerReminderConsentState =
  (typeof PLAYER_REMINDER_CONSENT_STATES)[number];

export type ReminderConsentBandRow = {
  playerRemindersMode: PlayerReminderMode;
  /** Default for Guardian miss + Care Alert receives (send owned by JES-47). */
  guardianReceiveEnabled: boolean;
};

export type ReminderConsentPolicy = {
  assisted: ReminderConsentBandRow;
  guided: ReminderConsentBandRow;
  independentYouth: ReminderConsentBandRow;
  independentMajority: ReminderConsentBandRow;
};

/**
 * SPEC §5 defaults with JES-43 band vocabulary:
 * Independent youth = below adultMajorityAge; Independent majority = at/above.
 */
export const DEFAULT_REMINDER_CONSENT_POLICY: ReminderConsentPolicy = {
  assisted: {
    playerRemindersMode: "GUARDIAN_CONSENTS",
    guardianReceiveEnabled: true,
  },
  guided: {
    playerRemindersMode: "PLAYER_OPT_IN",
    guardianReceiveEnabled: true,
  },
  independentYouth: {
    playerRemindersMode: "PLAYER_CONSENTS",
    guardianReceiveEnabled: true,
  },
  independentMajority: {
    playerRemindersMode: "PLAYER_CONSENTS",
    guardianReceiveEnabled: false,
  },
};

const bandRowSchema = z.object({
  playerRemindersMode: z.enum(PLAYER_REMINDER_MODES),
  guardianReceiveEnabled: z.boolean(),
});

export const reminderConsentPolicySchema = z.object({
  assisted: bandRowSchema,
  guided: bandRowSchema,
  independentYouth: bandRowSchema,
  independentMajority: bandRowSchema,
});

export function parseReminderConsentPolicy(
  input: unknown
): ReminderConsentPolicy | null {
  const parsed = reminderConsentPolicySchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function resolveEffectiveReminderConsentPolicy(input: {
  teamPolicy: unknown;
}): { policy: ReminderConsentPolicy; source: "team" | "defaults" } {
  const teamParsed = parseReminderConsentPolicy(input.teamPolicy);
  if (teamParsed) {
    return { policy: teamParsed, source: "team" };
  }
  return { policy: { ...DEFAULT_REMINDER_CONSENT_POLICY }, source: "defaults" };
}

/**
 * Map resolved Age Band + age years to Reminder Consent matrix row.
 * UNASSIGNED uses Independent majority register (Player consents; layer off).
 */
export function reminderConsentBandKeyFor(
  ageBand: ResolvedAgeBand,
  ageYearsComplete: number | null,
  policy: AgeBandPolicy
): ReminderConsentBandKey {
  if (ageBand === "ASSISTED") {
    return "assisted";
  }
  if (ageBand === "GUIDED") {
    return "guided";
  }
  if (ageBand === "UNASSIGNED") {
    return "independentMajority";
  }
  // INDEPENDENT
  if (
    ageYearsComplete !== null &&
    ageYearsComplete < policy.adultMajorityAge
  ) {
    return "independentYouth";
  }
  return "independentMajority";
}

export type PushConsentUiMode =
  | "offer_opt_in"
  | "offer_assisted_adult"
  | "subscribed"
  | "blocked"
  | "needs_guardian_consent";

export type PushConsentDecision = {
  bandKey: ReminderConsentBandKey;
  mode: PlayerReminderMode;
  state: PlayerReminderConsentState;
  canSubscribe: boolean;
  canOptOut: boolean;
  uiMode: PushConsentUiMode;
  /** Policy default ∧ Parental Supervision active (for JES-47 consumers). */
  effectiveGuardianReceive: boolean;
  guardianReceivePolicyDefault: boolean;
};

export type ResolvePushConsentInput = {
  resolvedAge: Pick<
    ResolvedAgeBandPolicy,
    "ageBand" | "ageYearsComplete" | "parentalSupervisionActive" | "policy"
  >;
  reminderConsentPolicy: ReminderConsentPolicy;
  playerConsentState: PlayerReminderConsentState;
  hasActiveSubscription: boolean;
};

function playerMaySelfManage(mode: PlayerReminderMode): boolean {
  return mode === "PLAYER_OPT_IN" || mode === "PLAYER_CONSENTS";
}

/**
 * Resolve whether Player (or Assisted adult-helper device) may subscribe / opt out.
 */
export function resolvePushConsent(
  input: ResolvePushConsentInput
): PushConsentDecision {
  const bandKey = reminderConsentBandKeyFor(
    input.resolvedAge.ageBand,
    input.resolvedAge.ageYearsComplete,
    input.resolvedAge.policy
  );
  const row = input.reminderConsentPolicy[bandKey];
  const mode = row.playerRemindersMode;
  const state = input.playerConsentState;
  const subscribed = input.hasActiveSubscription;
  const guardianReceivePolicyDefault = row.guardianReceiveEnabled;
  const effectiveGuardianReceive =
    input.resolvedAge.parentalSupervisionActive && guardianReceivePolicyDefault;

  const base = {
    bandKey,
    mode,
    state,
    guardianReceivePolicyDefault,
    effectiveGuardianReceive,
  };

  if (mode === "OFF" || state === "GUARDIAN_BLOCKED") {
    return {
      ...base,
      canSubscribe: false,
      canOptOut: subscribed,
      uiMode: subscribed ? "subscribed" : "blocked",
    };
  }

  if (mode === "GUARDIAN_CONSENTS") {
    const guardianGranted =
      state === "ASSISTED_GUARDIAN_GRANTED" || state === "OPTED_IN";

    if (subscribed) {
      return {
        ...base,
        canSubscribe: false,
        canOptOut: true,
        uiMode: "subscribed",
      };
    }

    if (!guardianGranted) {
      return {
        ...base,
        canSubscribe: false,
        canOptOut: false,
        uiMode: "needs_guardian_consent",
      };
    }

    return {
      ...base,
      canSubscribe: true,
      canOptOut: false,
      uiMode: "offer_assisted_adult",
    };
  }

  // PLAYER_OPT_IN | PLAYER_CONSENTS
  if (subscribed) {
    return {
      ...base,
      canSubscribe: false,
      canOptOut: true,
      uiMode: "subscribed",
    };
  }

  if (!playerMaySelfManage(mode)) {
    return {
      ...base,
      canSubscribe: false,
      canOptOut: false,
      uiMode: "blocked",
    };
  }

  return {
    ...base,
    canSubscribe: true,
    canOptOut: false,
    uiMode: "offer_opt_in",
  };
}

/** State after a successful subscribe (Assisted adult or Player self). */
export function consentStateAfterSubscribe(
  previous: PlayerReminderConsentState
): PlayerReminderConsentState {
  if (previous === "GUARDIAN_BLOCKED") {
    return previous;
  }
  return "OPTED_IN";
}

/**
 * State after Player/adult opt-out that deletes PushSubscription.
 * Assisted keeps guardian-granted so adult may re-subscribe without re-capture.
 */
export function consentStateAfterOptOut(
  previous: PlayerReminderConsentState,
  mode: PlayerReminderMode
): PlayerReminderConsentState {
  if (previous === "GUARDIAN_BLOCKED") {
    return previous;
  }
  if (mode === "GUARDIAN_CONSENTS") {
    return "ASSISTED_GUARDIAN_GRANTED";
  }
  return "OPTED_OUT";
}

export const playerReminderConsentStateSchema = z.enum(
  PLAYER_REMINDER_CONSENT_STATES
);
