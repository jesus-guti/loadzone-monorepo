import { MinutesPromptBubble } from "@/features/minutes/components/minutes-prompt-bubble";
import { MinutesPromptPanel } from "@/features/minutes/components/minutes-prompt-panel";
import { MinutesPromptProvider } from "@/features/minutes/components/minutes-prompt-context";
import { MinutesQuickDialog } from "@/features/minutes/components/minutes-quick-dialog";
import type { MinutesPromptState } from "@/features/minutes/load-minutes-prompt";
import type { ReactElement } from "react";

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

export default function MinutesUiPreviewPage(): ReactElement {
  if (process.env.NODE_ENV === "production") {
    return (
      <p className="p-8 text-sm text-text-secondary">No disponible.</p>
    );
  }

  return (
    <MinutesPromptProvider state={mockState}>
      <div className="min-h-dvh bg-bg-secondary">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-end pb-24 md:max-w-5xl md:flex-row md:items-end md:justify-start md:gap-8 md:p-8">
          <div className="hidden w-64 md:block">
            <MinutesPromptPanel />
          </div>
          <div className="relative flex-1 p-4 md:p-0">
            <MinutesPromptBubble />
          </div>
        </div>
        <MinutesQuickDialog />
      </div>
    </MinutesPromptProvider>
  );
}
