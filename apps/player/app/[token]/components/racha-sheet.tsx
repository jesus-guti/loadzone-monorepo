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
import { cn } from "@repo/design-system/lib/utils";

import { FOCUS_COPY } from "../lib/focus-copy";
import type { RachaWeekDay } from "../lib/racha-week";
import type { PlayingPosition } from "@repo/database/playing-position";
import { StreakCromo } from "./streak-cromo";

type RachaSheetProperties = {
  readonly streakCount: number;
  readonly restarted: boolean;
  readonly weekDays: readonly RachaWeekDay[];
  readonly weekSessionCount: number;
  readonly imageUrl?: string | null;
  readonly clubCrestUrl?: string | null;
  readonly playingPosition?: PlayingPosition | null;
};

/**
 * Header Recoverable Streak pill → tall Racha overlay (no new route).
 * Guardian is not an operator of this sheet; Age Bands share the same chrome.
 * Week marks = all Team Sessions that civil week (not streak expected days).
 */
export function RachaSheet({
  streakCount,
  restarted,
  weekDays,
  weekSessionCount,
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

          <div className="flex w-full max-w-sm flex-col items-center gap-3">
            <div
              className="flex w-full justify-between gap-1"
              role="list"
              aria-label="Sesiones del equipo esta semana"
            >
              {weekDays.map((day) => (
                <div
                  key={day.weekday}
                  role="listitem"
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      "text-xs font-medium text-text-secondary",
                      day.isToday &&
                        "text-text-primary underline decoration-brand underline-offset-4"
                    )}
                  >
                    {day.weekday}
                  </span>
                  <span
                    className={cn(
                      "h-1 w-4 rounded-full",
                      day.hasSession ? "bg-brand" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-text-secondary">
              {FOCUS_COPY.streakWeekBanner(weekSessionCount)}
            </p>
          </div>

          <StreakCromo
            streakCount={streakCount}
            restarted={restarted}
            imageUrl={imageUrl}
            clubCrestUrl={clubCrestUrl}
            playingPosition={playingPosition}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
