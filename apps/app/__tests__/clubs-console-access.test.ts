import { describe, expect, it } from "vitest";
import { clubsNavItem, mobilePrimaryNavigation } from "@/lib/admin-navigation";
import { clubsConsoleIsHidden } from "@/lib/clubs-console-access";

describe("clubs console access", () => {
  it("hides /clubs from anyone who is not a Super Admin", () => {
    expect(clubsConsoleIsHidden("USER")).toBe(true);
    expect(clubsConsoleIsHidden(null)).toBe(true);
    expect(clubsConsoleIsHidden("SUPER_ADMIN")).toBe(false);
  });

  it("keeps Clubes out of the three mobile primary tabs", () => {
    expect(mobilePrimaryNavigation.map((item) => item.href)).toEqual([
      "/wellness",
      "/sessions",
      "/carga",
    ]);
    expect(clubsNavItem.superAdminOnly).toBe(true);
    expect(clubsNavItem.href).toBe("/clubs");
  });
});
