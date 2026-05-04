"use client";

import { useState, useCallback, useEffect, useMemo, useTransition } from "react";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  FlameIcon,
  HeartbeatIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@repo/design-system/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { PreSessionForm } from "./pre-session-form";
import { PostSessionForm } from "./post-session-form";
import { PushPrompt } from "./push-prompt";
import { InjuryReportForm } from "./injury-report-form";

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
  apiUrl,
  selectedDate,
  selectedEntry,
  selectedSession,
  preTemplate,
  postTemplate,
}: SessionPageProperties) {
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
  const [injuryOpen, setInjuryOpen] = useState(false);

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
    setShowDateEdit(false);
  }, [selectedDate, selectedEntry, currentStreak]);

  const isTodaySelected = date === todayIso;

  const handlePreComplete = useCallback(() => {
    const shouldIncreaseStreak = !preCompleted && isTodaySelected;
    setPreCompleted(true);
    setEditingPre(false);
    setActiveTab("post");
    if (shouldIncreaseStreak) {
      setStreakCount((previous) => Math.max(previous, currentStreak + 1));
    }
    startTransition(() => {
      router.refresh();
    });
  }, [currentStreak, isTodaySelected, preCompleted, router]);

  const handlePostComplete = useCallback(() => {
    setPostCompleted(true);
    setEditingPost(false);
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-10 pt-5">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-[1.75rem] font-bold leading-tight tracking-tight text-text-primary">
              Hola, {firstName}
            </h1>
            <button
              type="button"
              onClick={() => setShowDateEdit((previous) => !previous)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
              aria-label="Cambiar fecha"
            >
              <CalendarBlankIcon className="h-3.5 w-3.5" />
              <span className="capitalize">
                {date === todayIso
                  ? `Hoy · ${formatShortDate(new Date())}`
                  : formatShortDate(new Date(`${date}T00:00:00`))}
              </span>
            </button>
            {showDateEdit ? (
              <input
                type="date"
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                disabled={isPending}
                className="mt-1 rounded-lg bg-bg-secondary px-2 py-1 text-xs text-text-primary focus:outline-none"
              />
            ) : null}
          </div>

          {streakCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-8 gap-1.5 rounded-full bg-bg-secondary px-3 text-sm font-semibold text-text-primary"
            >
              <FlameIcon className="h-4 w-4 text-premium" />
              {streakCount}
            </Badge>
          ) : null}
        </div>

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
          <div className="flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-bg-secondary px-6 py-12 text-center">
            <div
              className={cn(
                "flex size-20 items-center justify-center rounded-full",
                isTodaySelected ? "bg-premium/15" : "bg-brand/15"
              )}
            >
              {isTodaySelected ? (
                <FlameIcon className="h-10 w-10 text-premium" />
              ) : (
                <CheckCircleIcon className="h-10 w-10 text-brand" />
              )}
            </div>
            <h2 className="text-4xl font-black tracking-tight text-text-primary">
              {isTodaySelected ? `${streakCount} días` : "Sesiones completas"}
            </h2>
            <p className="text-sm text-text-secondary">
              {isTodaySelected
                ? "¡Racha activa! Nos vemos mañana."
                : "Esta fecha ya tiene pre y post-sesión registradas."}
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditPre}
                className="h-11 rounded-full text-sm font-semibold"
              >
                Editar pre-sesión
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditPost}
                className="h-11 rounded-full text-sm font-semibold"
              >
                Editar post-sesión
              </Button>
            </div>
          </div>
          {isTodaySelected ? <PushPrompt token={token} apiUrl={apiUrl} /> : null}
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 space-y-4"
        >
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-bg-secondary p-1">
            <TabsTrigger
              value="pre"
              className={cn(
                "h-10 gap-1.5 rounded-full text-sm font-semibold data-[state=active]:bg-bg-primary data-[state=active]:shadow-soft"
              )}
            >
              {preCompleted ? (
                <CheckCircleIcon className="h-4 w-4 text-brand" />
              ) : null}
              Pre-sesión
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className={cn(
                "h-10 gap-1.5 rounded-full text-sm font-semibold data-[state=active]:bg-bg-primary data-[state=active]:shadow-soft"
              )}
            >
              {postCompleted ? (
                <CheckCircleIcon className="h-4 w-4 text-brand" />
              ) : null}
              Post-sesión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="mt-0">
            {preCompleted && !editingPre ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg-secondary px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand/15">
                  <CheckCircleIcon className="h-7 w-7 text-brand" />
                </div>
                <p className="text-base font-semibold text-text-primary">
                  Pre-sesión registrada
                </p>
                <p className="text-sm text-text-secondary">
                  Sigue con la parte post-sesión cuando termines.
                </p>
                <div className="mt-2 flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEditPre}
                    className="h-12 rounded-full px-6 text-sm font-semibold"
                  >
                    Editar pre-sesión
                  </Button>
                  {!postCompleted ? (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("post")}
                      className="h-12 rounded-full px-6 text-sm font-semibold"
                    >
                      Ir a Post-sesión
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
                template={preTemplate}
                onComplete={handlePreComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-0">
            {postCompleted && !editingPost ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg-secondary px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand/15">
                  <CheckCircleIcon className="h-7 w-7 text-brand" />
                </div>
                <p className="text-base font-semibold text-text-primary">
                  Post-sesión registrada
                </p>
                <p className="text-sm text-text-secondary">
                  Buen trabajo, {firstName}.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEditPost}
                  className="mt-2 h-12 rounded-full px-6 text-sm font-semibold"
                >
                  Editar post-sesión
                </Button>
              </div>
            ) : (
              <PostSessionForm
                key={`${date}-post`}
                token={token}
                date={date}
                teamSessionId={selectedSession?.id ?? null}
                template={postTemplate}
                onComplete={handlePostComplete}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      <footer className="mt-auto pt-4 text-center">
        <Sheet open={injuryOpen} onOpenChange={setInjuryOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary transition hover:text-danger"
            >
              <HeartbeatIcon className="h-3.5 w-3.5" />
              ¿Tienes una molestia? Reportar lesión
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[90dvh] overflow-y-auto rounded-t-3xl"
          >
            <SheetHeader className="space-y-1 pb-0">
              <SheetTitle className="text-lg">Reportar lesión</SheetTitle>
              <SheetDescription>
                Cuéntanos brevemente qué notas. El equipo técnico lo revisa hoy.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <InjuryReportForm token={token} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="mt-2 text-[11px] text-text-tertiary">{teamName}</p>
      </footer>
    </div>
  );
}
