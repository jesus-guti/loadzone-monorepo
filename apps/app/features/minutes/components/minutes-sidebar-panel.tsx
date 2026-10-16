"use client";

import { TimerIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/button";
import type { ReactElement } from "react";
import { useMinutesPrompt } from "@/features/minutes/components/minutes-prompt-context";

export function MinutesSidebarPanel(): ReactElement | null {
  const { state, openDialog } = useMinutesPrompt();
  const pending = state.pendingSessions;
  if (pending.length === 0) {
    return null;
  }

  return (
    <div className="rounded-sm border border-brand/40 bg-bg-primary p-2.5">
      <div className="mb-2 flex items-start gap-2">
        <TimerIcon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-brand"
          weight="fill"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-text-primary">
            Minutos de hoy
          </p>
          <p className="text-[11px] text-text-secondary">
            {pending.length === 1
              ? "Una sesión sin registrar."
              : `${pending.length} sesiones pendientes.`}
          </p>
        </div>
      </div>
      <ul className="mb-2 flex flex-col gap-0.5">
        {pending.map((session) => (
          <li
            className="truncate px-1 text-[11px] text-text-secondary"
            key={session.id}
          >
            {session.type === "MATCH" ? "Alinear" : "Minutos"} ·{" "}
            {session.title}
          </li>
        ))}
      </ul>
      <Button
        className="w-full"
        onClick={() => {
          openDialog();
        }}
        size="sm"
        type="button"
      >
        Registrar ahora
      </Button>
    </div>
  );
}
