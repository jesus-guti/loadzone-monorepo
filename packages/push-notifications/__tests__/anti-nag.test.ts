import { describe, expect, it } from "vitest";
import {
  assertCanSendReminder,
  isAutomatedReminderDue,
  isInQuietHours,
  isObligationComplete,
  mayDeliverPlayerReminder,
  PLAYER_REMINDER_COPY,
  resolveDeferredInstant,
  utcInstantForLocalDateTime,
} from "../anti-nag";
import { DEFAULT_AGE_BAND_POLICY } from "@repo/database/age-band-policy";
import { DEFAULT_REMINDER_CONSENT_POLICY } from "@repo/database/reminder-consent";

const TZ = "Europe/Madrid";

describe("isInQuietHours / resolveDeferredInstant", () => {
  it("treats 22:00 as quiet and 08:00 as outside quiet", () => {
    const at2200 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 22, 0);
    const at0759 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 7, 59);
    const at0800 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 8, 0);
    const at2159 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 21, 59);

    expect(isInQuietHours(at2200, TZ)).toBe(true);
    expect(isInQuietHours(at0759, TZ)).toBe(true);
    expect(isInQuietHours(at0800, TZ)).toBe(false);
    expect(isInQuietHours(at2159, TZ)).toBe(false);
  });

  it("defers evening quiet target to next local 08:00", () => {
    const at2300 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 0);
    const deferred = resolveDeferredInstant(at2300, TZ);
    const expected = utcInstantForLocalDateTime(TZ, 2026, 8, 5, 8, 0);
    expect(deferred.getTime()).toBe(expected.getTime());
  });

  it("defers early-morning quiet target to same-day 08:00", () => {
    const at0100 = utcInstantForLocalDateTime(TZ, 2026, 8, 5, 1, 0);
    const deferred = resolveDeferredInstant(at0100, TZ);
    const expected = utcInstantForLocalDateTime(TZ, 2026, 8, 5, 8, 0);
    expect(deferred.getTime()).toBe(expected.getTime());
  });

  it("leaves daytime targets unchanged", () => {
    const at1500 = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 15, 0);
    expect(resolveDeferredInstant(at1500, TZ).getTime()).toBe(at1500.getTime());
  });
});

describe("isAutomatedReminderDue", () => {
  it("fires inside normal lookback outside quiet hours", () => {
    const target = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 16, 0);
    const now = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 16, 10);
    expect(
      isAutomatedReminderDue({ configuredTarget: target, now, timeZone: TZ })
    ).toBe(true);
  });

  it("does not fire during quiet hours even if lookback matches", () => {
    const target = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 0);
    const now = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 5);
    expect(
      isAutomatedReminderDue({ configuredTarget: target, now, timeZone: TZ })
    ).toBe(false);
  });

  it("fires deferred autos after quiet ends within catch-up window", () => {
    const target = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 0);
    const now = utcInstantForLocalDateTime(TZ, 2026, 8, 5, 8, 45);
    expect(
      isAutomatedReminderDue({ configuredTarget: target, now, timeZone: TZ })
    ).toBe(true);
  });

  it("does not fire deferred autos days later", () => {
    const target = utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 0);
    const now = utcInstantForLocalDateTime(TZ, 2026, 8, 6, 9, 0);
    expect(
      isAutomatedReminderDue({ configuredTarget: target, now, timeZone: TZ })
    ).toBe(false);
  });
});

describe("assertCanSendReminder caps", () => {
  const base = {
    now: utcInstantForLocalDateTime(TZ, 2026, 8, 4, 12, 0),
    timeZone: TZ,
    obligationComplete: false,
    mayDeliverByConsent: true,
  };

  it("blocks duplicate automated dispatch", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "AUTOMATED",
        hasOriginDispatch: true,
      })
    ).toEqual({ ok: false, reason: "already_dispatched" });
  });

  it("blocks duplicate staff re-nudge", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "STAFF_RE_NUDGE",
        hasOriginDispatch: true,
      })
    ).toEqual({ ok: false, reason: "already_dispatched" });
  });

  it("allows staff when only automated dispatch exists", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "STAFF_RE_NUDGE",
        hasOriginDispatch: false,
      })
    ).toEqual({ ok: true });
  });

  it("blocks completed obligations", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "AUTOMATED",
        hasOriginDispatch: false,
        obligationComplete: true,
      })
    ).toEqual({ ok: false, reason: "obligation_complete" });
  });

  it("blocks staff during quiet hours", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "STAFF_RE_NUDGE",
        hasOriginDispatch: false,
        now: utcInstantForLocalDateTime(TZ, 2026, 8, 4, 23, 30),
      })
    ).toEqual({ ok: false, reason: "quiet_hours" });
  });

  it("blocks when consent/subscription denies", () => {
    expect(
      assertCanSendReminder({
        ...base,
        origin: "AUTOMATED",
        hasOriginDispatch: false,
        mayDeliverByConsent: false,
      })
    ).toEqual({ ok: false, reason: "consent_denied" });
  });
});

describe("isObligationComplete / PRE vs POST", () => {
  it("treats PRE and POST independently", () => {
    expect(
      isObligationComplete({
        kind: "PRE_SESSION",
        preFilledAt: new Date(),
        postFilledAt: null,
      })
    ).toBe(true);
    expect(
      isObligationComplete({
        kind: "POST_SESSION",
        preFilledAt: new Date(),
        postFilledAt: null,
      })
    ).toBe(false);
  });
});

describe("mayDeliverPlayerReminder (JES-45 gate)", () => {
  const resolvedAge = {
    ageBand: "INDEPENDENT" as const,
    ageYearsComplete: 17,
    parentalSupervisionActive: false,
    policy: DEFAULT_AGE_BAND_POLICY,
  };

  it("requires an active subscription", () => {
    expect(
      mayDeliverPlayerReminder({
        resolvedAge,
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
        playerConsentState: "OPTED_IN",
        hasActiveSubscription: false,
      })
    ).toBe(false);
  });

  it("allows opted-in independent with subscription", () => {
    expect(
      mayDeliverPlayerReminder({
        resolvedAge,
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
        playerConsentState: "OPTED_IN",
        hasActiveSubscription: true,
      })
    ).toBe(true);
  });

  it("blocks guardian-blocked players", () => {
    expect(
      mayDeliverPlayerReminder({
        resolvedAge: {
          ...resolvedAge,
          ageBand: "ASSISTED",
          ageYearsComplete: 8,
        },
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
        playerConsentState: "GUARDIAN_BLOCKED",
        hasActiveSubscription: true,
      })
    ).toBe(false);
  });
});

describe("invitational copy", () => {
  it("uses cuando puedas and avoids care framing", () => {
    const body = PLAYER_REMINDER_COPY.PRE_SESSION.body("Entrenamiento");
    expect(body.toLowerCase()).toContain("cuando puedas");
    expect(body.toLowerCase()).not.toMatch(/cuidado|urgencia|lesion|racha/);
  });
});
