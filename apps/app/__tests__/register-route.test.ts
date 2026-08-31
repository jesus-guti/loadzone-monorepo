import { beforeEach, describe, expect, it, vi } from "vitest";

const { registerUserMock } = vi.hoisted(() => ({
  registerUserMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  registerUser: registerUserMock,
}));

import { POST } from "../app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    registerUserMock.mockReset();
  });

  it("rechaza payloads invalidos sin llamar a auth", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        name: "A",
        password: "123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(registerUserMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "El registro público no está disponible.",
    });
  });

  it("rechaza el registro publico aunque el body sea valido", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "coach@loadzone.app",
        name: "Coordinador",
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(registerUserMock).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "El registro público no está disponible.",
    });
  });
});
