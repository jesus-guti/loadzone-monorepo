"use client";

import { TimerIcon } from "@phosphor-icons/react";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";
import { useMinutesPrompt } from "./minutes-prompt-context";

export function MinutesPromptBubble(): ReactElement | null {
  const { state, openDialog } = useMinutesPrompt();

  if (!state.visible || state.pendingSessions.length === 0) {
    return null;
  }

  const count = state.pendingSessions.length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 flex justify-center px-4 md:hidden">
      <button
        className={cn(
          "pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border border-border-secondary",
          "bg-bg-primary px-4 py-3 text-left shadow-floating",
          "motion-safe:transition-transform motion-safe:active:scale-[0.98]"
        )}
        onClick={() => openDialog()}
        type="button"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand/15 text-brand">
          <TimerIcon className="size-5" weight="fill" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-primary">
            Faltan los minutos
          </span>
          <span className="block text-xs text-text-secondary">
            {count === 1
              ? "Una sesión por anotar"
              : `${count} sesiones por anotar`}
          </span>
        </span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-bg-primary tabular-nums">
          {count}
        </span>
      </button>
    </div>
  );
}
