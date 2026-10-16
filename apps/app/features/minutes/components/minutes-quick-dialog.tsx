"use client";

import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { cn } from "@repo/design-system/lib/utils";
import { useRouter } from "next/navigation";
import { type ReactElement, useEffect, useState } from "react";
import { saveSharedMinutes } from "@/features/minutes/actions";
import { defaultSharedMinutesForType } from "@/features/minutes/clamp-minutes";
import { useMinutesPrompt } from "./minutes-prompt-context";
import { MinutesRowStepper } from "./minutes-row-stepper";
import { MinutesTabataStepper } from "./minutes-tabata-stepper";

export function MinutesQuickDialog(): ReactElement {
  const router = useRouter();
  const {
    dialogOpen,
    setDialogOpen,
    selectedSession,
    state,
    selectedSessionId,
    selectSession,
  } = useMinutesPrompt();
  const [minutes, setMinutes] = useState(80);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSession) {
      return;
    }
    setMinutes(
      selectedSession.sharedMinutes ??
        defaultSharedMinutesForType(selectedSession.type)
    );
    setError(null);
  }, [selectedSession]);

  async function save(): Promise<void> {
    if (!selectedSession) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await saveSharedMinutes({
      sessionId: selectedSession.id,
      sharedMinutes: minutes,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "No se pudieron guardar los minutos.");
      return;
    }
    setDialogOpen(false);
    router.refresh();
  }

  const showRoster = state.players.length > 0 && state.players.length <= 24;

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogContent
        className={cn(
          "max-h-[min(90dvh,720px)] overflow-y-auto bg-bg-primary text-text-primary sm:max-w-md",
          "rounded-3xl border-border-secondary"
        )}
        showCloseButton
      >
        <DialogTitle className="px-4 pt-4 text-center text-lg font-semibold">
          Minutos de hoy
        </DialogTitle>
        <p className="px-4 text-center text-sm text-text-secondary">
          Mismo valor para todo el grupo. Ajusta y guarda en segundos.
        </p>

        {state.pendingSessions.length > 1 ? (
          <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
            {state.pendingSessions.map((session) => (
              <Button
                key={session.id}
                onClick={() => selectSession(session.id)}
                size="sm"
                type="button"
                variant={
                  (selectedSessionId ?? selectedSession?.id) === session.id
                    ? "default"
                    : "outline"
                }
              >
                {session.type === "MATCH" ? "Partido" : "Sesión"} ·{" "}
                {session.title}
              </Button>
            ))}
          </div>
        ) : null}
        {state.pendingSessions.length === 1 && selectedSession ? (
          <p className="px-4 text-center text-sm font-medium text-text-primary">
            {selectedSession.title}
          </p>
        ) : null}

        <div className="px-4 py-4">
          <MinutesTabataStepper
            disabled={pending}
            onChange={setMinutes}
            value={minutes}
          />
        </div>

        {showRoster ? (
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto px-4 pb-2">
            {state.players.map((player, index) => (
              <MinutesRowStepper
                disabled={pending}
                index={index}
                key={player.id}
                onChange={setMinutes}
                playerName={player.name}
                value={minutes}
              />
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="px-4 text-center text-sm text-danger">{error}</p>
        ) : null}

        <div className="px-4 pt-2 pb-4">
          <Button
            className="w-full"
            disabled={pending || !selectedSession}
            onClick={() => {
              save().catch(() =>
                setError("No se pudieron guardar los minutos.")
              );
            }}
            type="button"
          >
            {pending ? "Guardando…" : "Guardar minutos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
