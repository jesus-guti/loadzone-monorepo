"use client";

import { useState, useCallback } from "react";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import { FlameIcon, CalendarIcon } from "lucide-react";
import { PreSessionForm } from "./pre-session-form";
import { PostSessionForm } from "./post-session-form";
import { PushPrompt } from "./push-prompt";

type SessionPageProperties = {
  readonly token: string;
  readonly playerName: string;
  readonly currentStreak: number;
  readonly apiUrl: string;
  readonly todayEntry: {
    preFilledAt: Date | null;
    postFilledAt: Date | null;
  } | null;
};

export function SessionPage({
  token,
  playerName,
  currentStreak,
  apiUrl,
  todayEntry,
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
    <div className="flex min-h-dvh flex-col px-4 pb-8 pt-6">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hola, {playerName}</h1>
            <p className="text-sm text-muted-foreground">Registro diario</p>
          </div>
          {currentStreak > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 text-sm">
              <FlameIcon className="h-4 w-4 text-orange-500" />
              {currentStreak} días
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm text-foreground focus:outline-none"
          />
        </div>

        {preCompleted && postCompleted && (
          <div className="rounded-xl bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-400">
            Registro del día completado
          </div>
        )}
      </header>

      {preCompleted && postCompleted ? (
        <div className="space-y-6">
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <FlameIcon className="mb-4 h-16 w-16 text-orange-500" />
            <h2 className="text-2xl font-bold">{currentStreak + 1} días</h2>
            <p className="mt-1 text-muted-foreground">
              ¡Racha activa! Sigue así.
            </p>
          </div>
          <PushPrompt token={token} apiUrl={apiUrl} />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pre" className="relative">
              Pre-Sesión
              {preCompleted && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="post" className="relative">
              Post-Sesión
              {postCompleted && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre" className="mt-6">
            {preCompleted ? (
              <div className="rounded-xl bg-green-500/10 px-4 py-6 text-center">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Pre-sesión ya registrada para hoy
                </p>
              </div>
            ) : (
              <PreSessionForm
                token={token}
                date={date}
                onComplete={handlePreComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-6">
            <PostSessionForm
              token={token}
              date={date}
              onComplete={handlePostComplete}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
