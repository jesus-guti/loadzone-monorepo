"use server";

import { database } from "@repo/database";
import { sendPushToPlayer } from "@repo/push-notifications";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ReminderResult = {
  targetedPlayers: number;
  sentNotifications: number;
  failedNotifications: number;
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

function formatReminderLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today.getTime() === date.getTime()) {
    return "hoy";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
  }).format(date);
}

export async function remindPendingWellnessPlayers(
  evaluatedDateValue: string
): Promise<ReminderResult> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("No autorizado.");
  }

  const evaluatedDate = parseDateValue(evaluatedDateValue);
  const pendingPlayers = await database.player.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
      isArchived: false,
    },
    select: {
      id: true,
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
        },
      },
    },
  });

  const playersToNotify = pendingPlayers.filter((player) => {
    const entry = player.entries[0];
    return !entry?.preFilledAt || !entry?.postFilledAt;
  });

  let sentNotifications = 0;
  let failedNotifications = 0;
  const dateLabel = formatReminderLabel(evaluatedDate);

  for (const player of playersToNotify) {
    const result = await sendPushToPlayer(player.id, {
      title: "Completa tu wellness",
      body: `Todavía tienes pendiente el wellness de ${dateLabel}. Te llevará muy poco tiempo.`,
      url: "/",
    });

    sentNotifications += result.sent;
    failedNotifications += result.failed;
  }

  return {
    targetedPlayers: playersToNotify.length,
    sentNotifications,
    failedNotifications,
  };
}
