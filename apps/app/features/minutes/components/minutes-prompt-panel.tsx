"use client";

import { TimerIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import type { ReactElement } from "react";
import { useMinutesPrompt } from "./minutes-prompt-context";

export function MinutesPromptPanel(): ReactElement | null {
  const { state, openDialog } = useMinutesPrompt();

  if (!state.visible || state.pendingSessions.length === 0) {
    return null;
  }

  const count = state.pendingSessions.length;

  return (
    <div className="hidden rounded-sm border border-border-secondary bg-bg-primary p-2.5 md:block">
      <div className="mb-2 flex items-start gap-2">
        <TimerIcon
          className="mt-0.5 size-4 shrink-0 text-brand"
          weight="fill"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-text-primary">
            Minutos de hoy
          </p>
          <p className="text-[11px] text-text-secondary">
            {count === 1
              ? "1 sesión sin anotar"
              : `${count} sesiones sin anotar`}
          </p>
        </div>
      </div>
      <ul className="mb-2 max-h-24 space-y-1 overflow-y-auto text-[11px] text-text-secondary">
        {state.pendingSessions.map((session) => (
          <li className="truncate" key={session.id}>
            {session.type === "MATCH" ? "Partido" : "Sesión"} · {session.title}
          </li>
        ))}
      </ul>
      <Button
        className="w-full"
        onClick={() => openDialog()}
        size="sm"
        type="button"
      >
        Anotar minutos
      </Button>
    </div>
  );
}
