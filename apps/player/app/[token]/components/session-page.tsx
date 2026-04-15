"use client";

import { useState, useCallback } from "react";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import { FlameIcon, CalendarIcon, HeartPulseIcon } from "lucide-react";
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
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [preCompleted, setPreCompleted] = useState(!!todayEntry?.preFilledAt);
  const [postCompleted, setPostCompleted] = useState(!!todayEntry?.postFilledAt);
  const [activeTab, setActiveTab] = useState<string>(
    preCompleted && !postCompleted ? "post" : "pre"
  );

  const handlePreComplete = useCallback(() => {
    setPreCompleted(true);
    setActiveTab("post");
  }, []);

  const handlePostComplete = useCallback(() => {
    setPostCompleted(true);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pb-10 pt-4">
      <header className="space-y-4">
        <div className="rounded-[1.75rem] bg-bg-secondary px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                Check-in diario
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                Hola, {playerName}
              </h1>
              <p className="text-sm text-text-secondary">
                {teamName}: completa tu registro antes y después de entrenar.
              </p>
            </div>
            {currentStreak > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full bg-bg-primary px-3 py-1 text-sm text-text-primary"
              >
                <FlameIcon className="h-4 w-4 text-premium" />
                {currentStreak} días
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] bg-bg-primary px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-bg-tertiary">
              <CalendarIcon className="h-4 w-4 text-text-secondary" />
            </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-text-primary focus:outline-none"
          />
        </div>
        </div>

        {todaySession ? (
          <div className="rounded-3xl bg-bg-secondary px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
              Sesión de hoy
            </p>
            <p className="mt-1 text-base font-semibold text-text-primary">
              {todaySession.title}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {new Date(todaySession.startsAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(todaySession.endsAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {todaySession.type}
            </p>
          </div>
        ) : null}

        {preCompleted && postCompleted && (
          <div className="rounded-3xl bg-bg-secondary px-4 py-4 text-center">
            <p className="text-sm font-medium text-text-primary">
              Registro del día completado
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Todo listo por hoy. Mantén la racha.
            </p>
          </div>
        )}
      </header>

      {preCompleted && postCompleted ? (
        <div className="space-y-6">
          <div className="flex flex-1 flex-col items-center justify-center rounded-4xl bg-bg-secondary px-6 py-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-bg-primary">
              <FlameIcon className="h-8 w-8 text-premium" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
              {currentStreak + 1} días
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              ¡Racha activa! Sigue así.
            </p>
          </div>
          <PushPrompt token={token} apiUrl={apiUrl} />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-[1.75rem] bg-bg-secondary p-1.5">
            <TabsTrigger value="pre" className="relative">
              Pre-Sesión
              {preCompleted && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand" />
              )}
            </TabsTrigger>
            <TabsTrigger value="post" className="relative">
              Post-Sesión
              {postCompleted && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand" />
              )}
            </TabsTrigger>
            <TabsTrigger value="injury" className="relative">
              <HeartPulseIcon className="mr-1 h-4 w-4" />
              Lesión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="mt-0">
            {preCompleted ? (
              <div className="rounded-3xl bg-bg-secondary px-4 py-6 text-center">
                <p className="font-medium text-text-primary">
                  Pre-sesión ya registrada para hoy
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Puedes revisar o continuar con la parte post-sesión.
                </p>
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
            <PostSessionForm
              token={token}
              date={date}
              teamSessionId={todaySession?.id ?? null}
              template={postTemplate}
              onComplete={handlePostComplete}
            />
          </TabsContent>

          <TabsContent value="injury" className="mt-0">
            <InjuryReportForm token={token} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
