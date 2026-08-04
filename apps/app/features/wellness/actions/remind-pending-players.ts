"use server";

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
  STAFF_QUIET_HOURS_MESSAGE,
  assertCanSendReminder,
  isInQuietHours,
  isObligationComplete,
  mayDeliverPlayerReminder,
  sendPushToPlayer,
  type ReminderDispatchKind,
} from "@repo/push-notifications";
import { getCurrentStaffContext } from "@/lib/auth-context";

export type ReminderResult = {
  targetedPlayers: number;
  sentNotifications: number;
  failedNotifications: number;
  skippedAlreadyNudged: number;
  skippedNoSession: number;
  blockedReason?: "quiet_hours";
  blockedMessage?: string;
};

function parseDateValue(dateValue: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error("Fecha no válida.");
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Fecha no válida.");
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

function localYmd(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

type SessionCandidate = {
  id: string;
  title: string;
  timezone: string;
  startsAt: Date;
  appliesToAllPlayers: boolean;
  playerLinkIds: Set<string>;
};

function resolveSessionForPlayer(
  playerId: string,
  entryTeamSessionId: string | null | undefined,
  sessionsOnDate: SessionCandidate[]
): SessionCandidate | null {
  if (entryTeamSessionId) {
    const linked = sessionsOnDate.find(
      (session) => session.id === entryTeamSessionId
    );
    if (linked) {
      return linked;
    }
  }

  const matching = sessionsOnDate.filter((session) =>
    session.appliesToAllPlayers
      ? true
      : session.playerLinkIds.has(playerId)
  );

  if (matching.length === 0) {
    return null;
  }

  return matching[0] ?? null;
}

function owedKinds(input: {
  preFilledAt: Date | null | undefined;
  postFilledAt: Date | null | undefined;
}): ReminderDispatchKind[] {
  const kinds: ReminderDispatchKind[] = [];
  if (
    !isObligationComplete({
      kind: "PRE_SESSION",
      preFilledAt: input.preFilledAt,
      postFilledAt: input.postFilledAt,
    })
  ) {
    kinds.push("PRE_SESSION");
  }
  if (
    !isObligationComplete({
      kind: "POST_SESSION",
      preFilledAt: input.preFilledAt,
      postFilledAt: input.postFilledAt,
    })
  ) {
    kinds.push("POST_SESSION");
  }
  return kinds;
}

export async function remindPendingWellnessPlayers(
  evaluatedDateValue: string
): Promise<ReminderResult> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("No autorizado.");
  }

  const evaluatedDate = parseDateValue(evaluatedDateValue);
  const teamTimezone = staffContext.activeTeam.timezone || "Europe/Madrid";
  const now = new Date();
  const evaluatedYmd = evaluatedDateValue;

  const dayStart = new Date(evaluatedDate.getTime() - 14 * 60 * 60 * 1000);
  const dayEnd = new Date(evaluatedDate.getTime() + 38 * 60 * 60 * 1000);

  const teamSessions = await database.teamSession.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
      startsAt: { gte: dayStart, lte: dayEnd },
    },
    select: {
      id: true,
      title: true,
      timezone: true,
      startsAt: true,
      appliesToAllPlayers: true,
      playerLinks: { select: { playerId: true } },
    },
  });

  const sessionsOnDate: SessionCandidate[] = teamSessions
    .filter((session) => {
      const tz = session.timezone || teamTimezone;
      return localYmd(session.startsAt, tz) === evaluatedYmd;
    })
    .map((session) => ({
      id: session.id,
      title: session.title,
      timezone: session.timezone || teamTimezone,
      startsAt: session.startsAt,
      appliesToAllPlayers: session.appliesToAllPlayers,
      playerLinkIds: new Set(
        session.playerLinks.map((link) => link.playerId)
      ),
    }));

  // Quiet hours: block the whole staff action (no silent send / no queue).
  const quietSampleTz =
    sessionsOnDate[0]?.timezone ?? teamTimezone;
  if (isInQuietHours(now, quietSampleTz)) {
    return {
      targetedPlayers: 0,
      sentNotifications: 0,
      failedNotifications: 0,
      skippedAlreadyNudged: 0,
      skippedNoSession: 0,
      blockedReason: "quiet_hours",
      blockedMessage: STAFF_QUIET_HOURS_MESSAGE,
    };
  }

  const pendingPlayers = await database.player.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
      isArchived: false,
    },
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
        where: staffContext.activeSeason
          ? {
              seasonId: staffContext.activeSeason.id,
              date: evaluatedDate,
            }
          : {
              date: evaluatedDate,
            },
        take: 1,
        select: {
          preFilledAt: true,
          postFilledAt: true,
          teamSessionId: true,
        },
      },
      pushDispatches: {
        where: {
          origin: "STAFF_RE_NUDGE",
          teamSessionId: { in: sessionsOnDate.map((s) => s.id) },
        },
        select: {
          teamSessionId: true,
          kind: true,
        },
      },
    },
  });

  const playersToNotify = pendingPlayers.filter((player) => {
    const entry = player.entries[0];
    return owedKinds({
      preFilledAt: entry?.preFilledAt,
      postFilledAt: entry?.postFilledAt,
    }).length > 0;
  });

  let sentNotifications = 0;
  let failedNotifications = 0;
  let skippedAlreadyNudged = 0;
  let skippedNoSession = 0;

  for (const player of playersToNotify) {
    const entry = player.entries[0];
    const session = resolveSessionForPlayer(
      player.id,
      entry?.teamSessionId,
      sessionsOnDate
    );

    if (!session) {
      skippedNoSession += 1;
      failedNotifications += 1;
      continue;
    }

    const kinds = owedKinds({
      preFilledAt: entry?.preFilledAt,
      postFilledAt: entry?.postFilledAt,
    });

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
      now,
    });
    const { policy: reminderConsentPolicy } =
      resolveEffectiveReminderConsentPolicy({
        teamPolicy: player.team.reminderConsentPolicy,
      });
    const consentOk = mayDeliverPlayerReminder({
      resolvedAge,
      reminderConsentPolicy,
      playerConsentState:
        player.reminderConsentState as PlayerReminderConsentState,
      hasActiveSubscription: player.subscriptions.length > 0,
    });

    for (const kind of kinds) {
      const hasStaffDispatch = player.pushDispatches.some(
        (dispatch) =>
          dispatch.teamSessionId === session.id && dispatch.kind === kind
      );

      const gate = assertCanSendReminder({
        origin: "STAFF_RE_NUDGE",
        now,
        timeZone: session.timezone,
        obligationComplete: false,
        hasOriginDispatch: hasStaffDispatch,
        mayDeliverByConsent: consentOk,
      });

      if (!gate.ok) {
        if (gate.reason === "already_dispatched") {
          skippedAlreadyNudged += 1;
        } else if (gate.reason === "consent_denied") {
          failedNotifications += 1;
        }
        continue;
      }

      const copy = PLAYER_REMINDER_COPY[kind];
      const result = await sendPushToPlayer(player.id, {
        title: copy.title,
        body: copy.body(session.title),
        url: "/",
      });

      if (result.sent > 0) {
        await database.pushDispatch.create({
          data: {
            teamSessionId: session.id,
            playerId: player.id,
            kind,
            origin: "STAFF_RE_NUDGE",
          },
        });
        sentNotifications += result.sent;
      } else {
        failedNotifications += result.failed > 0 ? result.failed : 1;
      }
    }
  }

  return {
    targetedPlayers: playersToNotify.length,
    sentNotifications,
    failedNotifications,
    skippedAlreadyNudged,
    skippedNoSession,
  };
}
