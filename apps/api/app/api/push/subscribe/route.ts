import { database } from "@repo/database";
import { subscribePush } from "@repo/push-notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  token: z.string(),
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const player = await database.player.findUnique({
      where: { token: parsed.data.token, isArchived: false },
      select: { id: true },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    await subscribePush({
      playerId: player.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
