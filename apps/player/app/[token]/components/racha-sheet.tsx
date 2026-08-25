"use client";

import { UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { PlayingPosition } from "@repo/database/playing-position";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/sheet";
import { StreakFireIcon } from "@repo/design-system/components/streak-fire-icon";
import { STREAK_FIRE_TONE } from "@repo/design-system/lib/streak-fire-tones";
import { cn } from "@repo/design-system/lib/utils";
import type { JSX } from "react";
import { FOCUS_COPY } from "../lib/focus-copy";
import type { RachaWeekDay } from "../lib/racha-week";
import { StreakCromo } from "./streak-cromo";

type RachaSheetProperties = {
  readonly streakCount: number;
  readonly restarted: boolean;
  readonly weekDays: readonly RachaWeekDay[];
  readonly weekSessionCount: number;
  readonly imageUrl?: string | null;
  readonly clubCrestUrl?: string | null;
  readonly playingPosition?: PlayingPosition | null;
  readonly playerName?: string | null;
  readonly teamName?: string | null;
  readonly shirtNumber?: number | null;
  readonly teammateStreaks?: readonly number[];
};

function HeaderPhotoDisc(): JSX.Element {
  return (
    <UserCircleIcon
      className="relative block m-auto h-5.5 w-5.5 text-text-primary"
      weight="fill"
    />
  );
}

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
  playerName = null,
  teamName = null,
  shirtNumber = null,
  teammateStreaks = [],
}: RachaSheetProperties): JSX.Element {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            aria-label={FOCUS_COPY.streakSheetOpenLabel}
            className="inline-flex shrink-0 rounded-full p-0"
            type="button"
          />
        }
      >
        <span className="flex h-10 items-center overflow-hidden rounded-full border-2 border-text-primary/20 bg-bg-primary pl-2.5 pr-1">
          <StreakFireIcon
            backColor={STREAK_FIRE_TONE.back}
            className="h-5 w-5"
            frontColor={STREAK_FIRE_TONE.front}
          />
          <span className="pl-1 pr-2.5 text-sm font-semibold tabular-nums text-text-primary">
            {streakCount}
          </span>
          <span aria-hidden className="h-6 w-0.5 shrink-0 bg-text-primary/20" />
          <span className="py-1 pl-2 pr-0.5">
            <HeaderPhotoDisc imageUrl={imageUrl} key={imageUrl ?? "none"} />
          </span>
        </span>
      </SheetTrigger>
      <SheetContent
        className="flex min-h-[95dvh] flex-col gap-0 overflow-y-auto rounded-t-3xl bg-bg-primary"
        side="bottom"
      >
        <SheetHeader className="space-y-1 pb-2">
          <SheetTitle className="text-center text-lg text-text-primary">
            {FOCUS_COPY.streakSheetTitle}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {FOCUS_COPY.streakHero(streakCount)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col items-center gap-6 px-4 pb-8 pt-2">
          <StreakCromo
            clubCrestUrl={clubCrestUrl}
            imageUrl={imageUrl}
            playerName={playerName}
            playingPosition={playingPosition}
            restarted={restarted}
            shirtNumber={shirtNumber}
            streakCount={streakCount}
            teammateStreaks={teammateStreaks}
            teamName={teamName}
          />
          <div className="flex flex-col items-center gap-2 text-center mt-auto mb-0">
            <StreakFireIcon
              backColor={STREAK_FIRE_TONE.back}
              className="size-10"
              frontColor={STREAK_FIRE_TONE.front}
            />
            <p className="text-2xl font-semibold tracking-tight text-text-primary">
              {FOCUS_COPY.streakHero(streakCount)}
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center gap-3 mb-auto mt-0">
            <div
              aria-label="Sesiones del equipo esta semana"
              className="flex w-full justify-between gap-1"
              role="list"
            >
              {weekDays.map((day) => (
                <div
                  className="flex flex-1 flex-col items-center gap-1.5"
                  key={day.weekday}
                  role="listitem"
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
                    aria-hidden
                    className={cn(
                      "h-1 w-4 rounded-full",
                      day.hasSession ? "bg-brand" : "bg-transparent"
                    )}
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-text-secondary">
              {FOCUS_COPY.streakWeekBanner(weekSessionCount)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
