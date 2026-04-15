"use server";

import { database } from "@repo/database";
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

type SubmissionContext = {
  playerId: string;
  seasonId: string;
  player: {
    currentStreak: number;
    longestStreak: number;
  };
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
      currentStreak: true,
      longestStreak: true,
      team: {
        select: {
          seasons: {
            where: {
              startDate: { lte: entryDate },
              endDate: { gte: entryDate },
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

  const entryDate = new Date(parsed.data.date);
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

    await updateStreak(
      parsedSubmission.ctx.playerId,
      parsedSubmission.ctx.player.currentStreak,
      parsedSubmission.ctx.player.longestStreak,
      parsedSubmission.entryDate
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

    return { success: true };
  } catch {
    return { success: false, error: "Error al guardar. Inténtalo de nuevo." };
  }
}
