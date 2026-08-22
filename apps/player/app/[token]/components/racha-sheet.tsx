"use client";

import { useState, type JSX } from "react";
import { UserIcon } from "@phosphor-icons/react/User";
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
  readonly playerName?: string | null;
};

function HeaderPhotoDisc({
  imageUrl,
}: {
  readonly imageUrl: string | null;
}): JSX.Element {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = imageUrl !== null && imageUrl !== "" && !photoFailed;

  return (
    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
      {showPhoto ? (
        // biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: photo load fallback to silhouette
        <img
          src={imageUrl}
          alt=""
          width={32}
          height={32}
          className="block h-8 w-8 max-h-8 max-w-8 object-cover"
          onError={() => {
            setPhotoFailed(true);
          }}
        />
      ) : (
        <UserIcon
          className="absolute inset-0 m-auto h-4 w-4 text-text-secondary"
          weight="regular"
        />
      )}
    </span>
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
}: RachaSheetProperties): JSX.Element {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={FOCUS_COPY.streakSheetOpenLabel}
            className="inline-flex shrink-0 rounded-full p-0"
          />
        }
      >
        <span className="flex h-10 items-center overflow-hidden rounded-full border border-text-primary/20 bg-bg-primary pl-2.5 pr-1">
          <StreakFireIcon
            className="h-3.5 w-3.5"
            backColor={STREAK_FIRE_TONE.back}
            frontColor={STREAK_FIRE_TONE.front}
          />
          <span className="pl-1 pr-2.5 text-sm font-semibold tabular-nums text-text-primary">
            {streakCount}
          </span>
          <span className="h-4 w-px shrink-0 bg-text-primary/20" aria-hidden />
          <span className="py-1 pl-2 pr-0.5">
            <HeaderPhotoDisc
              key={imageUrl ?? "none"}
              imageUrl={imageUrl}
            />
          </span>
        </span>
      </SheetTrigger>
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
            <StreakFireIcon
              className="size-10"
              backColor={STREAK_FIRE_TONE.back}
              frontColor={STREAK_FIRE_TONE.front}
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
            playerName={playerName}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
