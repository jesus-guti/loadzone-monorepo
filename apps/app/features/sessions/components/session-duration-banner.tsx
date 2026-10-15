"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { useState, type ReactElement } from "react";
import { setSessionDuration } from "../actions/set-session-duration";
import {
  clampDurationMinutes,
  displayedDurationMinutes,
  SESSION_DURATION_MAX,
  SESSION_DURATION_MIN,
  stepDurationMinutes,
  type SessionDurationType,
} from "../session-duration";

type SessionDurationBannerProps = {
  sessionId: string;
  sessionType: SessionDurationType;
  savedMinutes: number | null;
};

export function SessionDurationBanner({
  sessionId,
  sessionType,
  savedMinutes,
}: SessionDurationBannerProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(() =>
    displayedDurationMinutes(sessionType, savedMinutes)
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMatch = sessionType === "MATCH";

  async function save(): Promise<void> {
    setPending(true);
    setError(null);
    const result = await setSessionDuration({
      sessionId,
      durationMinutes: minutes,
    });
    setPending(false);
    if (!result.success) {
      setError(
        result.error ?? "No se pudieron guardar los minutos. Vuelve a intentarlo."
      );
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-16 z-40 px-4 pb-2 md:bottom-0 md:pb-4">
        <button
          className="flex w-full items-center justify-between rounded-lg border border-border-secondary bg-bg-primary px-4 py-3 text-left"
          onClick={() => {
            setMinutes(displayedDurationMinutes(sessionType, savedMinutes));
            setError(null);
            setOpen(true);
          }}
          type="button"
        >
          <span className="text-sm font-medium text-text-primary">
            {isMatch ? "Anotar duración del partido" : "Anotar minutos"}
          </span>
          <span className="text-sm text-text-secondary tabular-nums">
            {displayedDurationMinutes(sessionType, savedMinutes)} min
          </span>
        </button>
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent
          className="bg-bg-primary text-text-primary sm:max-w-md"
          showCloseButton
        >
          <DialogTitle className="px-4 pt-4 text-base">
            {isMatch ? "Duración del partido" : "Minutos de la sesión"}
          </DialogTitle>
          <div className="flex items-center justify-center gap-4 px-4 pb-2">
            <Button
              aria-label="Quitar un minuto"
              className="size-14"
              disabled={pending}
              onClick={() => setMinutes((current) => stepDurationMinutes(current, -1))}
              size="icon"
              type="button"
              variant="outline"
            >
              <MinusIcon className="size-7" weight="fill" />
            </Button>
            <label className="sr-only" htmlFor="session-duration-minutes">
              Minutos
            </label>
            <input
              className="w-24 border-0 bg-transparent text-center text-5xl font-semibold text-text-primary tabular-nums outline-none"
              disabled={pending}
              id="session-duration-minutes"
              inputMode="numeric"
              max={SESSION_DURATION_MAX}
              min={SESSION_DURATION_MIN}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10);
                if (Number.isNaN(next)) {
                  return;
                }
                setMinutes(clampDurationMinutes(next));
              }}
              type="number"
              value={minutes}
            />
            <Button
              aria-label="Añadir un minuto"
              className="size-14"
              disabled={pending}
              onClick={() => setMinutes((current) => stepDurationMinutes(current, 1))}
              size="icon"
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-7" weight="fill" />
            </Button>
          </div>
          {error ? (
            <p className="px-4 text-sm text-danger">{error}</p>
          ) : null}
          <div className="px-4 pt-2 pb-4">
            <Button
              className="w-full"
              disabled={pending}
              onClick={() => {
                void save();
              }}
              type="button"
            >
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
