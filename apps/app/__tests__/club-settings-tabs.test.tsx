import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/settings/club",
  search: "",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

import { ClubSettingsTabs } from "@/features/settings/components/club-settings-tabs";

afterEach(() => {
  cleanup();
  navigation.search = "";
  navigation.replace.mockReset();
});

describe("ClubSettingsTabs", () => {
  it("shows Club and Usuarios tabs", () => {
    render(
      <ClubSettingsTabs
        clubPanel={<p>Marca del club</p>}
        usersPanel={<p>Gestión de usuarios</p>}
      />
    );
    expect(screen.getByRole("tab", { name: "Club" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Usuarios" })).toBeTruthy();
    expect(screen.getByText("Marca del club")).toBeTruthy();
  });

  it("opens the Usuarios panel when tab=usuarios", () => {
    navigation.search = "tab=usuarios";
    render(
      <ClubSettingsTabs
        clubPanel={<p>Marca del club</p>}
        usersPanel={<p>Gestión de usuarios</p>}
      />
    );
    expect(screen.getByText("Gestión de usuarios")).toBeTruthy();
  });
});
