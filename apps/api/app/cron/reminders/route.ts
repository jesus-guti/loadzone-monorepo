import { database } from "@repo/database";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "@repo/database/age-band-policy";
import {
  resolveEffectiveReminderConsentPolicy,
  type PlayerReminderConsentState,
} from "@repo/database/reminder-consent";
import {
  PLAYER_REMINDER_COPY,
  assertCanSendReminder,
  isAutomatedReminderDue,
  isObligationComplete,
  mayDeliverPlayerReminder,
  sendPushToPlayer,
  type ReminderDispatchKind,
} from "@repo/push-notifications";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LOOKBACK_MS = 15 * 60 * 1000;

async function dispatchReminderForPlayers(input: {
  playerIds: string[];
  teamSessionId: string;
  kind: ReminderDispatchKind;
  sessionTitle: string;
  timeZone: string;
  now: Date;
  sessionDate: Date;
}): Promise<number> {
  let sent = 0;
  const copy = PLAYER_REMINDER_COPY[input.kind];
  const payload = {
    title: copy.title,
    body: copy.body(input.sessionTitle),
    url: "/",
  };

  for (const playerId of input.playerIds) {
    const player = await database.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        dateOfBirth: true,
        ageBandOverride: true,
        reminderConsentState: true,
        team: {
          select: {
            timezone: true,
            ageBandPolicy: true,
            reminderConsentPolicy: true,
            club: { select: { ageBandPolicy: true } },
          },
        },
        subscriptions: { select: { id: true }, take: 1 },
        entries: {
          where: { date: input.sessionDate },
          take: 1,
          select: {
            preFilledAt: true,
            postFilledAt: true,
          },
        },
        pushDispatches: {
          where: {
            teamSessionId: input.teamSessionId,
            kind: input.kind,
            origin: "AUTOMATED",
          },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!player) {
      continue;
    }

    const timeZone = input.timeZone || player.team.timezone || "Europe/Madrid";
    const entry = player.entries[0];
    const effectiveAgePolicy = resolveEffectiveAgeBandPolicy({
      teamPolicy: player.team.ageBandPolicy,
      clubPolicy: player.team.club.ageBandPolicy,
    });
    const resolvedAge = resolveAgeBandPolicy({
      policy: effectiveAgePolicy.policy,
      policySource: effectiveAgePolicy.source,
      dateOfBirth: player.dateOfBirth,
      ageBandOverride: player.ageBandOverride,
      teamTimezone: player.team.timezone,
      now: input.now,
    });
    const { policy: reminderConsentPolicy } =
      resolveEffectiveReminderConsentPolicy({
        teamPolicy: player.team.reminderConsentPolicy,
      });

    const gate = assertCanSendReminder({
      origin: "AUTOMATED",
      now: input.now,
      timeZone,
      obligationComplete: isObligationComplete({
        kind: input.kind,
        preFilledAt: entry?.preFilledAt,
        postFilledAt: entry?.postFilledAt,
      }),
      hasOriginDispatch: player.pushDispatches.length > 0,
      mayDeliverByConsent: mayDeliverPlayerReminder({
        resolvedAge,
        reminderConsentPolicy,
        playerConsentState:
          player.reminderConsentState as PlayerReminderConsentState,
        hasActiveSubscription: player.subscriptions.length > 0,
      }),
    });

    if (!gate.ok) {
      continue;
    }

    const result = await sendPushToPlayer(playerId, payload);
    if (result.sent > 0) {
      await database.pushDispatch.create({
        data: {
          teamSessionId: input.teamSessionId,
          playerId,
          kind: input.kind,
          origin: "AUTOMATED",
        },
      });
      sent += result.sent;
    }
  }

  return sent;
}

function sessionCalendarDate(startsAt: Date, timeZone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const ymd = formatter.format(startsAt);
  return new Date(`${ymd}T00:00:00.000Z`);
}

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
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
      timezone: true,
      appliesToAllPlayers: true,
      team: {
        select: {
          timezone: true,
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

    const timeZone = session.timezone || session.team.timezone || "Europe/Madrid";
    const sessionDate = sessionCalendarDate(session.startsAt, timeZone);

    if (session.preReminderMinutes != null) {
      const preTarget = new Date(
        session.startsAt.getTime() - session.preReminderMinutes * 60 * 1000
      );

      if (
        isAutomatedReminderDue({
          configuredTarget: preTarget,
          now,
          timeZone,
          lookbackMs: LOOKBACK_MS,
        })
      ) {
        totalSent += await dispatchReminderForPlayers({
          playerIds,
          teamSessionId: session.id,
          kind: "PRE_SESSION",
          sessionTitle: session.title,
          timeZone,
          now,
          sessionDate,
        });
      }
    }

    if (session.postReminderMinutes != null) {
      const postTarget = new Date(
        session.endsAt.getTime() + session.postReminderMinutes * 60 * 1000
      );

      if (
        isAutomatedReminderDue({
          configuredTarget: postTarget,
          now,
          timeZone,
          lookbackMs: LOOKBACK_MS,
        })
      ) {
        totalSent += await dispatchReminderForPlayers({
          playerIds,
          teamSessionId: session.id,
          kind: "POST_SESSION",
          sessionTitle: session.title,
          timeZone,
          now,
          sessionDate,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    processedSessions: sessions.length,
    sent: totalSent,
  });
}
