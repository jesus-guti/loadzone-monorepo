"use client";

import type { JSX } from "react";
import { FireIcon } from "@phosphor-icons/react/Fire";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/sheet";

import { FOCUS_COPY } from "../lib/focus-copy";
import { StreakCromo } from "./streak-cromo";

type RachaSheetProperties = {
  readonly streakCount: number;
  readonly restarted: boolean;
  readonly imageUrl?: string | null;
  readonly clubCrestUrl?: string | null;
  readonly playingPosition?: string | null;
};

/**
 * Header Recoverable Streak pill → tall Racha overlay (no new route).
 * Guardian is not an operator of this sheet; Age Bands share the same chrome.
 */
export function RachaSheet({
  streakCount,
  restarted,
  imageUrl = null,
  clubCrestUrl = null,
  playingPosition = null,
}: RachaSheetProperties): JSX.Element {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={FOCUS_COPY.streakSheetOpenLabel}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-premium/15 px-4 text-sm font-medium text-premium-foreground transition hover:bg-premium/25"
          >
            <FireIcon className="size-3.5" weight="fill" aria-hidden />
            {FOCUS_COPY.streakCalm(streakCount)}
          </button>
        }
      />
      <SheetContent
        side="bottom"
        className="flex h-[90dvh] max-h-[90dvh] flex-col gap-0 overflow-y-auto rounded-t-3xl bg-bg-primary"
      >
        <SheetHeader className="space-y-1 pb-2">
          <SheetTitle className="text-lg text-text-primary">
            {FOCUS_COPY.streakSheetTitle}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {FOCUS_COPY.streakHero(streakCount)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col items-center gap-6 px-4 pb-8 pt-2">
          <div className="flex flex-col items-center gap-2 text-center">
            <FireIcon
              className="size-10 text-premium"
              weight="fill"
              aria-hidden
            />
            <p className="text-2xl font-semibold tracking-tight text-text-primary">
              {FOCUS_COPY.streakHero(streakCount)}
            </p>
          </div>

          <StreakCromo
            streakCount={streakCount}
            restarted={restarted}
            imageUrl={imageUrl}
            clubCrestUrl={clubCrestUrl}
            playingPosition={playingPosition}
          />

          {/* JES-112: insert week row (L–D) + Team Session banner here */}
          <div
            data-slot="jes-112-week-and-banner"
            className="w-full min-h-0"
            aria-hidden
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
