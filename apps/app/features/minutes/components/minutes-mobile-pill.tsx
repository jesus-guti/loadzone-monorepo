"use client";

import { TimerIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement } from "react";
import { useMinutesPrompt } from "@/features/minutes/components/minutes-prompt-context";

export function MinutesMobilePill(): ReactElement | null {
  const { state, openDialog } = useMinutesPrompt();
  const count = state.pendingSessions.length;
  if (count === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 md:hidden bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]">
      <button
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-brand bg-bg-primary px-4 py-2.5 text-sm font-semibold text-text-primary shadow-lg transition-transform active:scale-[0.98]",
          "ring-2 ring-brand/20"
        )}
        onClick={() => {
          openDialog();
        }}
        type="button"
      >
        <TimerIcon className="size-5 shrink-0 text-brand" weight="fill" />
        <span className="truncate">
          {count === 1
            ? "Faltan los minutos de hoy"
            : `Faltan minutos (${count} sesiones)`}
        </span>
      </button>
    </div>
  );
}
