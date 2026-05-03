import { registerUser } from "@repo/auth/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerBodySchema = z.object({
  email: z.string().email("El email no es válido."),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const json = await request.json();
    const parsed = registerBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "No se pudo crear la cuenta.",
        },
        { status: 400 }
      );
    }

    const result = await registerUser({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
    });

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error ?? "No se pudo crear la cuenta." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, userId: result.userId });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
}
