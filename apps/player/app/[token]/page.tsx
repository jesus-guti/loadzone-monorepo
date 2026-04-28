import { database, ensureBaseFormTemplates } from "@repo/database";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { SessionPage } from "./components/session-page";

type PageProperties = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ date?: string }>;
};

function resolveSelectedDate(rawDate?: string): { iso: string; value: Date } {
  if (rawDate) {
    const parsed = new Date(`${rawDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return { iso: rawDate, value: parsed };
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    iso: today.toISOString().split("T")[0] ?? "",
    value: today,
  };
}

const PlayerPage = async ({ params, searchParams }: PageProperties) => {
  const { token } = await params;
  const { date } = await searchParams;
  await ensureBaseFormTemplates();

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      id: true,
      name: true,
      currentStreak: true,
      teamId: true,
      team: {
        select: {
          name: true,
          forms: {
            where: {
              teamSessionId: null,
              isActive: true,
            },
            select: {
              fillMoment: true,
              template: {
                select: {
                  id: true,
                  name: true,
                  questions: {
                    orderBy: { order: "asc" },
                    select: {
                      id: true,
                      key: true,
                      label: true,
                      type: true,
                      mappingKey: true,
                      minValue: true,
                      maxValue: true,
                      step: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const selectedDate = resolveSelectedDate(date);
  const nextDay = new Date(selectedDate.value);
  nextDay.setDate(nextDay.getDate() + 1);

  const selectedEntry = await database.dailyEntry.findUnique({
    where: {
      playerId_date: { playerId: player.id, date: selectedDate.value },
    },
    select: {
      preFilledAt: true,
      postFilledAt: true,
    },
  });

  const selectedSession = await database.teamSession.findFirst({
    where: {
      teamId: player.teamId,
      startsAt: {
        gte: selectedDate.value,
        lt: nextDay,
      },
      status: "SCHEDULED",
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      startsAt: true,
      endsAt: true,
      formAssignments: {
        where: { isActive: true },
        select: {
          fillMoment: true,
          template: {
            select: {
              id: true,
              name: true,
              questions: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  key: true,
                  label: true,
                  type: true,
                  mappingKey: true,
                  minValue: true,
                  maxValue: true,
                  step: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const fallbackPreTemplate =
    player.team.forms.find((assignment) => assignment.fillMoment === "PRE_SESSION")
      ?.template ??
    (await database.formTemplate.findUnique({
      where: { code: "system-wellness-pre" },
      select: {
        id: true,
        name: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            key: true,
            label: true,
            type: true,
            mappingKey: true,
            minValue: true,
            maxValue: true,
            step: true,
          },
        },
      },
    }));

  const fallbackPostTemplate =
    player.team.forms.find((assignment) => assignment.fillMoment === "POST_SESSION")
      ?.template ??
    (await database.formTemplate.findUnique({
      where: { code: "system-rpe-post" },
      select: {
        id: true,
        name: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            key: true,
            label: true,
            type: true,
            mappingKey: true,
            minValue: true,
            maxValue: true,
            step: true,
          },
        },
      },
    }));

  const preTemplate =
    selectedSession?.formAssignments.find(
      (assignment) => assignment.fillMoment === "PRE_SESSION"
    )?.template ?? fallbackPreTemplate;

  const postTemplate =
    selectedSession?.formAssignments.find(
      (assignment) => assignment.fillMoment === "POST_SESSION"
    )?.template ?? fallbackPostTemplate;

  return (
    <SessionPage
      token={token}
      playerName={player.name}
      teamName={player.team.name}
      currentStreak={player.currentStreak}
      apiUrl={env.NEXT_PUBLIC_API_URL ?? ""}
      selectedDate={selectedDate.iso}
      selectedEntry={selectedEntry}
      selectedSession={
        selectedSession
          ? {
              id: selectedSession.id,
              title: selectedSession.title,
              type: selectedSession.type,
              startsAt: selectedSession.startsAt.toISOString(),
              endsAt: selectedSession.endsAt.toISOString(),
            }
          : null
      }
      preTemplate={
        preTemplate
          ? {
              id: preTemplate.id,
              name: preTemplate.name,
              questions: preTemplate.questions.map((question) => ({
                id: question.id,
                key: question.key,
                label: question.label,
                type: question.type,
                mappingKey: question.mappingKey,
                minValue:
                  question.minValue == null ? null : Number(question.minValue),
                maxValue:
                  question.maxValue == null ? null : Number(question.maxValue),
                step: question.step == null ? null : Number(question.step),
              })),
            }
          : null
      }
      postTemplate={
        postTemplate
          ? {
              id: postTemplate.id,
              name: postTemplate.name,
              questions: postTemplate.questions.map((question) => ({
                id: question.id,
                key: question.key,
                label: question.label,
                type: question.type,
                mappingKey: question.mappingKey,
                minValue:
                  question.minValue == null ? null : Number(question.minValue),
                maxValue:
                  question.maxValue == null ? null : Number(question.maxValue),
                step: question.step == null ? null : Number(question.step),
              })),
            }
          : null
      }
    />
  );
};

export default PlayerPage;
