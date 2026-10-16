"use client";

import { SoccerBallIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { toast } from "@repo/design-system/components/sonner";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { type ReactElement, useEffect, useMemo, useState } from "react";
import { saveSharedMinutes } from "@/features/minutes/actions";
import { useMinutesPrompt } from "@/features/minutes/components/minutes-prompt-context";
import { MinutesRowStepper } from "@/features/minutes/components/minutes-row-stepper";
import { MinutesTabataStepper } from "@/features/minutes/components/minutes-tabata-stepper";
import { DEFAULT_SHARED_MINUTES } from "@/features/minutes/derive";
import type {
  MinutesPromptPlayer,
  MinutesPromptSession,
} from "@/features/minutes/minutes-prompt-types";

function cheerForPlayerIndex(index: number): string {
  if (index === 0) {
    return "Último sprint del día.";
  }
  if (index === 1) {
    return "El cronómetro no miente.";
  }
  return "Minutos que cuentan en Carga.";
}

function SessionMinutesBody({
  activeSession,
  players,
  minutes,
  pending,
  onMinutesChange,
  onSave,
}: {
  readonly activeSession: MinutesPromptSession;
  readonly players: readonly MinutesPromptPlayer[];
  readonly minutes: number;
  readonly pending: boolean;
  readonly onMinutesChange: (next: number) => void;
  readonly onSave: () => void;
}): ReactElement {
  if (activeSession.type === "MATCH") {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <SoccerBallIcon className="size-12 text-brand" weight="fill" />
        <p className="text-sm text-text-secondary">
          {activeSession.title} necesita alineación y cambios. Usa el editor
          completo para calcular minutos por jugador.
        </p>
        <Button
          nativeButton={false}
          render={
            <Link href={`/sessions/${activeSession.id}/minutos`}>
              Abrir alineación
            </Link>
          }
          type="button"
        />
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-text-primary">
          {activeSession.title}
        </p>
        <p className="text-xs text-text-tertiary">
          Misma duración para todo el grupo — el reloj se mueve para todos a la
          vez.
        </p>
      </div>

      <MinutesTabataStepper
        disabled={pending || players.length === 0}
        onChange={onMinutesChange}
        value={minutes}
      />

      {players.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No hay jugadores en el equipo.
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-4">
          {players.map((player, index) => (
            <li
              className="flex flex-col items-center gap-3 rounded-2xl bg-bg-secondary px-4 py-4"
              key={player.id}
            >
              <p className="text-center text-base font-semibold tracking-tight text-text-primary">
                {player.name}
              </p>
              <p className="text-center text-[11px] text-text-tertiary">
                {cheerForPlayerIndex(index)}
              </p>
              <MinutesRowStepper
                disabled={pending}
                onChange={onMinutesChange}
                value={minutes}
              />
            </li>
          ))}
        </ul>
      )}

      <Button
        className="w-full"
        disabled={pending || players.length === 0}
        onClick={onSave}
        type="button"
      >
        {pending ? "Guardando…" : "Guardar minutos"}
      </Button>
    </div>
  );
}

export function MinutesQuickDialog(): ReactElement {
  const { state, dialogOpen, closeDialog, initialSessionId } =
    useMinutesPrompt();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(DEFAULT_SHARED_MINUTES);
  const [pending, setPending] = useState(false);

  const sessions = state.pendingSessions;

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    const preferred =
      initialSessionId && sessions.some((item) => item.id === initialSessionId)
        ? initialSessionId
        : (sessions[0]?.id ?? null);
    setActiveSessionId(preferred);
    const selected = sessions.find((item) => item.id === preferred);
    setMinutes(selected?.sharedMinutes ?? DEFAULT_SHARED_MINUTES);
  }, [dialogOpen, initialSessionId, sessions]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const players = state.players;

  async function handleSaveTraining(): Promise<void> {
    if (!activeSession || activeSession.type === "MATCH") {
      return;
    }
    setPending(true);
    const result = await saveSharedMinutes({
      sessionId: activeSession.id,
      sharedMinutes: minutes,
    });
    setPending(false);
    if (result.success) {
      toast.success("Minutos guardados");
      closeDialog();
    } else {
      toast.error(result.error ?? "No se pudieron guardar los minutos");
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
      open={dialogOpen}
    >
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden bg-bg-primary p-0 text-text-primary sm:max-w-md",
          "max-sm:top-auto max-sm:left-0 max-sm:max-h-[min(92dvh,720px)] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:bottom-0"
        )}
        showCloseButton
      >
        <div className="flex max-h-[min(92dvh,720px)] flex-col overflow-y-auto px-5 pb-6 pt-4">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-xl">Minutos de hoy</DialogTitle>
            <DialogDescription>
              {sessions.length > 1
                ? "Elige la sesión y registra la duración."
                : "Registra la duración del entreno."}
            </DialogDescription>
          </DialogHeader>

          {sessions.length > 1 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setMinutes(session.sharedMinutes ?? DEFAULT_SHARED_MINUTES);
                  }}
                  size="sm"
                  type="button"
                  variant={
                    session.id === activeSessionId ? "default" : "outline"
                  }
                >
                  {session.type === "MATCH" ? "Partido" : "Entreno"} ·{" "}
                  {session.title}
                </Button>
              ))}
            </div>
          ) : null}

          {activeSession !== null ? (
            <SessionMinutesBody
              activeSession={activeSession}
              minutes={minutes}
              onMinutesChange={setMinutes}
              onSave={() => {
                handleSaveTraining().catch(() => {
                  toast.error("No se pudieron guardar los minutos");
                });
              }}
              pending={pending}
              players={players}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
