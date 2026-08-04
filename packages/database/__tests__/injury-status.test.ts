import { describe, expect, it, vi } from "vitest";
import {
  BODY_REGION_IDS,
  bodyRegionCatalog,
} from "../body-region-catalog";
import {
  derivePlayerStatusFromActiveInjuries,
  isInjuryActiveOnCivilDay,
  isPlayerStatusOverrideBlocked,
} from "../injury-status";
import {
  buildOrphanRegionDetail,
  mapLegacyBodyPartToRegions,
} from "../legacy-body-part-map";
import { createPlayerPainAlert } from "../pain-alert";
import catalogArtifact from "../body-region-catalog.json" with { type: "json" };

describe("isInjuryActiveOnCivilDay", () => {
  it("treats endDate as inclusive", () => {
    expect(isInjuryActiveOnCivilDay("2026-02-01", "2026-02-03", "2026-02-03")).toBe(
      true
    );
    expect(isInjuryActiveOnCivilDay("2026-02-01", "2026-02-03", "2026-02-04")).toBe(
      false
    );
  });

  it("treats null endDate as open", () => {
    expect(isInjuryActiveOnCivilDay("2026-02-01", null, "2026-08-01")).toBe(true);
    expect(isInjuryActiveOnCivilDay("2026-02-01", null, "2026-01-31")).toBe(false);
  });

  it("future-only open injury is not active today (edit must not lock/force INJURED)", () => {
    const today = "2026-08-04";
    const hasActive = isInjuryActiveOnCivilDay("2026-09-01", null, today);
    expect(hasActive).toBe(false);
    expect(
      isPlayerStatusOverrideBlocked({
        hasActiveInjury: hasActive,
        requestedStatus: "AVAILABLE",
      })
    ).toBe(false);
  });
});

describe("derivePlayerStatusFromActiveInjuries", () => {
  it("sets INJURED when ≥1 active", () => {
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: true,
        currentStatus: "AVAILABLE",
      })
    ).toBe("INJURED");
  });

  it("does not rewrite when already INJURED and still active", () => {
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: true,
        currentStatus: "INJURED",
      })
    ).toBeNull();
  });

  it("sets AVAILABLE on last close when status was INJURED", () => {
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: false,
        currentStatus: "INJURED",
      })
    ).toBe("AVAILABLE");
  });

  it("does not auto-change ILL / UNAVAILABLE / MODIFIED_TRAINING", () => {
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: false,
        currentStatus: "ILL",
      })
    ).toBeNull();
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: false,
        currentStatus: "UNAVAILABLE",
      })
    ).toBeNull();
    expect(
      derivePlayerStatusFromActiveInjuries({
        hasActiveInjury: false,
        currentStatus: "MODIFIED_TRAINING",
      })
    ).toBeNull();
  });
});

describe("isPlayerStatusOverrideBlocked", () => {
  it("blocks non-INJURED while an Injury is open", () => {
    expect(
      isPlayerStatusOverrideBlocked({
        hasActiveInjury: true,
        requestedStatus: "AVAILABLE",
      })
    ).toBe(true);
    expect(
      isPlayerStatusOverrideBlocked({
        hasActiveInjury: true,
        requestedStatus: "INJURED",
      })
    ).toBe(false);
  });

  it("allows any status when no active Injury", () => {
    expect(
      isPlayerStatusOverrideBlocked({
        hasActiveInjury: false,
        requestedStatus: "ILL",
      })
    ).toBe(false);
  });
});

describe("createPlayerPainAlert", () => {
  it("writes PainAlert only (client has no Injury surface)", async () => {
    const painAlertCreate = vi.fn().mockResolvedValue({
      id: "pa_1",
      bodyPart: "rodilla",
      side: null,
      injuryType: null,
      reportedAt: new Date("2026-08-04T12:00:00.000Z"),
    });

    const db = {
      painAlert: { create: painAlertCreate },
    };

    const result = await createPlayerPainAlert(db, {
      playerId: "player_1",
      teamId: "team_1",
      title: "Me duele la rodilla",
      bodyPart: "rodilla",
      severity: "MINOR",
    });

    expect(result.id).toBe("pa_1");
    expect(painAlertCreate).toHaveBeenCalledTimes(1);
    expect(painAlertCreate.mock.calls[0]?.[0]).toMatchObject({
      data: {
        playerId: "player_1",
        teamId: "team_1",
        title: "Me duele la rodilla",
        bodyPart: "rodilla",
        severity: "MINOR",
      },
    });
    // Structural: PainAlertWriteClient exposes only painAlert.create — no Injury write API.
    expect(db).not.toHaveProperty("injury");
  });
});

describe("body-region-catalog", () => {
  it("ids match artifact JSON and BODY_REGION_IDS (32)", () => {
    const artifactIds = catalogArtifact.regions.map((region) => region.id);
    expect(artifactIds).toHaveLength(32);
    expect([...BODY_REGION_IDS].sort()).toEqual([...artifactIds].sort());
    expect(bodyRegionCatalog.regions.map((region) => region.id).sort()).toEqual(
      [...artifactIds].sort()
    );
  });

  it("rejects OTHER and keeps regionDetail optional free text", () => {
    expect(bodyRegionCatalog.regionDetail.otherRegion).toBe(false);
    expect(bodyRegionCatalog.regionDetail.optionalFreeTextField).toBe(
      "regionDetail"
    );
  });
});

describe("mapLegacyBodyPartToRegions", () => {
  it("maps Spanish knee + LEFT to KNEE_L", () => {
    expect(mapLegacyBodyPartToRegions("Rodilla", "LEFT")).toEqual(["KNEE_L"]);
  });

  it("returns empty for unmappable parts (orphan path)", () => {
    expect(mapLegacyBodyPartToRegions("zona rara xyz", "LEFT")).toEqual([]);
    expect(
      buildOrphanRegionDetail({
        bodyPart: "zona rara xyz",
        side: "LEFT",
        injuryType: "contusion",
      })
    ).toBe("zona rara xyz · LEFT · contusion");
  });
});
