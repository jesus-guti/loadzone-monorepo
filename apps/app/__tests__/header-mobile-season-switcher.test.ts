import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MOBILE_SHELL_FAB_BOTTOM_CLASS,
  MOBILE_SHELL_SCROLL_PB_CLASS,
} from "@/components/layouts/mobile-shell-chrome";

const layoutsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../components/layouts"
);

function readLayout(name: string): string {
  return readFileSync(join(layoutsDir, name), "utf8");
}

describe("staff Header compact chrome", () => {
  it("does not put the Season switcher in the md:hidden header", () => {
    const compactBlock = readLayout("header.tsx").split("md:hidden")[1] ?? "";
    expect(compactBlock).not.toContain("ActiveSeasonSwitcher");
  });
});

describe("mobile shell FABs and scroll padding", () => {
  it("keeps sidebar and season FABs on the same bottom offset", () => {
    expect(readLayout("mobile-sidebar-fab.tsx")).toContain(
      "MOBILE_SHELL_FAB_BOTTOM_CLASS"
    );
    expect(readLayout("mobile-season-fab.tsx")).toContain(
      "MOBILE_SHELL_FAB_BOTTOM_CLASS"
    );
    expect(MOBILE_SHELL_FAB_BOTTOM_CLASS).toContain("4.5rem");
  });

  it("pads the shell scroll area on mobile so content clears the FABs", () => {
    expect(readLayout("sidebar.tsx")).toContain("MOBILE_SHELL_SCROLL_PB_CLASS");
    expect(MOBILE_SHELL_SCROLL_PB_CLASS).toContain("8.25rem");
    expect(MOBILE_SHELL_SCROLL_PB_CLASS).toContain("md:pb-0");
  });
});
