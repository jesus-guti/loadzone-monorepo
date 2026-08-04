import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_AGE_BAND_POLICY } from "@repo/database/age-band-policy";
import { DEFAULT_REMINDER_CONSENT_POLICY } from "@repo/database/reminder-consent";
import type { StaffContext } from "@/lib/auth-context";
import { parseAgeBandPolicyFromFormData } from "@/features/settings/lib/age-band-policy-form";
import { parseReminderConsentPolicyFromFormData } from "@/features/settings/lib/reminder-consent-policy-form";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  ensureBaseFormTemplates: vi.fn(),
  teamUpdate: vi.fn(),
  formAssignmentDeleteMany: vi.fn(),
  formAssignmentCreateMany: vi.fn(),
  clubUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: stubs.redirect,
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
  ACTIVE_TEAM_COOKIE_NAME: "active-team",
}));

vi.mock("@repo/database/bootstrap", () => ({
  ensureBaseFormTemplates: stubs.ensureBaseFormTemplates,
}));

vi.mock("@repo/database", () => {
  const Prisma = {
    DbNull: Symbol.for("DbNull"),
  };
  return {
    Prisma,
    database: {
      $transaction: stubs.transaction,
      club: {
        update: stubs.clubUpdate,
      },
    },
  };
});

// Import team settings actions via a dynamic path that avoids branding/storage.
// updateTeamSettings lives in team-settings.ts which also imports storage —
// mock storage before that import.
vi.mock("@repo/storage", () => ({
  buildObjectKey: vi.fn(),
  deleteObject: vi.fn(),
  uploadImage: vi.fn(),
}));

import { updateClubAgeBandPolicy } from "@/features/settings/actions/club-age-band-policy";
import { updateTeamSettings } from "@/features/settings/actions/team-settings";

function staffFixture(overrides?: Partial<StaffContext>): StaffContext {
  return {
    membershipId: "mem-1",
    canCreateTeam: true,
    club: {
      id: "club-1",
      name: "Club QA",
      logoUrl: null,
      ageBandPolicy: null,
    },
    activeTeam: {
      id: "team-1",
      name: "Juvenil",
      category: null,
      logoUrl: null,
      timezone: "Europe/Madrid",
      preSessionReminderMinutes: 120,
      postSessionReminderMinutes: 30,
      wellnessLimits: null,
      ageBandPolicyOverride: null,
      ageBandPolicy: DEFAULT_AGE_BAND_POLICY,
      ageBandPolicySource: "defaults",
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      reminderConsentPolicySource: "defaults",
    },
    ...overrides,
  } as StaffContext;
}

function appendReminderConsentDefaults(fd: FormData): void {
  fd.append(
    "rc_assisted_mode",
    DEFAULT_REMINDER_CONSENT_POLICY.assisted.playerRemindersMode
  );
  fd.append("rc_assisted_guardianReceive", "on");
  fd.append(
    "rc_guided_mode",
    DEFAULT_REMINDER_CONSENT_POLICY.guided.playerRemindersMode
  );
  fd.append("rc_guided_guardianReceive", "on");
  fd.append(
    "rc_independentYouth_mode",
    DEFAULT_REMINDER_CONSENT_POLICY.independentYouth.playerRemindersMode
  );
  fd.append("rc_independentYouth_guardianReceive", "on");
  fd.append(
    "rc_independentMajority_mode",
    DEFAULT_REMINDER_CONSENT_POLICY.independentMajority.playerRemindersMode
  );
}

function baseTeamForm(): FormData {
  const fd = new FormData();
  fd.append("timezone", "Europe/Madrid");
  fd.append("preSessionReminderMinutes", "120");
  fd.append("postSessionReminderMinutes", "30");
  fd.append(
    "age_assistedMaxAgeExclusive",
    String(DEFAULT_AGE_BAND_POLICY.assistedMaxAgeExclusive)
  );
  fd.append(
    "age_guidedMaxAgeExclusive",
    String(DEFAULT_AGE_BAND_POLICY.guidedMaxAgeExclusive)
  );
  fd.append(
    "age_adultMajorityAge",
    String(DEFAULT_AGE_BAND_POLICY.adultMajorityAge)
  );
  fd.append("age_guardianMissReceiveEnabled", "on");
  fd.append("age_guardianCareAlertReceiveEnabled", "on");
  appendReminderConsentDefaults(fd);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  stubs.transaction.mockImplementation(async (callback) =>
    callback({
      team: { update: stubs.teamUpdate },
      formAssignment: {
        deleteMany: stubs.formAssignmentDeleteMany,
        createMany: stubs.formAssignmentCreateMany,
      },
    })
  );
});

describe("parseAgeBandPolicyFromFormData", () => {
  it("parses contiguous cutoffs", () => {
    const fd = baseTeamForm();
    const result = parseAgeBandPolicyFromFormData(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.policy.guidedMaxAgeExclusive).toBe(14);
      expect(result.policy.independentYouthSupervisionEnabled).toBe(false);
    }
  });

  it("rejects non-contiguous cutoffs with Spanish error", () => {
    const fd = baseTeamForm();
    fd.set("age_assistedMaxAgeExclusive", "14");
    fd.set("age_guidedMaxAgeExclusive", "10");
    const result = parseAgeBandPolicyFromFormData(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/contiguos/i);
    }
  });
});

describe("updateTeamSettings Age Band auth + persistence", () => {
  it("rejects when there is no active team", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    await expect(updateTeamSettings(baseTeamForm())).rejects.toThrow(
      /Equipo no encontrado/
    );
  });

  it("persists Team override when inherit is off", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    const fd = baseTeamForm();
    fd.append("age_independentYouthSupervisionEnabled", "on");

    await expect(updateTeamSettings(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(stubs.teamUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "team-1" },
        data: expect.objectContaining({
          ageBandPolicy: expect.objectContaining({
            guidedMaxAgeExclusive: 14,
            independentYouthSupervisionEnabled: true,
          }),
        }),
      })
    );
  });

  it("clears Team override when inheriting Club defaults", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    const fd = baseTeamForm();
    fd.append("age_useClubDefaults", "on");

    await expect(updateTeamSettings(fd)).rejects.toThrow("NEXT_REDIRECT");

    const Prisma = await import("@repo/database").then((m) => m.Prisma);
    expect(stubs.teamUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ageBandPolicy: Prisma.DbNull,
        }),
      })
    );
  });

  it("rejects invalid Age Band ranges", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    const fd = baseTeamForm();
    fd.set("age_assistedMaxAgeExclusive", "20");
    fd.set("age_guidedMaxAgeExclusive", "10");

    await expect(updateTeamSettings(fd)).rejects.toThrow(/contiguos/i);
    expect(stubs.teamUpdate).not.toHaveBeenCalled();
  });

  it("persists Reminder Consent policy with Team settings", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    const fd = baseTeamForm();
    fd.set("rc_guided_mode", "OFF");
    fd.delete("rc_guided_guardianReceive");

    await expect(updateTeamSettings(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(stubs.teamUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reminderConsentPolicy: expect.objectContaining({
            guided: {
              playerRemindersMode: "OFF",
              guardianReceiveEnabled: false,
            },
            independentMajority: {
              playerRemindersMode: "PLAYER_CONSENTS",
              guardianReceiveEnabled: false,
            },
          }),
        }),
      })
    );
  });
});

describe("parseReminderConsentPolicyFromFormData", () => {
  it("parses SPEC defaults from form fields", () => {
    const result = parseReminderConsentPolicyFromFormData(baseTeamForm());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.policy).toEqual(DEFAULT_REMINDER_CONSENT_POLICY);
    }
  });
});

describe("updateClubAgeBandPolicy auth", () => {
  it("rejects staff without canCreateTeam", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(
      staffFixture({ canCreateTeam: false })
    );
    await expect(updateClubAgeBandPolicy(baseTeamForm())).rejects.toThrow(
      /permisos/
    );
    expect(stubs.clubUpdate).not.toHaveBeenCalled();
  });

  it("persists Club defaults for coordinators", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffFixture());
    await expect(updateClubAgeBandPolicy(baseTeamForm())).rejects.toThrow(
      "NEXT_REDIRECT"
    );
    expect(stubs.clubUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "club-1" },
        data: expect.objectContaining({
          ageBandPolicy: expect.objectContaining({
            adultMajorityAge: 16,
          }),
        }),
      })
    );
  });
});
