"use client";

import { useState, useCallback, useMemo } from "react";
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
  CalendarIcon,
  CheckCircle2Icon,
  FlameIcon,
  HeartPulseIcon,
} from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
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
  readonly todayEntry: {
    preFilledAt: Date | null;
    postFilledAt: Date | null;
  } | null;
  readonly todaySession: {
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

export function SessionPage({
  token,
  playerName,
  teamName,
  currentStreak,
  apiUrl,
  todayEntry,
  todaySession,
  preTemplate,
  postTemplate,
}: SessionPageProperties) {
  const todayIso = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(todayIso);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [preCompleted, setPreCompleted] = useState(!!todayEntry?.preFilledAt);
  const [postCompleted, setPostCompleted] = useState(!!todayEntry?.postFilledAt);
  const [activeTab, setActiveTab] = useState<string>(
    preCompleted && !postCompleted ? "post" : "pre"
  );
  const [injuryOpen, setInjuryOpen] = useState(false);

  const handlePreComplete = useCallback(() => {
    setPreCompleted(true);
    setActiveTab("post");
  }, []);

  const handlePostComplete = useCallback(() => {
    setPostCompleted(true);
  }, []);

  const firstName = useMemo(() => playerName.split(" ")[0], [playerName]);
  const allDone = preCompleted && postCompleted;

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
              <CalendarIcon className="h-3.5 w-3.5" />
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
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 rounded-lg bg-bg-secondary px-2 py-1 text-xs text-text-primary focus:outline-none"
              />
            ) : null}
          </div>

          {currentStreak > 0 ? (
            <Badge
              variant="secondary"
              className="h-8 gap-1.5 rounded-full bg-bg-secondary px-3 text-sm font-semibold text-text-primary"
            >
              <FlameIcon className="h-4 w-4 text-premium" />
              {currentStreak}
            </Badge>
          ) : null}
        </div>

        {todaySession ? (
          <div className="flex items-center justify-between rounded-2xl bg-bg-secondary px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {todaySession.title}
              </p>
              <p className="text-xs text-text-secondary">
                {new Date(todaySession.startsAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" – "}
                {new Date(todaySession.endsAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="rounded-full bg-bg-primary px-2 py-0.5 text-xs font-medium text-text-secondary">
              {todaySession.type}
            </span>
          </div>
        ) : null}
      </header>

      {allDone ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-bg-secondary px-6 py-12 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-premium/15">
              <FlameIcon className="h-10 w-10 text-premium" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-text-primary">
              {currentStreak + 1} días
            </h2>
            <p className="text-sm text-text-secondary">
              ¡Racha activa! Nos vemos mañana.
            </p>
          </div>
          <PushPrompt token={token} apiUrl={apiUrl} />
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
                <CheckCircle2Icon className="h-4 w-4 text-brand" />
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
                <CheckCircle2Icon className="h-4 w-4 text-brand" />
              ) : null}
              Post-sesión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="mt-0">
            {preCompleted ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg-secondary px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand/15">
                  <CheckCircle2Icon className="h-7 w-7 text-brand" />
                </div>
                <p className="text-base font-semibold text-text-primary">
                  Pre-sesión registrada
                </p>
                <p className="text-sm text-text-secondary">
                  Sigue con la parte post-sesión cuando termines.
                </p>
                <Button
                  type="button"
                  onClick={() => setActiveTab("post")}
                  className="mt-2 h-12 rounded-full px-6 text-sm font-semibold"
                >
                  Ir a Post-sesión
                </Button>
              </div>
            ) : (
              <PreSessionForm
                token={token}
                date={date}
                teamSessionId={todaySession?.id ?? null}
                template={preTemplate}
                onComplete={handlePreComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-0">
            {postCompleted ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-bg-secondary px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand/15">
                  <CheckCircle2Icon className="h-7 w-7 text-brand" />
                </div>
                <p className="text-base font-semibold text-text-primary">
                  Post-sesión registrada
                </p>
                <p className="text-sm text-text-secondary">
                  Buen trabajo, {firstName}.
                </p>
              </div>
            ) : (
              <PostSessionForm
                token={token}
                date={date}
                teamSessionId={todaySession?.id ?? null}
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
              <HeartPulseIcon className="h-3.5 w-3.5" />
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
