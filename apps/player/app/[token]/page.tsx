import { database } from "@repo/database";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "@repo/database/age-band-policy";
import { effectiveCurrentStreak } from "@repo/database/recoverable-streak";
import {
  type PlayerReminderConsentState,
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
} from "@repo/database/reminder-consent";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { env } from "@/env";
import { SessionPage } from "./components/session-page";
import {
  type ProjectRachaWeekResult,
  projectRachaWeek,
  rachaWeekQueryWindow,
} from "./lib/racha-week";
import { cromoMediaUrl } from "./lib/streak-cromo";
import { PrototypeCheckinLab } from "./prototype-dd-05";
import {
  isPrototypeLabToken,
  parseBand,
  parseVariant,
} from "./prototype-dd-05/constants";

type PageProperties = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    date?: string;
    variant?: string;
    band?: string;
  }>;
};

/** Prisma Decimal columns reach the client as plain numbers. */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

async function loadRachaWeek(
  teamId: string,
  rawTimezone: string
): Promise<ProjectRachaWeekResult> {
  const timeZone = rawTimezone || "Europe/Madrid";
  const asOf = new Date();
  const window = rachaWeekQueryWindow(asOf, timeZone);
  const sessions = await database.teamSession.findMany({
    where: {
      teamId,
      startsAt: { gte: window.gte, lt: window.lt },
    },
    select: { startsAt: true, status: true },
  });

  return projectRachaWeek({ sessions, timeZone, asOf });
}

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
  const resolvedSearch = await searchParams;
  const {
    date,
    variant: variantRaw,
    band: bandRaw,
  } = resolvedSearch;
  const variant = parseVariant(variantRaw);

  // PROTOTYPE lab: ?variant= swaps the subtree; production SessionPage untouched otherwise.
  if (variant) {
    const band = parseBand(bandRaw);
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] items-center justify-center text-sm text-text-secondary">
            Cargando prototipo…
          </div>
        }
      >
        <PrototypeCheckinLab
          initialBand={band}
          initialVariant={variant}
          token={token}
        />
      </Suspense>
    );
  }

  if (isPrototypeLabToken(token)) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-4 px-5 text-text-primary">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-premium">
          PROTOTIPO · DD-05
        </p>
        <h1 className="text-2xl font-semibold">Lab de check-in</h1>
        <p className="text-sm text-text-secondary">
          Añade{" "}
          <code className="rounded bg-bg-tertiary px-1.5 py-0.5 text-xs">
            ?variant=A&amp;band=assisted
          </code>{" "}
          para abrir el prototipo. Sin ese parámetro no se sustituye el check-in
          de producción.
        </p>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>
            <a className="underline" href={`/${token}?variant=A&band=assisted`}>
              Variante A · Focus · Asistida
            </a>
          </li>
          <li>
            <a className="underline" href={`/${token}?variant=B&band=guided`}>
              Variante B · Timeline · Guiada
            </a>
          </li>
          <li>
            <a
              className="underline"
              href={`/${token}?variant=C&band=independent`}
            >
              Variante C · Reward · Independiente
            </a>
          </li>
        </ul>
      </div>
    );
  }

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      currentStreak: true,
      streakSeasonId: true,
      teamId: true,
      dateOfBirth: true,
      ageBandOverride: true,
      playingPosition: true,
      shirtNumber: true,
      reminderConsentState: true,
      team: {
        select: {
          name: true,
          timezone: true,
          ageBandPolicy: true,
          reminderConsentPolicy: true,
          club: {
            select: {
              ageBandPolicy: true,
              logoUrl: true,
            },
          },
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
          seasons: {
            where: {
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
            orderBy: { startDate: "desc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const effectiveAgePolicy = resolveEffectiveAgeBandPolicy({
    teamPolicy: player.team.ageBandPolicy,
    clubPolicy: player.team.club.ageBandPolicy,
  });
  const resolvedAge = resolveAgeBandPolicy({
    policy: effectiveAgePolicy.policy,
    policySource: effectiveAgePolicy.source,
    dateOfBirth: player.dateOfBirth,
    ageBandOverride: player.ageBandOverride,
    teamTimezone: player.team.timezone,
  });
  const { policy: reminderConsentPolicy } =
    resolveEffectiveReminderConsentPolicy({
      teamPolicy: player.team.reminderConsentPolicy,
    });
  const subscriptionCount = await database.pushSubscription.count({
    where: { playerId: player.id },
  });
  const pushConsent = resolvePushConsent({
    resolvedAge,
    reminderConsentPolicy,
    playerConsentState:
      player.reminderConsentState as PlayerReminderConsentState,
    hasActiveSubscription: subscriptionCount > 0,
  });
  const activeSeasonId = player.team.seasons[0]?.id ?? null;
  const displayStreak = effectiveCurrentStreak({
    currentStreak: player.currentStreak,
    streakSeasonId: player.streakSeasonId,
    activeSeasonId,
  });
  const imageUrl = player.imageUrl ? cromoMediaUrl("photo") : null;
  const clubCrestUrl = player.team.club.logoUrl ? cromoMediaUrl("crest") : null;

  const teammates = await database.player.findMany({
    where: {
      teamId: player.teamId,
      isArchived: false,
      id: { not: player.id },
    },
    select: { currentStreak: true, streakSeasonId: true },
  });
  const teammateStreaks = teammates.map((teammate) =>
    effectiveCurrentStreak({
      currentStreak: teammate.currentStreak,
      streakSeasonId: teammate.streakSeasonId,
      activeSeasonId,
    })
  );

  const rachaWeek = await loadRachaWeek(player.teamId, player.team.timezone);

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
    player.team.forms.find(
      (assignment) => assignment.fillMoment === "PRE_SESSION"
    )?.template ??
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
    player.team.forms.find(
      (assignment) => assignment.fillMoment === "POST_SESSION"
    )?.template ??
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
      ageBand={resolvedAge.ageBand}
      apiUrl={env.NEXT_PUBLIC_API_URL ?? ""}
      clubCrestUrl={clubCrestUrl}
      currentStreak={displayStreak}
      imageUrl={imageUrl}
      parentalSupervisionActive={resolvedAge.parentalSupervisionActive}
      playerName={player.name}
      playingPosition={player.playingPosition}
      shirtNumber={player.shirtNumber}
      teammateStreaks={teammateStreaks}
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
                minValue: toNumberOrNull(question.minValue),
                maxValue: toNumberOrNull(question.maxValue),
                step: toNumberOrNull(question.step),
              })),
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
                minValue: toNumberOrNull(question.minValue),
                maxValue: toNumberOrNull(question.maxValue),
                step: toNumberOrNull(question.step),
              })),
            }
          : null
      }
      pushConsent={{
        uiMode: pushConsent.uiMode,
        canSubscribe: pushConsent.canSubscribe,
        canOptOut: pushConsent.canOptOut,
      }}
      rachaWeekDays={rachaWeek.days}
      rachaWeekSessionCount={rachaWeek.sessionCount}
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
      teamName={player.team.name}
      token={token}
    />
  );
};

export default PlayerPage;
