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
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { DEFAULT_SHARED_MINUTES } from "@/features/minutes/derive";
import { saveSharedMinutes } from "@/features/minutes/actions";
import { MinutesRowStepper } from "@/features/minutes/components/minutes-row-stepper";
import { useMinutesPrompt } from "@/features/minutes/components/minutes-prompt-context";

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
      initialSessionId &&
      sessions.some((session) => session.id === initialSessionId)
        ? initialSessionId
        : sessions[0]?.id ?? null;
    setActiveSessionId(preferred);
    const session = sessions.find((item) => item.id === preferred);
    setMinutes(session?.sharedMinutes ?? DEFAULT_SHARED_MINUTES);
  }, [dialogOpen, initialSessionId, sessions]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const players = state.players;

  async function handleSaveTraining(): Promise<void> {
    if (!activeSession) {
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
          "gap-0 overflow-hidden p-0 sm:max-w-md",
          "max-sm:top-auto max-sm:left-0 max-sm:max-h-[min(92dvh,720px)] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:bottom-0",
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
                    setMinutes(
                      session.sharedMinutes ?? DEFAULT_SHARED_MINUTES,
                    );
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

          {activeSession && activeSession.type === "MATCH" ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <SoccerBallIcon
                className="size-12 text-brand"
                weight="fill"
              />
              <p className="text-sm text-text-secondary">
                {activeSession.title} necesita alineación y cambios. Usa el
                editor completo para calcular minutos por jugador.
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
          ) : activeSession ? (
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium text-text-primary">
                  {activeSession.title}
                </p>
                <p className="text-xs text-text-tertiary">
                  Misma duración para todo el grupo — el reloj se mueve para
                  todos a la vez.
                </p>
              </div>

              {players.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No hay jugadores en el equipo.
                </p>
              ) : (
                <ul className="flex w-full flex-col gap-6">
                  {players.map((player, index) => (
                    <li
                      className="flex flex-col items-center gap-3 rounded-2xl bg-bg-secondary px-4 py-5"
                      key={player.id}
                    >
                      <p className="text-center text-lg font-semibold tracking-tight text-text-primary">
                        {player.name}
                      </p>
                      <p className="text-center text-[11px] text-text-tertiary">
                        {index === 0
                          ? "Último sprint del día."
                          : index === 1
                            ? "El cronómetro no miente."
                            : "Minutos que cuentan en Carga."}
                      </p>
                      <MinutesRowStepper
                        disabled={pending}
                        onChange={setMinutes}
                        value={minutes}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <Button
                className="w-full"
                disabled={pending || players.length === 0}
                onClick={() => {
                  handleSaveTraining().catch(() => {
                    toast.error("No se pudieron guardar los minutos");
                  });
                }}
                type="button"
              >
                {pending ? "Guardando…" : "Guardar minutos"}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
