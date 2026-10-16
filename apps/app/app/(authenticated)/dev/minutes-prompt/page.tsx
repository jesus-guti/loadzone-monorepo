"use client";

import { TimerIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import type { ReactElement } from "react";
import { Header } from "@/components/layouts/header";
import { MinutesPromptBubble } from "@/features/minutes/components/minutes-prompt-bubble";
import {
  MinutesPromptProvider,
  useMinutesPrompt,
} from "@/features/minutes/components/minutes-prompt-context";
import { MinutesPromptPanel } from "@/features/minutes/components/minutes-prompt-panel";
import { MinutesQuickDialog } from "@/features/minutes/components/minutes-quick-dialog";
import type { MinutesPromptState } from "@/features/minutes/load-minutes-prompt";

const mockState: MinutesPromptState = {
  visible: true,
  pendingSessions: [
    {
      id: "session-training",
      title: "Entrenamiento MD-1",
      type: "TRAINING",
      sharedMinutes: null,
    },
    {
      id: "session-match",
      title: "Liga · Jornada 12",
      type: "MATCH",
      sharedMinutes: null,
    },
  ],
  players: [
    { id: "p1", name: "Álex García" },
    { id: "p2", name: "Bruno Martínez" },
    { id: "p3", name: "Carlos Ruiz" },
    { id: "p4", name: "Dani López" },
  ],
};

function DevMinutesPromptControls(): ReactElement {
  const { openDialog } = useMinutesPrompt();
  return (
    <Button className="md:hidden" onClick={() => openDialog()} type="button">
      <TimerIcon className="size-4" weight="fill" />
      Abrir diálogo
    </Button>
  );
}

export default function DevMinutesPromptPage(): ReactElement {
  if (process.env.NODE_ENV === "production") {
    return (
      <p className="p-8 text-sm text-text-secondary">
        Vista de desarrollo no disponible en producción.
      </p>
    );
  }

  return (
    <MinutesPromptProvider state={mockState}>
      <Header page="Minutos (dev)" pages={["Desarrollo"]} />
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
        <p className="text-sm text-text-secondary">
          Previsualización del recordatorio de minutos (JES-141). Usa los
          controles para capturar mobile y desktop.
        </p>
        <div className="hidden max-w-xs md:block">
          <MinutesPromptPanel />
        </div>
        <DevMinutesPromptControls />
        <MinutesPromptBubble />
        <MinutesQuickDialog />
      </div>
    </MinutesPromptProvider>
  );
}
