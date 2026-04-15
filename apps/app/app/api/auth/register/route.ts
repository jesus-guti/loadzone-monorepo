import { registerUser } from "@repo/auth/server";
import { NextResponse } from "next/server";

type RegisterBody = {
  email?: string;
  name?: string;
  password?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RegisterBody;

    const result = await registerUser({
      email: body.email ?? "",
      name: body.name ?? "",
      password: body.password ?? "",
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
