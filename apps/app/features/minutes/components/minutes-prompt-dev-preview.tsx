"use client";

import { Button } from "@repo/design-system/components/button";
import type { ReactElement } from "react";
import { MinutesMobilePill } from "@/features/minutes/components/minutes-mobile-pill";
import {
  MinutesPromptProvider,
  useMinutesPrompt,
} from "@/features/minutes/components/minutes-prompt-context";
import { MinutesQuickDialog } from "@/features/minutes/components/minutes-quick-dialog";
import { MinutesSidebarPanel } from "@/features/minutes/components/minutes-sidebar-panel";
import type { MinutesPromptState } from "@/features/minutes/minutes-prompt-types";

const MOCK_STATE: MinutesPromptState = {
  promptHour: 20,
  pendingSessions: [
    {
      id: "session-1",
      title: "MD-1 · Fuerza",
      type: "TRAINING",
      sharedMinutes: null,
    },
  ],
  players: [
    { id: "p1", name: "Lucía García" },
    { id: "p2", name: "Mateo Ruiz" },
    { id: "p3", name: "Hugo Martín" },
  ],
};

function PreviewControls(): ReactElement {
  const { openDialog } = useMinutesPrompt();
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <Button onClick={() => openDialog()} type="button">
        Abrir diálogo
      </Button>
    </div>
  );
}

export function MinutesPromptDevPreview(): ReactElement {
  return (
    <MinutesPromptProvider state={MOCK_STATE}>
      <div className="grid min-h-svh md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border-secondary bg-bg-secondary p-4 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Escritorio
          </p>
          <MinutesSidebarPanel />
        </aside>
        <main className="relative flex min-h-svh flex-col">
          <p className="p-4 text-xs font-semibold uppercase tracking-wide text-text-tertiary md:hidden">
            Móvil
          </p>
          <PreviewControls />
          <div className="flex-1" />
          <div className="h-16 border-t border-border-secondary bg-bg-tertiary md:hidden" />
          <MinutesMobilePill />
          <MinutesQuickDialog />
        </main>
      </div>
    </MinutesPromptProvider>
  );
}
