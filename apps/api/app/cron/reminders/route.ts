import { database } from "@repo/database";
import { sendPushToPlayer } from "@repo/push-notifications";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ReminderKind = "PRE_SESSION" | "POST_SESSION";

function isWithinDispatchWindow(
  targetDate: Date,
  now: Date,
  windowMs: number
): boolean {
  const diff = now.getTime() - targetDate.getTime();
  return diff >= 0 && diff <= windowMs;
}

async function dispatchReminderForPlayers(
  playerIds: string[],
  teamSessionId: string,
  kind: ReminderKind,
  payload: { title: string; body: string; url: string }
): Promise<number> {
  let sent = 0;

  for (const playerId of playerIds) {
    const existingDispatch = await database.pushDispatch.findUnique({
      where: {
        teamSessionId_playerId_kind: {
          teamSessionId,
          playerId,
          kind,
        },
      },
      select: { id: true },
    });

    if (existingDispatch) {
      continue;
    }

    const result = await sendPushToPlayer(playerId, payload);
    if (result.sent > 0) {
      await database.pushDispatch.create({
        data: {
          teamSessionId,
          playerId,
          kind,
        },
      });
      sent += result.sent;
    }
  }

  return sent;
}

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lookbackWindowMs = 15 * 60 * 1000;
  const horizon = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const sessions = await database.teamSession.findMany({
    where: {
      status: "SCHEDULED",
      startsAt: {
        lte: horizon,
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      appliesToAllPlayers: true,
      team: {
        select: {
          players: {
            where: { isArchived: false },
            select: { id: true },
          },
        },
      },
      playerLinks: {
        select: {
          playerId: true,
        },
      },
      preReminderMinutes: true,
      postReminderMinutes: true,
    },
  });

  let totalSent = 0;

  for (const session of sessions) {
    const playerIds = session.appliesToAllPlayers
      ? session.team.players.map((player) => player.id)
      : session.playerLinks.map((playerLink) => playerLink.playerId);

    if (playerIds.length === 0) {
      continue;
    }

    if (session.preReminderMinutes != null) {
      const preTarget = new Date(
        session.startsAt.getTime() - session.preReminderMinutes * 60 * 1000
      );

      if (isWithinDispatchWindow(preTarget, now, lookbackWindowMs)) {
        totalSent += await dispatchReminderForPlayers(
          playerIds,
          session.id,
          "PRE_SESSION",
          {
            title: "Recuerda tu pre-sesión",
            body: `Tienes "${session.title}" pronto. Completa tu check-in previo.`,
            url: "/",
          }
        );
      }
    }

    if (session.postReminderMinutes != null) {
      const postTarget = new Date(
        session.endsAt.getTime() + session.postReminderMinutes * 60 * 1000
      );

      if (isWithinDispatchWindow(postTarget, now, lookbackWindowMs)) {
        totalSent += await dispatchReminderForPlayers(
          playerIds,
          session.id,
          "POST_SESSION",
          {
            title: "Completa tu post-sesión",
            body: `Ya puedes rellenar el registro posterior de "${session.title}".`,
            url: "/",
          }
        );
      }
    }
  }

  return NextResponse.json({
    success: true,
    processedSessions: sessions.length,
    sent: totalSent,
  });
}
