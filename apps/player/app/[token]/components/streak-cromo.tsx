"use client";

import type { JSX } from "react";

import { cn } from "@repo/design-system/lib/utils";

import { FOCUS_COPY } from "../lib/focus-copy";
import {
  CROMO_CLAIM,
  CROMO_TIER_LABEL,
  CROMO_TIER_SHELL,
  CROMO_TIER_TEXT_CLASS,
  streakCountToCromoTier,
} from "../lib/streak-cromo";

type StreakCromoProperties = {
  readonly streakCount: number;
  readonly restarted: boolean;
};

export function StreakCromo({
  streakCount,
  restarted,
}: StreakCromoProperties): JSX.Element {
  const tier = streakCountToCromoTier(streakCount);
  const showRestart = restarted || streakCount === 0;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <article
        data-streak-cromo-tier={tier}
        className={cn(
          "relative flex h-80 w-60 flex-col items-center justify-between overflow-hidden rounded-[1.75rem] p-5",
          "border border-white/30 motion-safe:transition-[box-shadow,filter] motion-safe:duration-300",
          CROMO_TIER_TEXT_CLASS[tier]
        )}
        style={{
          ...CROMO_TIER_SHELL[tier],
          backgroundImage: [
            "radial-gradient(ellipse 80% 55% at 50% 12%, oklch(0.95 0.02 160 / var(--cromo-glow)) 0%, transparent 72%)",
            "linear-gradient(180deg, var(--cromo-top) 0%, var(--cromo-bottom) 100%)",
          ].join(", "),
          boxShadow: [
            "inset 0 1.5px 1px 0 oklch(1 0 0 / 0.7)",
            "inset 0 -4px 8px 0 oklch(0.2 0.02 160 / var(--cromo-inset))",
            "0 16px 32px -8px oklch(0.2 0.02 160 / var(--cromo-edge))",
          ].join(", "),
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,oklch(1_0_0/0.12)_50%,transparent_55%)] motion-reduce:hidden"
        />
        <header className="relative z-10 space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
            {CROMO_TIER_LABEL[tier]}
          </p>
          <p className="text-lg font-semibold">{FOCUS_COPY.streakCalm(streakCount)}</p>
        </header>
        <div
          aria-hidden
          className="relative z-10 mb-2 flex h-28 w-24 items-end justify-center rounded-[1.25rem] bg-bg-primary/20"
        >
          <div className="mb-3 h-14 w-14 rounded-full bg-bg-primary/45" />
        </div>
        <p className="relative z-10 text-center text-xs font-medium leading-snug opacity-90">
          {CROMO_CLAIM}
        </p>
      </article>
      {showRestart ? (
        <p className="text-sm text-text-secondary">{FOCUS_COPY.streakRestart}</p>
      ) : null}
    </div>
  );
}
