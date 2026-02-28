import { auth } from "@repo/auth/server";
import { sendPushToPlayer, sendPushToTeam } from "@repo/push-notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
  target: z.enum(["player", "team"]),
  targetId: z.string(),
  title: z.string(),
  body: z.string(),
  url: z.string().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const payload = {
      title: parsed.data.title,
      body: parsed.data.body,
      url: parsed.data.url,
    };

    const result =
      parsed.data.target === "player"
        ? await sendPushToPlayer(parsed.data.targetId, payload)
        : await sendPushToTeam(parsed.data.targetId, payload);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
