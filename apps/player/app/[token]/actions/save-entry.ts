"use server";

import { database } from "@repo/database";
import {
  evaluateAndEmitCareAlert,
  PLAYER_CARE_CONFIRM_MESSAGE,
} from "@repo/database/care-alerts";
import {
  civilDateToUtcMidnight,
  isDayObligationsComplete,
  resolveDayObligations,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import { recomputeAndPersistPlayerStreak } from "@repo/database/recompute-player-streak";
import {
  evaluateImmediateWellnessFlags,
  parseWellnessLimits,
  type ImmediateWellnessFlag,
  type WellnessLimits,
} from "@repo/database/wellness-limits";
import type { AgeBand } from "@repo/database/age-band-policy";
import { z } from "zod";

const submissionSchema = z.object({
  token: z.string(),
  date: z.string(),
  templateId: z.string(),
  teamSessionId: z.string().optional(),
});

type ActionResult = {
  success: boolean;
  error?: string;
  physioAlert?: boolean;
  currentStreak?: number;
  restarted?: boolean;
  /** Immediate wellness flags at submit time. */
  wellnessFlags?: ImmediateWellnessFlag[];
  /** Calm Player confirm when a care flag is present (not Guardian delivery). */
  careConfirm?: boolean;
  careConfirmMessage?: string;
};

type ProjectedMetrics = {
  recovery?: number;
  energy?: number;
  soreness?: number;
  sleepHours?: number;
  sleepQuality?: number;
  rpe?: number;
  duration?: number;
};

type CareAlertPlayerContext = {
  playerId: string;
  playerDisplayName: string;
  teamTimezone: string;
  teamAgeBandPolicy: unknown;
  clubAgeBandPolicy: unknown;
  reminderConsentPolicy: unknown;
  dateOfBirth: Date | null;
  ageBandOverride: AgeBand | null;
};

type SubmissionContext = {
  playerId: string;
  seasonId: string;
  teamId: string;
  timeZone: string;
  wellnessLimits: WellnessLimits | null;
  care: CareAlertPlayerContext;
};

type FormQuestionDefinition = {
  id: string;
  key: string;
  label: string;
  required: boolean;
  type: "SCALE" | "NUMBER" | "BOOLEAN" | "TEXT" | "SINGLE_SELECT";
  mappingKey: string | null;
};

type ParsedSubmission = {
  ctx: SubmissionContext;
  entryDate: Date;
  entryCivilDate: string;
  templateId: string;
  teamSessionId?: string;
  answers: Array<{
    questionId: string;
    value: string | number | boolean;
  }>;
  metrics: ProjectedMetrics;
};

type SubmissionParseResult =
  | {
      ok: true;
      data: ParsedSubmission;
    }
  | {
      ok: false;
      error: string;
    };

async function getPlayerWithSeason(
  token: string,
  entryDate: Date
): Promise<SubmissionContext | null> {
  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      id: true,
      teamId: true,
      name: true,
      dateOfBirth: true,
      ageBandOverride: true,
      team: {
        select: {
          timezone: true,
          wellnessLimits: true,
          ageBandPolicy: true,
          reminderConsentPolicy: true,
          club: {
            select: {
              ageBandPolicy: true,
            },
          },
          seasons: {
            where: {
              startDate: { lte: entryDate },
              endDate: { gte: entryDate },
            },
            orderBy: { startDate: "desc" },
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

  const timeZone = player.team.timezone || "Europe/Madrid";

  return {
    playerId: player.id,
    seasonId,
    teamId: player.teamId,
    timeZone,
    wellnessLimits: parseWellnessLimits(player.team.wellnessLimits),
    care: {
      playerId: player.id,
      playerDisplayName: player.name,
      teamTimezone: timeZone,
      teamAgeBandPolicy: player.team.ageBandPolicy,
      clubAgeBandPolicy: player.team.club.ageBandPolicy,
      reminderConsentPolicy: player.team.reminderConsentPolicy,
      dateOfBirth: player.dateOfBirth,
      ageBandOverride: player.ageBandOverride,
    },
  };
}

function parseQuestionValue(
  rawValue: FormDataEntryValue | null | undefined,
  question: FormQuestionDefinition
): string | number | boolean | null {
  if (rawValue == null || rawValue.toString().length === 0) {
    return null;
  }

  if (question.type === "NUMBER" || question.type === "SCALE") {
    const numericValue = Number(rawValue);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  if (question.type === "BOOLEAN") {
    return rawValue === "true";
  }

  return rawValue.toString();
}

async function parseSubmission(
  formData: FormData
): Promise<SubmissionParseResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: "Datos no válidos. Revisa los campos." };
  }

  const entryCivilDate = parsed.data.date;
  const entryDate = civilDateToUtcMidnight(entryCivilDate);
  const ctx = await getPlayerWithSeason(parsed.data.token, entryDate);
  if (!ctx) {
    return { ok: false, error: "Jugador o temporada no encontrados." };
  }

  const template = await database.formTemplate.findFirst({
    where: { id: parsed.data.templateId, isActive: true },
    select: {
      id: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          key: true,
          label: true,
          required: true,
          type: true,
          mappingKey: true,
        },
      },
    },
  });

  if (!template) {
    return { ok: false, error: "Formulario no encontrado." };
  }

  const answers: ParsedSubmission["answers"] = [];
  const metrics: ProjectedMetrics = {};

  for (const question of template.questions) {
    // Duration is no longer collected from the player; skip even if still present
    // as a required question on older form templates.
    if (question.mappingKey === "duration" || question.key === "duration") {
      continue;
    }

    const parsedValue = parseQuestionValue(formData.get(question.key), question);
    if (question.required && parsedValue == null) {
      return { ok: false, error: `Falta completar: ${question.label}.` };
    }

    if (parsedValue == null) {
      continue;
    }

    answers.push({
      questionId: question.id,
      value: parsedValue,
    });

    if (question.mappingKey) {
      metrics[question.mappingKey as keyof ProjectedMetrics] =
        typeof parsedValue === "number" ? parsedValue : undefined;
    }
  }

  return {
    ok: true,
    data: {
      ctx,
      entryDate,
      entryCivilDate,
      templateId: template.id,
      teamSessionId:
        parsed.data.teamSessionId && parsed.data.teamSessionId.length > 0
          ? parsed.data.teamSessionId
          : undefined,
      answers,
      metrics,
    },
  };
}

async function upsertFormSubmission(
  parsedSubmission: ParsedSubmission
): Promise<string> {
  const existingSubmission = await database.formSubmission.findFirst({
    where: {
      playerId: parsedSubmission.ctx.playerId,
      templateId: parsedSubmission.templateId,
      date: parsedSubmission.entryDate,
      teamSessionId: parsedSubmission.teamSessionId ?? null,
    },
    select: { id: true },
  });

  if (existingSubmission) {
    const updatedSubmission = await database.formSubmission.update({
      where: { id: existingSubmission.id },
      data: {
        submittedAt: new Date(),
        answers: {
          deleteMany: {},
          create: parsedSubmission.answers.map((answer) => ({
            questionId: answer.questionId,
            value: answer.value,
          })),
        },
      },
      select: { id: true },
    });

    return updatedSubmission.id;
  }

  const createdSubmission = await database.formSubmission.create({
    data: {
      templateId: parsedSubmission.templateId,
      playerId: parsedSubmission.ctx.playerId,
      teamSessionId: parsedSubmission.teamSessionId,
      date: parsedSubmission.entryDate,
      answers: {
        create: parsedSubmission.answers.map((answer) => ({
          questionId: answer.questionId,
          value: answer.value,
        })),
      },
    },
    select: { id: true },
  });

  return createdSubmission.id;
}

async function maybePersistStreak(
  parsedSubmission: ParsedSubmission
): Promise<{ currentStreak: number; restarted: boolean } | null> {
  const dayStart = parsedSubmission.entryDate;
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await database.teamSession.findMany({
    where: {
      teamId: parsedSubmission.ctx.teamId,
      status: { not: "CANCELLED" },
      startsAt: {
        gte: new Date(dayStart.getTime() - 24 * 60 * 60 * 1000),
        lt: new Date(dayEnd.getTime() + 24 * 60 * 60 * 1000),
      },
      OR: [
        { appliesToAllPlayers: true },
        { playerLinks: { some: { playerId: parsedSubmission.ctx.playerId } } },
      ],
    },
    select: {
      startsAt: true,
      formAssignments: {
        where: { isActive: true },
        select: { fillMoment: true },
      },
    },
  });

  const sessionsForDay = sessions.filter(
    (session) =>
      toCivilDateString(session.startsAt, parsedSubmission.ctx.timeZone) ===
      parsedSubmission.entryCivilDate
  );

  if (sessionsForDay.length === 0) {
    return null;
  }

  const teamForms = await database.formAssignment.findMany({
    where: {
      teamId: parsedSubmission.ctx.teamId,
      teamSessionId: null,
      isActive: true,
    },
    select: { fillMoment: true },
  });

  const sessionMoments = sessionsForDay.map((session) =>
    session.formAssignments.map((assignment) => assignment.fillMoment)
  );
  const obligations = resolveDayObligations(
    sessionMoments,
    teamForms.map((form) => form.fillMoment)
  );

  const entry = await database.dailyEntry.findUnique({
    where: {
      playerId_date: {
        playerId: parsedSubmission.ctx.playerId,
        date: parsedSubmission.entryDate,
      },
    },
    select: { preFilledAt: true, postFilledAt: true },
  });

  if (!isDayObligationsComplete(obligations, entry)) {
    return null;
  }

  const result = await recomputeAndPersistPlayerStreak({
    playerId: parsedSubmission.ctx.playerId,
    seasonId: parsedSubmission.ctx.seasonId,
    asOfCivilDate: parsedSubmission.entryCivilDate,
  });

  if (!result) {
    return null;
  }

  return {
    currentStreak: result.currentStreak,
    restarted: result.restarted,
  };
}

export async function savePreSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const submission = await parseSubmission(formData);
    if (!submission.ok) {
      return { success: false, error: submission.error };
    }

    const parsedSubmission = submission.data;

    const formSubmissionId = await upsertFormSubmission(parsedSubmission);
    const metrics = parsedSubmission.metrics;
    const physioAlert = metrics.soreness === 5;
    const wellnessFlags = evaluateImmediateWellnessFlags(
      metrics,
      parsedSubmission.ctx.wellnessLimits
    );

    await database.dailyEntry.upsert({
      where: {
        playerId_date: {
          playerId: parsedSubmission.ctx.playerId,
          date: parsedSubmission.entryDate,
        },
      },
      create: {
        date: parsedSubmission.entryDate,
        playerId: parsedSubmission.ctx.playerId,
        seasonId: parsedSubmission.ctx.seasonId,
        teamSessionId: parsedSubmission.teamSessionId,
        formSubmissionId,
        recovery: metrics.recovery,
        energy: metrics.energy,
        soreness: metrics.soreness,
        sleepHours: metrics.sleepHours,
        sleepQuality: metrics.sleepQuality,
        physioAlert,
        preFilledAt: new Date(),
      },
      update: {
        teamSessionId: parsedSubmission.teamSessionId,
        formSubmissionId,
        recovery: metrics.recovery,
        energy: metrics.energy,
        soreness: metrics.soreness,
        sleepHours: metrics.sleepHours,
        sleepQuality: metrics.sleepQuality,
        physioAlert,
        preFilledAt: new Date(),
      },
    });

    const streak = await maybePersistStreak(parsedSubmission);

    const careResult = await evaluateAndEmitCareAlert({
      ...parsedSubmission.ctx.care,
      signals: {
        physioAlert,
        wellnessFlags,
      },
      checkInCompleted: true,
    });

    return {
      success: true,
      physioAlert,
      wellnessFlags,
      currentStreak: streak?.currentStreak,
      restarted: streak?.restarted,
      careConfirm: careResult.careFlagPresent,
      careConfirmMessage: careResult.careFlagPresent
        ? PLAYER_CARE_CONFIRM_MESSAGE
        : undefined,
    };
  } catch {
    return { success: false, error: "Error al guardar. Inténtalo de nuevo." };
  }
}

export async function savePostSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const submission = await parseSubmission(formData);
    if (!submission.ok) {
      return { success: false, error: submission.error };
    }

    const parsedSubmission = submission.data;

    const formSubmissionId = await upsertFormSubmission(parsedSubmission);
    const metrics = parsedSubmission.metrics;

    await database.dailyEntry.upsert({
      where: {
        playerId_date: {
          playerId: parsedSubmission.ctx.playerId,
          date: parsedSubmission.entryDate,
        },
      },
      create: {
        date: parsedSubmission.entryDate,
        playerId: parsedSubmission.ctx.playerId,
        seasonId: parsedSubmission.ctx.seasonId,
        teamSessionId: parsedSubmission.teamSessionId,
        formSubmissionId,
        rpe: metrics.rpe,
        duration: metrics.duration,
        postFilledAt: new Date(),
      },
      update: {
        teamSessionId: parsedSubmission.teamSessionId,
        formSubmissionId,
        rpe: metrics.rpe,
        duration: metrics.duration,
        postFilledAt: new Date(),
      },
    });

    const streak = await maybePersistStreak(parsedSubmission);

    return {
      success: true,
      currentStreak: streak?.currentStreak,
      restarted: streak?.restarted,
    };
  } catch {
    return { success: false, error: "Error al guardar. Inténtalo de nuevo." };
  }
}
