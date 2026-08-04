import { beforeEach, describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
  findUnique: vi.fn(),
  playerUpdate: vi.fn(),
  subscribePush: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  database: {
    player: {
      findUnique: stubs.findUnique,
      update: stubs.playerUpdate,
    },
  },
}));

vi.mock("@repo/push-notifications", () => ({
  subscribePush: stubs.subscribePush,
}));

import { POST } from "../app/api/push/subscribe/route";

function playerRow(overrides?: {
  reminderConsentState?: string;
  ageBandOverride?: "ASSISTED" | "GUIDED" | "INDEPENDENT" | null;
  dateOfBirth?: Date | null;
}) {
  return {
    id: "player-1",
    dateOfBirth: overrides?.dateOfBirth ?? new Date("2018-01-15T12:00:00.000Z"),
    ageBandOverride: overrides?.ageBandOverride ?? null,
    reminderConsentState: overrides?.reminderConsentState ?? "ELIGIBLE",
    team: {
      timezone: "Europe/Madrid",
      ageBandPolicy: null,
      reminderConsentPolicy: null,
      club: { ageBandPolicy: null },
    },
  };
}

function subscribeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  token: "tok-secret",
  endpoint: "https://push.example/endpoint",
  p256dh: "p256",
  auth: "auth",
};

beforeEach(() => {
  vi.clearAllMocks();
  stubs.subscribePush.mockResolvedValue(undefined);
  stubs.playerUpdate.mockResolvedValue({});
});

describe("POST /api/push/subscribe consent gate", () => {
  it("rejects Assisted without guardian grant (403)", async () => {
    stubs.findUnique.mockResolvedValue(
      playerRow({
        ageBandOverride: "ASSISTED",
        reminderConsentState: "ELIGIBLE",
      })
    );

    const response = await POST(subscribeRequest(validBody));
    expect(response.status).toBe(403);
    const json = (await response.json()) as { error?: string };
    expect(json.error).not.toMatch(/tok-secret/);
    expect(stubs.subscribePush).not.toHaveBeenCalled();
  });

  it("allows Assisted after staff guardian grant", async () => {
    stubs.findUnique.mockResolvedValue(
      playerRow({
        ageBandOverride: "ASSISTED",
        reminderConsentState: "ASSISTED_GUARDIAN_GRANTED",
      })
    );

    const response = await POST(subscribeRequest(validBody));
    expect(response.status).toBe(200);
    expect(stubs.subscribePush).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: "player-1" })
    );
    expect(stubs.playerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { reminderConsentState: "OPTED_IN" },
      })
    );
  });

  it("rejects Guided when supervision-revoked", async () => {
    stubs.findUnique.mockResolvedValue(
      playerRow({
        ageBandOverride: "GUIDED",
        reminderConsentState: "GUARDIAN_BLOCKED",
      })
    );

    const response = await POST(subscribeRequest(validBody));
    expect(response.status).toBe(403);
    expect(stubs.subscribePush).not.toHaveBeenCalled();
  });

  it("allows Independent Player opt-in", async () => {
    stubs.findUnique.mockResolvedValue(
      playerRow({
        ageBandOverride: "INDEPENDENT",
        dateOfBirth: new Date("2008-01-15T12:00:00.000Z"),
        reminderConsentState: "ELIGIBLE",
      })
    );

    const response = await POST(subscribeRequest(validBody));
    expect(response.status).toBe(200);
    expect(stubs.subscribePush).toHaveBeenCalled();
  });

  it("never echoes player token in 404 body", async () => {
    stubs.findUnique.mockResolvedValue(null);
    const response = await POST(subscribeRequest(validBody));
    expect(response.status).toBe(404);
    const text = await response.text();
    expect(text).not.toContain("tok-secret");
  });
});
