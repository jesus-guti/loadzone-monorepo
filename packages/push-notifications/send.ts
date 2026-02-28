import "server-only";

import { database } from "@repo/database";
import webPush from "web-push";
import { keys } from "./keys";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

function getWebPush(): typeof webPush {
  const env = keys();

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    throw new Error("VAPID keys not configured");
  }

  webPush.setVapidDetails(
    `mailto:${env.VAPID_SUBJECT}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  return webPush;
}

export async function sendPushToPlayer(
  playerId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const push = getWebPush();

  const subscriptions = await database.pushSubscription.findMany({
    where: { playerId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await push.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (error) {
      failed++;
      if (
        error instanceof webPush.WebPushError &&
        (error.statusCode === 404 || error.statusCode === 410)
      ) {
        await database.pushSubscription.delete({
          where: { id: sub.id },
        });
      }
    }
  }

  return { sent, failed };
}

export async function sendPushToTeam(
  teamId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const players = await database.player.findMany({
    where: { teamId, isArchived: false },
    select: { id: true },
  });

  let totalSent = 0;
  let totalFailed = 0;

  for (const player of players) {
    const result = await sendPushToPlayer(player.id, payload);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { sent: totalSent, failed: totalFailed };
}
