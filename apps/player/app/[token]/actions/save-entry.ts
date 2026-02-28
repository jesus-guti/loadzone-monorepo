"use server";

import { database } from "@repo/database";
import { z } from "zod";

const preSessionSchema = z.object({
  token: z.string(),
  date: z.string(),
  recovery: z.coerce.number().int().min(0).max(10),
  energy: z.coerce.number().int().min(1).max(5),
  soreness: z.coerce.number().int().min(1).max(5),
  sleepHours: z.coerce.number().min(0).max(24).multipleOf(0.5),
  sleepQuality: z.coerce.number().int().min(1).max(5),
});

const postSessionSchema = z.object({
  token: z.string(),
  date: z.string(),
  rpe: z.coerce.number().int().min(0).max(10),
  duration: z.coerce.number().int().min(1).max(600),
});

type ActionResult = {
  success: boolean;
  error?: string;
  physioAlert?: boolean;
};

async function getPlayerWithSeason(token: string) {
  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      id: true,
      currentStreak: true,
      longestStreak: true,
      team: {
        select: {
          seasons: {
            where: {
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  if (!player) return null;

  const seasonId = player.team.seasons[0]?.id;
  if (!seasonId) return null;

  return { playerId: player.id, seasonId, player };
}

async function updateStreak(
  playerId: string,
  currentStreak: number,
  longestStreak: number,
  entryDate: Date
): Promise<void> {
  const yesterday = new Date(entryDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayEntry = await database.dailyEntry.findUnique({
    where: {
      playerId_date: { playerId, date: yesterday },
    },
    select: { id: true },
  });

  const newStreak = yesterdayEntry ? currentStreak + 1 : 1;

  await database.player.update({
    where: { id: playerId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
    },
  });
}

export async function savePreSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = preSessionSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: "Datos no válidos. Revisa los campos." };
    }

    const { token, date, recovery, energy, soreness, sleepHours, sleepQuality } =
      parsed.data;

    const ctx = await getPlayerWithSeason(token);
    if (!ctx) {
      return { success: false, error: "Jugador o temporada no encontrados." };
    }

    const entryDate = new Date(date);
    const physioAlert = soreness === 5;

    await database.dailyEntry.upsert({
      where: {
        playerId_date: { playerId: ctx.playerId, date: entryDate },
      },
      create: {
        date: entryDate,
        playerId: ctx.playerId,
        seasonId: ctx.seasonId,
        recovery,
        energy,
        soreness,
        sleepHours,
        sleepQuality,
        physioAlert,
        preFilledAt: new Date(),
      },
      update: {
        recovery,
        energy,
        soreness,
        sleepHours,
        sleepQuality,
        physioAlert,
        preFilledAt: new Date(),
      },
    });

    await updateStreak(
      ctx.playerId,
      ctx.player.currentStreak,
      ctx.player.longestStreak,
      entryDate
    );

    return { success: true, physioAlert };
  } catch {
    return { success: false, error: "Error al guardar. Inténtalo de nuevo." };
  }
}

export async function savePostSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = postSessionSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: "Datos no válidos. Revisa los campos." };
    }

    const { token, date, rpe, duration } = parsed.data;

    const ctx = await getPlayerWithSeason(token);
    if (!ctx) {
      return { success: false, error: "Jugador o temporada no encontrados." };
    }

    const entryDate = new Date(date);

    await database.dailyEntry.upsert({
      where: {
        playerId_date: { playerId: ctx.playerId, date: entryDate },
      },
      create: {
        date: entryDate,
        playerId: ctx.playerId,
        seasonId: ctx.seasonId,
        rpe,
        duration,
        postFilledAt: new Date(),
      },
      update: {
        rpe,
        duration,
        postFilledAt: new Date(),
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Error al guardar. Inténtalo de nuevo." };
  }
}
