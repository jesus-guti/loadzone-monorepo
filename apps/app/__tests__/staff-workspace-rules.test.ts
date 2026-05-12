import { describe, expect, it } from "vitest";
import type { MembershipRole } from "@repo/database";
import {
  formatSeasonLabel,
  pickDefaultSeasonForDate,
  pickPreferredStaffMembership,
  resolveActiveTeamSnapshot,
  resolveSeasonFromCookie,
  staffCanCreateTeam,
} from "@/lib/staff-workspace-rules";

describe("staff-workspace-rules", () => {
  describe("pickPreferredStaffMembership", () => {
    it("returns null when there are no memberships", () => {
      expect(pickPreferredStaffMembership([])).toBeNull();
    });

    it("prefers the first coordinator or staff row over a later purely non-staff membership", () => {
      type Row = { id: string; role: MembershipRole };
      const memberships: Row[] = [
        { id: "m_player", role: "PLAYER" },
        { id: "m_staff", role: "STAFF" },
        { id: "m_coord", role: "COORDINATOR" },
      ];
      expect(pickPreferredStaffMembership(memberships)).toEqual(memberships[1]);
    });

    it("falls back to the sole membership even when role is not staff/coordinator", () => {
      const memberships = [{ role: "PLAYER" as const }];
      expect(pickPreferredStaffMembership(memberships)).toEqual(memberships[0]);
    });

    it("prefers coordinator when it appears before staff", () => {
      type Row = { role: MembershipRole };
      const memberships: Row[] = [
        { role: "COORDINATOR" },
        { role: "STAFF" },
      ];
      expect(pickPreferredStaffMembership(memberships)).toEqual(memberships[0]);
    });
  });

  describe("resolveActiveTeamSnapshot", () => {
    const teams = [{ id: "t1", name: "A" }, { id: "t2", name: "B" }];

    it("returns null for an empty club team list", () => {
      expect(resolveActiveTeamSnapshot([], null)).toBeNull();
    });

    it("honors cookie id when present", () => {
      expect(resolveActiveTeamSnapshot(teams, "t2")).toEqual(teams[1]);
    });

    it("falls back to first ordered team when cookie id unknown", () => {
      expect(resolveActiveTeamSnapshot(teams, "missing")).toEqual(teams[0]);
    });
  });

  describe("pickDefaultSeasonForDate", () => {
    const s2026 = {
      id: "s2026",
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-06-30T23:59:59Z"),
    };
    const sPrev = {
      id: "sprev",
      startDate: new Date("2025-07-01T00:00:00Z"),
      endDate: new Date("2025-12-31T23:59:59Z"),
    };

    it("prefers newest-first row that overlaps now", () => {
      const now = new Date("2026-03-01T12:00:00Z");
      expect(pickDefaultSeasonForDate([s2026, sPrev], now)).toEqual(s2026);
    });

    it("when no overlap, uses first season in caller order", () => {
      const now = new Date("2030-01-01T00:00:00Z");
      expect(pickDefaultSeasonForDate([s2026, sPrev], now)).toEqual(s2026);
    });

    it("returns null when seasons list empty", () => {
      expect(pickDefaultSeasonForDate([], new Date())).toBeNull();
    });
  });

  describe("resolveSeasonFromCookie", () => {
    const seasons = [{ id: "a" }, { id: "b" }];

    it("returns fallback when cookie absent", () => {
      expect(resolveSeasonFromCookie(seasons, null, seasons[1])).toEqual(seasons[1]);
    });

    it("matches cookie id when row exists", () => {
      expect(resolveSeasonFromCookie(seasons, "b", seasons[1])).toEqual(seasons[1]);
    });

    it("returns fallback when cookie id not in team seasons", () => {
      const fallback = seasons[0];
      expect(resolveSeasonFromCookie(seasons, "gone", fallback)).toEqual(fallback);
    });
  });

  describe("formatSeasonLabel", () => {
    it("compresses paired years when detectable", () => {
      expect(formatSeasonLabel("Temporada 2024 - 2025")).toBe("24/25");
    });

    it("returns raw name when no year pair", () => {
      expect(formatSeasonLabel("Liga abierta")).toBe("Liga abierta");
    });
  });

  describe("staffCanCreateTeam", () => {
    it("allows coordinator independently of platform role", () => {
      expect(staffCanCreateTeam("COORDINATOR", "USER")).toBe(true);
    });

    it("allows super admin even as non-coordinator membership", () => {
      expect(staffCanCreateTeam("STAFF", "SUPER_ADMIN")).toBe(true);
    });

    it("denies ordinary staff users", () => {
      expect(staffCanCreateTeam("STAFF", "USER")).toBe(false);
    });
  });
});
