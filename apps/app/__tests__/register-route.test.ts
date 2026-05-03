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

  it("rechaza payloads invalidos antes de llamar a auth", async () => {
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

    expect(response.status).toBe(400);
    expect(registerUserMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "El email no es válido.",
    });
  });

  it("registra al usuario cuando el body es valido", async () => {
    registerUserMock.mockResolvedValue({
      success: true,
      userId: "user_123",
    });

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

    expect(registerUserMock).toHaveBeenCalledWith({
      email: "coach@loadzone.app",
      name: "Coordinador",
      password: "password123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      userId: "user_123",
    });
  });
});
