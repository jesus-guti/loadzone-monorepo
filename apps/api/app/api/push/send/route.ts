import { currentUser } from "@repo/auth/server";
import { database } from "@repo/database";
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
    const user = await currentUser();
    if (!user) {
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

    const targetTeamId =
      parsed.data.target === "team"
        ? parsed.data.targetId
        : (
            await database.player.findUnique({
              where: { id: parsed.data.targetId },
              select: { teamId: true },
            })
          )?.teamId;

    if (!targetTeamId) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const targetTeam = await database.team.findUnique({
      where: { id: targetTeamId },
      select: { clubId: true },
    });

    if (!targetTeam) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const hasAccess =
      user.platformRole === "SUPER_ADMIN" ||
      user.memberships.some(
        (membership) =>
          membership.clubId === targetTeam.clubId &&
          (membership.hasAllTeams || membership.teamIds.includes(targetTeamId))
      );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
