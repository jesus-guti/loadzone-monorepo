import { NextResponse } from "next/server";

const PUBLIC_REGISTER_CLOSED = "El registro público no está disponible.";

export async function POST(_request: Request): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: PUBLIC_REGISTER_CLOSED },
    { status: 403 }
  );
}
