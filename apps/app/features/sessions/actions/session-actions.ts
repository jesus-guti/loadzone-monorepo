"use server";

import { database } from "@repo/database";
import type { AttendanceStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ActionResult = {
  success: boolean;
  error?: string;
  sessionId?: string;
};

const WEEKDAY_VALUES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;
type Weekday = (typeof WEEKDAY_VALUES)[number];

const WEEKDAY_TO_INDEX: Record<Weekday, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
};

const MAX_RECURRENCE_INSTANCES = 60;

const recurrenceSchema = z
  .object({
    byday: z.array(z.enum(WEEKDAY_VALUES)).min(1).max(7),
    until: z.string().min(1),
  })
  .optional();

const createSessionSchema = z
  .object({
    title: z.string().min(2).max(100),
    type: z.enum(["TRAINING", "MATCH", "RECOVERY", "OTHER"]),
    visibility: z.enum(["TEAM_PRIVATE", "CLUB_SHARED"]),
    location: z.string().max(150).optional(),
    notes: z.string().max(1000).optional(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    preReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    postReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    recurrence: recurrenceSchema,
  })
  .refine(
    (data) =>
      new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
    {
      message: "La sesión debe terminar después de empezar.",
      path: ["endsAt"],
    }
  );

function buildRecurrenceRule(byday: Weekday[], until: Date): string {
  const untilStamp = until.toISOString().replace(/[-:]/g, "").split(".")[0];
  return `FREQ=WEEKLY;BYDAY=${byday.join(",")};UNTIL=${untilStamp}Z`;
}

function buildRecurringStartDates(
  firstStartsAt: Date,
  byday: Weekday[],
  until: Date
): Date[] {
  if (byday.length === 0) {
    return [firstStartsAt];
  }

  const targetWeekdays = new Set(byday.map((day) => WEEKDAY_TO_INDEX[day]));
  const dates: Date[] = [];
  const cursor = new Date(firstStartsAt);
  cursor.setSeconds(0, 0);

  let safetyGuard = 0;
  while (cursor.getTime() <= until.getTime() && safetyGuard < 365) {
    safetyGuard += 1;
    if (targetWeekdays.has(cursor.getDay())) {
      dates.push(new Date(cursor));
      if (dates.length >= MAX_RECURRENCE_INSTANCES) {
        break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (dates.length === 0) {
    dates.push(new Date(firstStartsAt));
  }

  return dates;
}

export async function createSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  let createdId: string | undefined;

  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const recurrenceRaw = formData.get("recurrence");
    let recurrenceParsed: z.infer<typeof recurrenceSchema>;
    if (typeof recurrenceRaw === "string" && recurrenceRaw.trim().length > 0) {
      try {
        const parsed = recurrenceSchema.safeParse(JSON.parse(recurrenceRaw));
        if (parsed.success) {
          recurrenceParsed = parsed.data;
        }
      } catch {
        return { success: false, error: "Recurrencia no válida." };
      }
    }

    const parsed = createSessionSchema.safeParse({
      title: formData.get("title"),
      type: formData.get("type"),
      visibility: formData.get("visibility"),
      location: formData.get("location") || undefined,
      notes: formData.get("notes") || undefined,
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      preReminderMinutes: formData.get("preReminderMinutes") || undefined,
      postReminderMinutes: formData.get("postReminderMinutes") || undefined,
      recurrence: recurrenceParsed,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    const team = staffContext.activeTeam;
    const club = staffContext.club;
    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    const durationMs = endsAt.getTime() - startsAt.getTime();

    const recurrence = parsed.data.recurrence;
    if (recurrence) {
      const until = new Date(recurrence.until);
      if (Number.isNaN(until.getTime()) || until.getTime() < startsAt.getTime()) {
        return {
          success: false,
          error: "La fecha de fin de la repetición no es válida.",
        };
      }

      const dates = buildRecurringStartDates(startsAt, recurrence.byday, until);
      const seriesId = crypto.randomUUID();
      const recurrenceRule = buildRecurrenceRule(recurrence.byday, until);

      const created = await database.$transaction(
        dates.map((dateStart) => {
          const dateEnd = new Date(dateStart.getTime() + durationMs);
          return database.teamSession.create({
            data: {
              clubId: club.id,
              teamId: team.id,
              title: parsed.data.title,
              type: parsed.data.type,
              visibility: parsed.data.visibility,
              location: parsed.data.location,
              notes: parsed.data.notes,
              startsAt: dateStart,
              endsAt: dateEnd,
              timezone: team.timezone,
              preReminderMinutes:
                parsed.data.preReminderMinutes ??
                team.preSessionReminderMinutes,
              postReminderMinutes:
                parsed.data.postReminderMinutes ??
                team.postSessionReminderMinutes,
              seriesId,
              recurrenceRule,
              recurrenceUntil: until,
              createdByMembershipId: staffContext.membershipId,
            },
            select: { id: true },
          });
        })
      );

      createdId = created[0]?.id;
    } else {
      const created = await database.teamSession.create({
        data: {
          clubId: club.id,
          teamId: team.id,
          title: parsed.data.title,
          type: parsed.data.type,
          visibility: parsed.data.visibility,
          location: parsed.data.location,
          notes: parsed.data.notes,
          startsAt,
          endsAt,
          timezone: team.timezone,
          preReminderMinutes:
            parsed.data.preReminderMinutes ?? team.preSessionReminderMinutes,
          postReminderMinutes:
            parsed.data.postReminderMinutes ?? team.postSessionReminderMinutes,
          createdByMembershipId: staffContext.membershipId,
        },
        select: { id: true },
      });
      createdId = created.id;
    }

    revalidatePath("/sessions");
  } catch {
    return { success: false, error: "Error al crear la sesión." };
  }

  if (createdId) {
    return { success: true, sessionId: createdId };
  }

  return { success: true };
}

const updateSessionSchema = z
  .object({
    sessionId: z.string().min(1),
    title: z.string().min(2).max(100),
    type: z.enum(["TRAINING", "MATCH", "RECOVERY", "OTHER"]),
    visibility: z.enum(["TEAM_PRIVATE", "CLUB_SHARED"]),
    location: z.string().max(150).optional(),
    notes: z.string().max(1000).optional(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    preReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    postReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    scope: z.enum(["instance", "futureAndCurrent"]).default("instance"),
  })
  .refine(
    (data) =>
      new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
    {
      message: "La sesión debe terminar después de empezar.",
      path: ["endsAt"],
    }
  );

export async function updateSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const parsed = updateSessionSchema.safeParse({
      sessionId: formData.get("sessionId"),
      title: formData.get("title"),
      type: formData.get("type"),
      visibility: formData.get("visibility"),
      location: formData.get("location") || undefined,
      notes: formData.get("notes") || undefined,
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      preReminderMinutes: formData.get("preReminderMinutes") || undefined,
      postReminderMinutes: formData.get("postReminderMinutes") || undefined,
      scope: formData.get("scope") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    const session = await database.teamSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        teamId: staffContext.activeTeam.id,
      },
      select: {
        id: true,
        seriesId: true,
        startsAt: true,
        endsAt: true,
      },
    });

    if (!session) {
      return { success: false, error: "Sesión no encontrada." };
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);

    const sharedData = {
      title: parsed.data.title,
      type: parsed.data.type,
      visibility: parsed.data.visibility,
      location: parsed.data.location,
      notes: parsed.data.notes,
      preReminderMinutes: parsed.data.preReminderMinutes,
      postReminderMinutes: parsed.data.postReminderMinutes,
    };

    if (
      parsed.data.scope === "futureAndCurrent" &&
      session.seriesId
    ) {
      const offsetMs = startsAt.getTime() - session.startsAt.getTime();
      const durationMs = endsAt.getTime() - startsAt.getTime();
      const futureSessions = await database.teamSession.findMany({
        where: {
          seriesId: session.seriesId,
          startsAt: { gte: session.startsAt },
        },
        select: { id: true, startsAt: true },
      });

      await database.$transaction(
        futureSessions.map((entry) => {
          const newStart = new Date(entry.startsAt.getTime() + offsetMs);
          const newEnd = new Date(newStart.getTime() + durationMs);
          return database.teamSession.update({
            where: { id: entry.id },
            data: {
              ...sharedData,
              startsAt: newStart,
              endsAt: newEnd,
            },
          });
        })
      );
    } else {
      await database.teamSession.update({
        where: { id: session.id },
        data: {
          ...sharedData,
          startsAt,
          endsAt,
        },
      });
    }

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${session.id}`);
    return { success: true, sessionId: session.id };
  } catch {
    return { success: false, error: "Error al actualizar la sesión." };
  }
}

export async function deleteSession(
  sessionId: string,
  scope: "instance" | "futureAndCurrent" = "instance"
): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const session = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: staffContext.activeTeam.id,
    },
    select: { id: true, seriesId: true, startsAt: true },
  });

  if (!session) {
    throw new Error("Sesión no encontrada.");
  }

  if (scope === "futureAndCurrent" && session.seriesId) {
    await database.teamSession.deleteMany({
      where: {
        seriesId: session.seriesId,
        startsAt: { gte: session.startsAt },
      },
    });
  } else {
    await database.teamSession.delete({ where: { id: session.id } });
  }

  revalidatePath("/sessions");
}

export async function cancelSession(sessionId: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const session = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: staffContext.activeTeam.id,
    },
    select: { id: true },
  });

  if (!session) {
    throw new Error("No tienes acceso a esta sesión.");
  }

  await database.teamSession.update({
    where: { id: session.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${session.id}`);
}

const attachExercisesSchema = z.object({
  sessionId: z.string().min(1),
  items: z.array(
    z.object({
      exerciseId: z.string().min(1),
      order: z.number().int().min(0),
      durationMinutesOverride: z
        .number()
        .int()
        .min(1)
        .max(600)
        .nullable()
        .optional(),
      notes: z.string().max(500).nullable().optional(),
    })
  ),
});

export async function attachExercises(input: {
  sessionId: string;
  items: Array<{
    exerciseId: string;
    order: number;
    durationMinutesOverride?: number | null;
    notes?: string | null;
  }>;
}): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const parsed = attachExercisesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    const session = await database.teamSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        teamId: staffContext.activeTeam.id,
      },
      select: { id: true },
    });

    if (!session) {
      return { success: false, error: "Sesión no encontrada." };
    }

    await database.$transaction([
      database.sessionExercise.deleteMany({
        where: { teamSessionId: session.id },
      }),
      ...parsed.data.items.map((item, index) =>
        database.sessionExercise.create({
          data: {
            teamSessionId: session.id,
            exerciseId: item.exerciseId,
            order: index,
            durationMinutesOverride: item.durationMinutesOverride ?? null,
            notes: item.notes ?? null,
          },
        })
      ),
    ]);

    revalidatePath(`/sessions/${session.id}`);
    revalidatePath("/sessions");
    return { success: true, sessionId: session.id };
  } catch {
    return { success: false, error: "Error al asignar ejercicios." };
  }
}

const attendanceEntrySchema = z.object({
  playerId: z.string().min(1),
  status: z.enum(["PENDING", "PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  minutesPlayed: z.number().int().min(0).max(240).nullable().optional(),
  startedMinute: z.number().int().min(0).max(240).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

const setAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  entries: z.array(attendanceEntrySchema),
});

export async function setAttendance(input: {
  sessionId: string;
  entries: Array<{
    playerId: string;
    status: AttendanceStatus;
    minutesPlayed?: number | null;
    startedMinute?: number | null;
    notes?: string | null;
  }>;
}): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const parsed = setAttendanceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    const session = await database.teamSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        teamId: staffContext.activeTeam.id,
      },
      select: { id: true },
    });

    if (!session) {
      return { success: false, error: "Sesión no encontrada." };
    }

    const now = new Date();
    await database.$transaction(
      parsed.data.entries.map((entry) =>
        database.sessionAttendance.upsert({
          where: {
            teamSessionId_playerId: {
              teamSessionId: session.id,
              playerId: entry.playerId,
            },
          },
          create: {
            teamSessionId: session.id,
            playerId: entry.playerId,
            status: entry.status,
            minutesPlayed: entry.minutesPlayed ?? null,
            startedMinute: entry.startedMinute ?? null,
            notes: entry.notes ?? null,
            markedAt: now,
          },
          update: {
            status: entry.status,
            minutesPlayed: entry.minutesPlayed ?? null,
            startedMinute: entry.startedMinute ?? null,
            notes: entry.notes ?? null,
            markedAt: now,
          },
        })
      )
    );

    revalidatePath(`/sessions/${session.id}`);
    return { success: true, sessionId: session.id };
  } catch {
    return { success: false, error: "Error al guardar asistencia." };
  }
}
