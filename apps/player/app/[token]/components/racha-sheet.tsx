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
import {
  useRef,
  useState,
  type JSX,
  type PointerEvent,
} from "react";
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

type CromoProperties = Omit<
  RachaSheetProperties,
  "weekDays" | "weekSessionCount"
>;

function HeaderPhotoDisc({
  imageUrl,
}: {
  readonly imageUrl: string | null;
}): JSX.Element {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = imageUrl !== null && imageUrl !== "" && !photoFailed;

  if (!showPhoto) {
    return (
      <UserCircleIcon
        className="relative m-auto block h-5.5 w-5.5 text-text-primary"
        weight="fill"
      />
    );
  }

  return (
    <span className="relative block size-7 overflow-hidden rounded-full">
      {/* biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: photo load fallback to silhouette */}
      <img
        alt=""
        className="size-full object-cover object-[50%_18%]"
        decoding="async"
        height={28}
        onError={() => {
          setPhotoFailed(true);
        }}
        src={imageUrl}
        width={28}
      />
    </span>
  );
}

/**
 * Header Recoverable Streak pill → bottom Racha sheet (no new route).
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
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const swipeStartY = useRef<number | null>(null);

  const onSwipePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    swipeStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onSwipePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (swipeStartY.current === null) {
      return;
    }
    setDragY(Math.max(0, event.clientY - swipeStartY.current));
  };

  const onSwipePointerUp = (): void => {
    const shouldClose = dragY > 72;
    swipeStartY.current = null;
    setDragY(0);
    if (shouldClose) {
      setOpen(false);
    }
  };

  const cromoProperties: CromoProperties = {
    clubCrestUrl,
    imageUrl,
    playerName,
    playingPosition,
    restarted,
    shirtNumber,
    streakCount,
    teammateStreaks,
    teamName,
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
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
        className={cn(
          "flex h-[98dvh] max-h-[98dvh] flex-col gap-0 overflow-hidden overscroll-none rounded-t-3xl bg-bg-primary pb-[max(1rem,env(safe-area-inset-bottom))]",
          dragY > 0 ? "duration-0" : ""
        )}
        showCloseButton={false}
        side="bottom"
        style={{ translate: `0 ${dragY}px` }}
      >
        <SheetHeader
          className="relative shrink-0 touch-none space-y-1 bg-bg-primary px-4 pb-1 pt-2"
          onPointerCancel={onSwipePointerUp}
          onPointerDown={onSwipePointerDown}
          onPointerMove={onSwipePointerMove}
          onPointerUp={onSwipePointerUp}
        >
          <div className="flex cursor-grab flex-col items-center pb-1 active:cursor-grabbing">
            <span
              aria-hidden
              className="h-1.5 w-12 rounded-full bg-text-primary/25"
            />
          </div>
          <SheetTitle className="text-center text-lg text-text-primary">
            {FOCUS_COPY.streakSheetTitle}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {FOCUS_COPY.streakHero(streakCount)}
          </SheetDescription>
        </SheetHeader>

        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-between overflow-visible px-4 pt-2">
          <div className="relative z-10 flex w-full min-h-0 flex-1 items-start justify-center overflow-visible">
            <StreakCromo
              clubCrestUrl={cromoProperties.clubCrestUrl}
              imageUrl={cromoProperties.imageUrl}
              playerName={cromoProperties.playerName}
              playingPosition={cromoProperties.playingPosition}
              restarted={cromoProperties.restarted}
              shirtNumber={cromoProperties.shirtNumber}
              streakCount={cromoProperties.streakCount}
              teammateStreaks={cromoProperties.teammateStreaks}
              teamName={cromoProperties.teamName}
            />
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1.5 pb-1 text-center">
            <StreakFireIcon
              backColor={STREAK_FIRE_TONE.back}
              className="size-7"
              frontColor={STREAK_FIRE_TONE.front}
            />
            <p className="text-xl font-semibold tracking-tight text-text-primary">
              {FOCUS_COPY.streakHero(streakCount)}
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-2 pt-2">
            <ul
              aria-label="Sesiones del equipo esta semana"
              className="m-0 flex w-full list-none justify-between gap-1 p-0"
            >
              {weekDays.map((day) => (
                <li
                  className="flex flex-1 flex-col items-center gap-1.5"
                  key={day.weekday}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      day.isToday
                        ? "text-text-primary underline decoration-brand underline-offset-4"
                        : "text-text-secondary"
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
                </li>
              ))}
            </ul>
            <p className="text-center text-sm text-text-secondary">
              {FOCUS_COPY.streakWeekBanner(weekSessionCount)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
