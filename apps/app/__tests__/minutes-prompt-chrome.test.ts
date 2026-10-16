import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { shouldPromptMinutes } from "@/features/minutes/derive";

const appRoot = join(process.cwd());

function readAppFile(relativePath: string): string {
  return readFileSync(join(appRoot, relativePath), "utf8");
}

describe("minutes prompt chrome wiring", () => {
  it("does not mount the legacy top banner", () => {
    const layout = readAppFile("app/(authenticated)/layout.tsx");
    expect(layout).not.toContain("MinutesBanner");
    expect(layout).toContain("loadMinutesPromptState");
  });

  it("mounts sidebar minutes panel and mobile bubble", () => {
    const sidebar = readAppFile("components/layouts/sidebar.tsx");
    expect(sidebar).toContain("MinutesPromptPanel");
    expect(sidebar).toContain("MinutesPromptBubble");
    expect(sidebar).toContain("MinutesQuickDialog");
  });
});

describe("shouldPromptMinutes for matches", () => {
  it("clears when shared minutes are saved, regardless of lineup", () => {
    expect(
      shouldPromptMinutes({
        hour: 21,
        promptHour: 20,
        sessions: [
          {
            cancelled: false,
            type: "MATCH",
            sharedMinutes: 90,
            hasLineup: false,
          },
        ],
      })
    ).toBe(false);
    expect(
      shouldPromptMinutes({
        hour: 21,
        promptHour: 20,
        sessions: [
          {
            cancelled: false,
            type: "MATCH",
            sharedMinutes: null,
            hasLineup: true,
          },
        ],
      })
    ).toBe(true);
  });
});
