"use client";

import { useState, useCallback, useEffect, useMemo, useTransition } from "react";
import { Button } from "@repo/design-system/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/tabs";
import { CalendarBlankIcon } from "@phosphor-icons/react/CalendarBlank";
import { CheckCircleIcon } from "@phosphor-icons/react/CheckCircle";
import { HeartbeatIcon } from "@phosphor-icons/react/Heartbeat";
import { cn } from "@repo/design-system/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { DatePicker } from "@/components/date-picker";
import { PreSessionForm } from "./pre-session-form";
import { PostSessionForm } from "./post-session-form";
import { PushPrompt } from "./push-prompt";
import { PainAlertForm } from "./pain-alert-form";
import type { PlayingPosition } from "@repo/database/playing-position";
import { StreakCromo } from "./streak-cromo";
import {
  FOCUS_COPY,
  shouldShowAssistedPresence,
  shouldShowCareSilentNote,
  type AgeBand,
} from "../lib/focus-copy";
import { toFocusAgeBand } from "../lib/age-band";
import {
  sessionPageBottomPaddingClass,
  sessionPageBottomStyle,
  shouldReserveFixedSaveClearance,
} from "../lib/session-chrome";


type PolicyAgeBand = "ASSISTED" | "GUIDED" | "INDEPENDENT" | "UNASSIGNED";


type PlayerFormTemplate = {
  readonly id: string;
  readonly name: string;
  readonly questions: Array<{
    readonly id: string;
    readonly key: string;
    readonly label: string;
    readonly type: "SCALE" | "NUMBER" | "BOOLEAN" | "TEXT" | "SINGLE_SELECT";
    readonly mappingKey: string | null;
    readonly minValue: number | null;
    readonly maxValue: number | null;
    readonly step: number | null;
  }>;
};

type SessionPageProperties = {
  readonly token: string;
  readonly playerName: string;
  readonly teamName: string;
  readonly currentStreak: number;
  readonly playingPosition: PlayingPosition | null;
  readonly apiUrl: string;
  readonly selectedDate: string;
  readonly selectedEntry: {
    preFilledAt: Date | null;
    postFilledAt: Date | null;
  } | null;
  readonly selectedSession: {
    id: string;
    title: string;
    type: string;
    startsAt: string;
    endsAt: string;
  } | null;
  readonly preTemplate: PlayerFormTemplate | null;
  readonly postTemplate: PlayerFormTemplate | null;
  /** Resolved from Team/Club Age Band policy — never hard-coded ages in UI. */
  readonly ageBand: PolicyAgeBand;
  readonly parentalSupervisionActive: boolean;
  readonly pushConsent: {
    uiMode: "offer_opt_in" | "offer_assisted_adult" | "subscribed" | "blocked" | "needs_guardian_consent";
    canSubscribe: boolean;
    canOptOut: boolean;
  };
};

function formatShortDate(value: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(value);
}

function resolveInitialTab(preCompleted: boolean, postCompleted: boolean): string {
  return preCompleted && !postCompleted ? "post" : "pre";
}

export function SessionPage({
  token,
  playerName,
  teamName,
  currentStreak,
  playingPosition,
  apiUrl,
  selectedDate,
  selectedEntry,
  selectedSession,
  preTemplate,
  postTemplate,
  ageBand,
  parentalSupervisionActive,
  pushConsent,
}: SessionPageProperties) {
  const focusAgeBand = toFocusAgeBand(ageBand);
  const todayIso = new Date().toISOString().split("T")[0];
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState<string>(selectedDate);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [preCompleted, setPreCompleted] = useState(!!selectedEntry?.preFilledAt);
  const [postCompleted, setPostCompleted] = useState(!!selectedEntry?.postFilledAt);
  const [activeTab, setActiveTab] = useState<string>(
    resolveInitialTab(!!selectedEntry?.preFilledAt, !!selectedEntry?.postFilledAt)
  );
  const [editingPre, setEditingPre] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [streakCount, setStreakCount] = useState(currentStreak);
  const [streakRestarted, setStreakRestarted] = useState(false);
  const [painAlertOpen, setPainAlertOpen] = useState(false);
  const [careTriggered, setCareTriggered] = useState(false);

  useEffect(() => {
    const nextPreCompleted = !!selectedEntry?.preFilledAt;
    const nextPostCompleted = !!selectedEntry?.postFilledAt;

    setDate(selectedDate);
    setPreCompleted(nextPreCompleted);
    setPostCompleted(nextPostCompleted);
    setActiveTab(resolveInitialTab(nextPreCompleted, nextPostCompleted));
    setEditingPre(false);
    setEditingPost(false);
    setStreakCount(currentStreak);
    setStreakRestarted(false);
    setShowDateEdit(false);
    setCareTriggered(false);
  }, [selectedDate, selectedEntry, currentStreak]);

  const isTodaySelected = date === todayIso;

  const handlePreComplete = useCallback(
    (result?: {
      careTriggered?: boolean;
      currentStreak?: number;
      restarted?: boolean;
    }) => {
      setPreCompleted(true);
      setEditingPre(false);
      setActiveTab("post");
      if (result?.careTriggered) {
        setCareTriggered(true);
      }
      if (typeof result?.currentStreak === "number") {
        setStreakCount(result.currentStreak);
        setStreakRestarted(Boolean(result.restarted));
      }
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  const handlePostComplete = useCallback(
    (result?: { currentStreak?: number; restarted?: boolean }) => {
      setPostCompleted(true);
      setEditingPost(false);
      if (typeof result?.currentStreak === "number") {
        setStreakCount(result.currentStreak);
        setStreakRestarted(Boolean(result.restarted));
      }
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  const handleDateChange = useCallback(
    (nextDate: string) => {
      setDate(nextDate);
      startTransition(() => {
        router.replace(nextDate === todayIso ? pathname : `${pathname}?date=${nextDate}`);
      });
    },
    [pathname, router, todayIso]
  );

  const handleEditPre = useCallback(() => {
    setEditingPre(true);
    setEditingPost(false);
    setActiveTab("pre");
  }, []);

  const handleEditPost = useCallback(() => {
    setEditingPost(true);
    setEditingPre(false);
    setActiveTab("post");
  }, []);

  const firstName = useMemo(() => playerName.split(" ")[0], [playerName]);
  const allDone = preCompleted && postCompleted;
  const showCelebration = allDone && !editingPre && !editingPost;
  const showCareNote = shouldShowCareSilentNote(focusAgeBand, careTriggered);
  const reserveFixedSaveClearance = shouldReserveFixedSaveClearance({
    showCelebration,
    activeTab,
    preCompleted,
    postCompleted,
    editingPre,
    editingPost,
    hasPreTemplate: preTemplate !== null,
    hasPostTemplate: postTemplate !== null,
  });

  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pt-5",
        sessionPageBottomPaddingClass(reserveFixedSaveClearance)
      )}
      style={sessionPageBottomStyle(reserveFixedSaveClearance)}
      data-age-band={ageBand}
      data-parental-supervision={parentalSupervisionActive ? "active" : "off"}
      data-fixed-save-clearance={reserveFixedSaveClearance ? "on" : "off"}
    >
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-[1.75rem] font-bold leading-tight tracking-tight text-text-primary">
              Hola, {firstName}
            </h1>
            <button
              type="button"
              onClick={() => setShowDateEdit((previous) => !previous)}
              className="flex min-h-12 items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
              aria-label="Cambiar fecha"
            >
              <CalendarBlankIcon className="h-3.5 w-3.5" weight="fill" />
              <span className="capitalize">
                {date === todayIso
                  ? `Hoy · ${formatShortDate(new Date())}`
                  : formatShortDate(new Date(`${date}T00:00:00`))}
              </span>
            </button>
            {showDateEdit ? (
              <DatePicker
                className="mt-1"
                disabled={isPending}
                max={todayIso}
                onChange={(nextDate) => {
                  setShowDateEdit(false);
                  handleDateChange(nextDate);
                }}
                triggerClassName="min-h-12 rounded-lg"
                value={date}
              />
            ) : null}
          </div>

          {streakCount > 0 ? (
            <span className="inline-flex min-h-10 items-center rounded-full bg-premium/15 px-4 text-sm font-medium text-premium-foreground">
              {FOCUS_COPY.streakCalm(streakCount)}
            </span>
          ) : null}
        </div>

        {shouldShowAssistedPresence(focusAgeBand) ? (
          <p className="text-sm text-text-secondary">
            {FOCUS_COPY.assistedPresence}
          </p>
        ) : null}

        {selectedSession ? (
          <div className="flex items-center justify-between rounded-2xl bg-bg-secondary px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {selectedSession.title}
              </p>
              <p className="text-xs text-text-secondary">
                {new Date(selectedSession.startsAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" – "}
                {new Date(selectedSession.endsAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="rounded-full bg-bg-primary px-2 py-0.5 text-xs font-medium text-text-secondary">
              {selectedSession.type}
            </span>
          </div>
        ) : null}
      </header>

      {showCelebration ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
              {FOCUS_COPY.completionTitle[focusAgeBand]}
            </h2>
            <p className="text-base text-text-secondary">
              {FOCUS_COPY.completionBody[focusAgeBand]}
            </p>
            {isTodaySelected ? (
              <StreakCromo
                streakCount={streakCount}
                restarted={streakRestarted}
                playingPosition={playingPosition}
              />
            ) : (
              <p className="text-sm text-text-tertiary">
                {FOCUS_COPY.pastDateDone}
              </p>
            )}
            {showCareNote ? (
              <p className="rounded-2xl bg-bg-tertiary px-4 py-3 text-sm text-text-secondary">
                {FOCUS_COPY.careSilentNote}
              </p>
            ) : null}
            <div className="mt-2 flex w-full flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditPre}
                className="h-12 min-h-12 rounded-full text-sm font-semibold"
              >
                {FOCUS_COPY.editPre}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditPost}
                className="h-12 min-h-12 rounded-full text-sm font-semibold"
              >
                {FOCUS_COPY.editPost}
              </Button>
            </div>
          </div>
          {isTodaySelected ? (
            <PushPrompt
              token={token}
              apiUrl={apiUrl}
              uiMode={pushConsent.uiMode}
              canSubscribe={pushConsent.canSubscribe}
              canOptOut={pushConsent.canOptOut}
            />
          ) : null}
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 w-full min-w-0 space-y-4"
        >
          <TabsList
            variant="segmented"
            className="grid h-12 w-full grid-cols-2 rounded-full border-0 bg-bg-secondary p-1"
          >
            <TabsTrigger
              value="pre"
              className={cn(
                "h-10 min-h-10 gap-1.5 rounded-full text-sm font-semibold"
              )}
            >
              {preCompleted ? (
                <CheckCircleIcon className="h-4 w-4 text-brand" weight="fill" />
              ) : null}
              Pre-sesión
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className={cn(
                "h-10 min-h-10 gap-1.5 rounded-full text-sm font-semibold"
              )}
            >
              {postCompleted ? (
                <CheckCircleIcon className="h-4 w-4 text-brand" weight="fill" />
              ) : null}
              Post-sesión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="mt-0">
            {preCompleted && !editingPre ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-base font-semibold text-text-primary">
                  {FOCUS_COPY.preDoneTitle}
                </p>
                <p className="text-sm text-text-secondary">
                  {FOCUS_COPY.preDoneBody}
                </p>
                <div className="mt-2 flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEditPre}
                    className="h-12 min-h-12 rounded-full px-6 text-sm font-semibold"
                  >
                    {FOCUS_COPY.editPre}
                  </Button>
                  {!postCompleted ? (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("post")}
                      className="h-12 min-h-12 rounded-full px-6 text-sm font-semibold"
                    >
                      {FOCUS_COPY.goPost}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <PreSessionForm
                key={`${date}-pre`}
                token={token}
                date={date}
                teamSessionId={selectedSession?.id ?? null}
                ageBand={focusAgeBand}
                template={preTemplate}
                onComplete={handlePreComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-0">
            {postCompleted && !editingPost ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-base font-semibold text-text-primary">
                  {FOCUS_COPY.postDoneTitle}
                </p>
                <p className="text-sm text-text-secondary">
                  {FOCUS_COPY.postDoneBody(firstName)}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEditPost}
                  className="mt-2 h-12 min-h-12 rounded-full px-6 text-sm font-semibold"
                >
                  {FOCUS_COPY.editPost}
                </Button>
              </div>
            ) : (
              <PostSessionForm
                key={`${date}-post`}
                token={token}
                date={date}
                teamSessionId={selectedSession?.id ?? null}
                ageBand={focusAgeBand}
                template={postTemplate}
                onComplete={handlePostComplete}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      <footer className="mt-auto pt-4 text-center">
        <Sheet open={painAlertOpen} onOpenChange={setPainAlertOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                data-injury-report-trigger
                className="inline-flex min-h-12 items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-danger"
              >
                <HeartbeatIcon className="h-3.5 w-3.5" weight="fill" />
                ¿Tienes una molestia? Enviar aviso
              </button>
            }
          />
          <SheetContent
            side="bottom"
            className="max-h-[90dvh] overflow-y-auto rounded-t-3xl"
          >
            <SheetHeader className="space-y-1 pb-0">
              <SheetTitle className="text-lg">Aviso de molestia</SheetTitle>
              <SheetDescription>
                Cuéntanos brevemente qué notas. Es un aviso para el equipo, no
                registra una lesión oficial.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <PainAlertForm
                token={token}
                onSuccess={() => setPainAlertOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
        <p className="mt-2 text-[11px] text-text-tertiary">{teamName}</p>
      </footer>
    </div>
  );
}
