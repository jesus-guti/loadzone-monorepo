import { describe, expect, it } from "vitest";

import {
  shouldCacheNextStaticAssets,
  shouldRegisterPlayerServiceWorker,
} from "../lib/player-sw-policy";

describe("player service worker policy", () => {
  it("does not register during next dev (avoids stale Turbopack CSS)", () => {
    expect(shouldRegisterPlayerServiceWorker("development")).toBe(false);
    expect(shouldRegisterPlayerServiceWorker("production")).toBe(true);
    expect(shouldRegisterPlayerServiceWorker("test")).toBe(true);
  });

  it("does not cache-first /_next on loopback hosts", () => {
    expect(shouldCacheNextStaticAssets("localhost")).toBe(false);
    expect(shouldCacheNextStaticAssets("127.0.0.1")).toBe(false);
    expect(shouldCacheNextStaticAssets("player.loadzone.app")).toBe(true);
  });
});
