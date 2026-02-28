import "server-only";

import { database } from "@repo/database";

type SubscriptionPayload = {
  playerId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function subscribePush(
  payload: SubscriptionPayload
): Promise<void> {
  await database.pushSubscription.upsert({
    where: { endpoint: payload.endpoint },
    create: {
      playerId: payload.playerId,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
    },
    update: {
      p256dh: payload.p256dh,
      auth: payload.auth,
    },
  });
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  await database.pushSubscription.delete({
    where: { endpoint },
  });
}
