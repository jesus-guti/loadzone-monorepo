import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MOBILE_SHELL_SCROLL_PB_CLASS } from "@/components/layouts/mobile-shell-chrome";

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

describe("mobile shell scroll padding", () => {
  it("pads the shell scroll area on mobile so content clears the footer bar", () => {
    expect(readLayout("sidebar.tsx")).toContain("MOBILE_SHELL_SCROLL_PB_CLASS");
    expect(readLayout("sidebar.tsx")).not.toContain("MobileSidebarFab");
    expect(readLayout("sidebar.tsx")).not.toContain("MobileSeasonFab");
    expect(MOBILE_SHELL_SCROLL_PB_CLASS).toContain("4.75rem");
    expect(MOBILE_SHELL_SCROLL_PB_CLASS).toContain("md:pb-0");
  });
});
