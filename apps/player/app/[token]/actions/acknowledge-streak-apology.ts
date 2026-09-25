"use server";

import { database } from "@repo/database";

export async function acknowledgeStreakApology(
  token: string
): Promise<{ ok: boolean }> {
  try {
    const player = await database.player.findUnique({
      where: { token, isArchived: false },
      select: { id: true, streakApologyAcknowledgedAt: true },
    });

    if (!player) {
      return { ok: false };
    }

    if (!player.streakApologyAcknowledgedAt) {
      await database.player.update({
        where: { id: player.id },
        data: { streakApologyAcknowledgedAt: new Date() },
      });
    }

    return { ok: true };
  } catch {
    return { ok: false };
  }
}
