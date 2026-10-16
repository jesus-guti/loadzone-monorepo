"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  FORMATIONS,
  type Formation,
  minutesPlayedByPlayer,
} from "@/features/minutes/derive";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ActionResult = { success: boolean; error?: string };

const sharedSchema = z.object({
  sessionId: z.string().min(1),
  sharedMinutes: z.number().int().min(1).max(300),
});

const promptSchema = z.object({
  promptHour: z.number().int().min(0).max(23),
});

const lineupSchema = z.object({
  sessionId: z.string().min(1),
  formation: z.enum(FORMATIONS),
  starterIds: z.array(z.string().min(1)).length(11),
  benchIds: z.array(z.string().min(1)),
  extraTime: z.boolean(),
  stoppageFirst: z.number().int().min(0).max(20),
  stoppageSecond: z.number().int().min(0).max(20),
  stoppageExtraFirst: z.number().int().min(0).max(20),
  stoppageExtraSecond: z.number().int().min(0).max(20),
  substitutions: z
    .array(
      z.object({
        minute: z.number().int().min(1).max(120),
        playerOutId: z.string().min(1),
        playerInId: z.string().min(1).nullable(),
      })
    )
    .max(20),
});

async function sessionForStaff(sessionId: string) {
  const staff = await getCurrentStaffContext();
  if (!staff) {
    return { error: "No autorizado" as const, session: null, staff: null };
  }
  const session = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: { in: staff.teams.map((team) => team.id) },
    },
    select: {
      id: true,
      teamId: true,
      type: true,
      status: true,
    },
  });
  if (!session || session.status === "CANCELLED") {
    return { error: "Sesión no encontrada" as const, session: null, staff };
  }
  return { error: null, session, staff };
}

export async function saveSharedMinutes(input: {
  sessionId: string;
  sharedMinutes: number;
}): Promise<ActionResult> {
  try {
    const parsed = sharedSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Minutos no válidos" };
    }
    const { error, session } = await sessionForStaff(parsed.data.sessionId);
    if (error || !session) {
      return { success: false, error: error ?? "Sesión no encontrada" };
    }
    if (session.type === "MATCH") {
      return { success: false, error: "Un partido no usa minutos compartidos" };
    }
    await database.teamSession.update({
      where: { id: session.id },
      data: { sharedMinutes: parsed.data.sharedMinutes },
    });
    revalidatePath("/");
    revalidatePath(`/sessions/${session.id}`);
    revalidatePath(`/sessions/${session.id}/minutos`);
    return { success: true };
  } catch (cause) {
    console.error("saveSharedMinutes", cause);
    return { success: false, error: "No se pudieron guardar los minutos" };
  }
}

export async function saveMinutesPromptHour(input: {
  promptHour: number;
}): Promise<ActionResult> {
  try {
    const parsed = promptSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Hora no válida" };
    }
    const staff = await getCurrentStaffContext();
    const teamId = staff?.activeTeam?.id;
    if (!teamId) {
      return { success: false, error: "No autorizado" };
    }
    await database.team.update({
      where: { id: teamId },
      data: { minutesPromptHour: parsed.data.promptHour },
    });
    revalidatePath("/");
    return { success: true };
  } catch (cause) {
    console.error("saveMinutesPromptHour", cause);
    return { success: false, error: "No se pudo guardar la hora" };
  }
}

export async function saveMatchLineup(
  input: z.infer<typeof lineupSchema>
): Promise<ActionResult> {
  try {
    const parsed = lineupSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Alineación no válida" };
    }
    const data = parsed.data;
    const ids = new Set([...data.starterIds, ...data.benchIds]);
    if (ids.size !== data.starterIds.length + data.benchIds.length) {
      return { success: false, error: "Un jugador no puede repetirse" };
    }
    const { error, session } = await sessionForStaff(data.sessionId);
    if (error || !session) {
      return { success: false, error: error ?? "Sesión no encontrada" };
    }
    if (session.type !== "MATCH") {
      return { success: false, error: "Esta sesión no es un partido" };
    }
    const roster = await database.player.findMany({
      where: {
        teamId: session.teamId,
        isArchived: false,
        id: { in: [...ids] },
      },
      select: { id: true },
    });
    if (roster.length !== ids.size) {
      return { success: false, error: "Hay jugadores que no son del equipo" };
    }
    const played = minutesPlayedByPlayer({
      starterIds: data.starterIds,
      benchIds: data.benchIds,
      substitutions: data.substitutions,
      stoppageFirst: data.stoppageFirst,
      stoppageSecond: data.stoppageSecond,
      extraTime: data.extraTime,
      stoppageExtraFirst: data.stoppageExtraFirst,
      stoppageExtraSecond: data.stoppageExtraSecond,
    });
    const formation: Formation = data.formation;
    await database.$transaction(async (tx) => {
      const lineup = await tx.matchLineup.upsert({
        where: { teamSessionId: session.id },
        create: {
          teamSessionId: session.id,
          formation,
          extraTime: data.extraTime,
          stoppageFirst: data.stoppageFirst,
          stoppageSecond: data.stoppageSecond,
          stoppageExtraFirst: data.stoppageExtraFirst,
          stoppageExtraSecond: data.stoppageExtraSecond,
        },
        update: {
          formation,
          extraTime: data.extraTime,
          stoppageFirst: data.stoppageFirst,
          stoppageSecond: data.stoppageSecond,
          stoppageExtraFirst: data.stoppageExtraFirst,
          stoppageExtraSecond: data.stoppageExtraSecond,
        },
      });
      await tx.matchLineupPlayer.deleteMany({ where: { lineupId: lineup.id } });
      await tx.matchSubstitution.deleteMany({ where: { lineupId: lineup.id } });
      await tx.matchLineupPlayer.createMany({
        data: [
          ...data.starterIds.map((playerId, index) => ({
            lineupId: lineup.id,
            playerId,
            role: "STARTER" as const,
            sortOrder: index,
          })),
          ...data.benchIds.map((playerId, index) => ({
            lineupId: lineup.id,
            playerId,
            role: "BENCH" as const,
            sortOrder: index,
          })),
        ],
      });
      if (data.substitutions.length > 0) {
        await tx.matchSubstitution.createMany({
          data: data.substitutions.map((change) => ({
            lineupId: lineup.id,
            minute: change.minute,
            playerOutId: change.playerOutId,
            playerInId: change.playerInId,
          })),
        });
      }
      for (const playerId of ids) {
        const minutes = played[playerId] ?? 0;
        await tx.sessionAttendance.upsert({
          where: {
            teamSessionId_playerId: {
              teamSessionId: session.id,
              playerId,
            },
          },
          create: {
            teamSessionId: session.id,
            playerId,
            minutesPlayed: minutes,
            status: "PRESENT",
          },
          update: { minutesPlayed: minutes },
        });
      }
    });
    revalidatePath("/");
    revalidatePath(`/sessions/${session.id}`);
    revalidatePath(`/sessions/${session.id}/minutos`);
    return { success: true };
  } catch (cause) {
    console.error("saveMatchLineup", cause);
    return { success: false, error: "No se pudo guardar la alineación" };
  }
}
