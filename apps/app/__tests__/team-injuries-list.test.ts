import { describe, expect, it } from "vitest";
import {
  filterOpenPainAlerts,
  isOpenInjury,
  isOpenPainAlert,
  partitionInjuriesByOpenClosed,
  playerProfileHref,
  sortClosedInjuriesNewestFirst,
  sortOpenInjuriesNewestFirst,
  takeSectionCap,
} from "@/features/injuries/lib/team-injuries-list";
import type { TeamInjuryListItem } from "@/features/injuries/types";

function injury(
  overrides: Partial<TeamInjuryListItem> &
    Pick<TeamInjuryListItem, "id" | "endDate" | "startDate">
): TeamInjuryListItem {
  return {
    playerId: "p1",
    playerName: "Jugador",
    cause: "Esguince",
    regionLabels: ["Tobillo derecho"],
    regionDetail: null,
    ...overrides,
  };
}

describe("isOpenInjury / partitionInjuriesByOpenClosed", () => {
  it("treats null endDate as open and set endDate as closed", () => {
    expect(isOpenInjury(null)).toBe(true);
    expect(isOpenInjury("2026-08-01")).toBe(false);
  });

  it("splits open vs closed Injuries without mixing ids", () => {
    const rows = [
      injury({ id: "open-1", startDate: "2026-08-01", endDate: null }),
      injury({
        id: "closed-1",
        startDate: "2026-07-01",
        endDate: "2026-07-15",
      }),
      injury({ id: "open-2", startDate: "2026-08-02", endDate: null }),
    ];

    const { open, closed } = partitionInjuriesByOpenClosed(rows);

    expect(open.map((row) => row.id)).toEqual(["open-1", "open-2"]);
    expect(closed.map((row) => row.id)).toEqual(["closed-1"]);
    expect(open.every((row) => row.endDate === null)).toBe(true);
    expect(closed.every((row) => row.endDate !== null)).toBe(true);
  });

  it("sorts Activas by startDate desc and Histórico by endDate desc", () => {
    const openSorted = sortOpenInjuriesNewestFirst([
      injury({ id: "a", startDate: "2026-07-01", endDate: null }),
      injury({ id: "b", startDate: "2026-08-01", endDate: null }),
    ]);
    expect(openSorted.map((row) => row.id)).toEqual(["b", "a"]);

    const closedSorted = sortClosedInjuriesNewestFirst([
      injury({
        id: "old",
        startDate: "2026-05-01",
        endDate: "2026-05-20",
      }),
      injury({
        id: "new",
        startDate: "2026-06-01",
        endDate: "2026-07-01",
      }),
    ]);
    expect(closedSorted.map((row) => row.id)).toEqual(["new", "old"]);
  });
});

describe("Pain Alert triage vs Injury SoT", () => {
  it("keeps only unpromoted Pain Alerts in the triage queue", () => {
    expect(isOpenPainAlert(null)).toBe(true);
    expect(isOpenPainAlert("injury-1")).toBe(false);

    const filtered = filterOpenPainAlerts([
      { id: "alert-open", promotedInjuryId: null },
      { id: "alert-promoted", promotedInjuryId: "injury-9" },
    ]);

    expect(filtered.map((row) => row.id)).toEqual(["alert-open"]);
  });

  it("does not place Pain Alert ids into Injury partitions", () => {
    const injuries = [
      injury({ id: "injury-1", startDate: "2026-08-01", endDate: null }),
    ];
    const alerts = [{ id: "alert-1", promotedInjuryId: null }];

    const { open, closed } = partitionInjuriesByOpenClosed(injuries);
    const openAlerts = filterOpenPainAlerts(alerts);

    const injuryIds = new Set([
      ...open.map((row) => row.id),
      ...closed.map((row) => row.id),
    ]);
    const alertIds = new Set(openAlerts.map((row) => row.id));

    for (const alertId of alertIds) {
      expect(injuryIds.has(alertId)).toBe(false);
    }
    expect(injuryIds.has("injury-1")).toBe(true);
    expect(alertIds.has("alert-1")).toBe(true);
  });
});

describe("playerProfileHref", () => {
  it("links rows to the player profile by player id", () => {
    expect(playerProfileHref("player-abc")).toBe("/players/player-abc");
  });
});

describe("takeSectionCap", () => {
  it("caps section length", () => {
    const ids = Array.from({ length: 60 }, (_, index) => `id-${index}`);
    expect(takeSectionCap(ids, 50)).toHaveLength(50);
    expect(takeSectionCap(ids, 50)[0]).toBe("id-0");
  });
});
