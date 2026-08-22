"use client";

import { UserIcon } from "@phosphor-icons/react/User";
import type { PlayingPosition } from "@repo/database/playing-position";
import { formatPlayingPositionCromoLine } from "@repo/database/playing-position";
import { StreakFireIcon } from "@repo/design-system/components/streak-fire-icon";
import { STREAK_FIRE_TONE } from "@repo/design-system/lib/streak-fire-tones";
import { cn } from "@repo/design-system/lib/utils";
import { type JSX, useState } from "react";

import { FOCUS_COPY } from "../lib/focus-copy";
import {
  CROMO_CLAIM,
  CROMO_TIER_LABEL,
  CROMO_TIER_SHELL,
  streakCountToCromoTier,
} from "../lib/streak-cromo";

type StreakCromoProperties = {
  readonly streakCount: number;
  readonly restarted: boolean;
  /** Staff-uploaded Player photo display URL; calm silhouette when null. */
  readonly imageUrl?: string | null;
  /** Club.logoUrl crest only — omit when null; never Team logo. */
  readonly clubCrestUrl?: string | null;
  /** Optional Player Playing Position; omitted line when null/undefined. */
  readonly playingPosition?: PlayingPosition | null;
  /** Roster display name; omitted when empty (lab). */
  readonly playerName?: string | null;
};

function CromoSilhouette(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 opacity-70">
      <div className="flex size-20 items-center justify-center rounded-full bg-bg-primary/40">
        <UserIcon className="size-11" weight="regular" />
      </div>
      <div className="h-10 w-16 rounded-t-3xl bg-bg-primary/40" />
    </div>
  );
}

export function StreakCromo({
  streakCount,
  restarted,
  imageUrl = null,
  clubCrestUrl = null,
  playingPosition = null,
  playerName = null,
}: StreakCromoProperties): JSX.Element {
  const tier = streakCountToCromoTier(streakCount);
  const showRestart = restarted || streakCount === 0;
  const positionLine = formatPlayingPositionCromoLine(playingPosition);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoRevealed, setPhotoRevealed] = useState(false);
  const showPhoto = imageUrl !== null && imageUrl !== "" && !photoFailed;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <article
        className={cn(
          "relative flex w-[min(100%,16.5rem)] flex-col gap-4 overflow-hidden rounded-[1.25rem] p-4",
          "border-2 border-text-primary bg-bg-primary",
          "text-text-primary motion-safe:transition-[border-color] motion-safe:duration-300"
        )}
        data-streak-cromo-tier={tier}
      >
        <div
          className="relative mx-auto aspect-5/6 w-full overflow-hidden rounded-t-full rounded-b-sm text-(--cromo-fg)"
          style={{
            ...CROMO_TIER_SHELL[tier],
            backgroundImage: [
              "radial-gradient(ellipse 80% 55% at 50% 12%, color-mix(in oklch, var(--cromo-top) calc(var(--cromo-glow) * 100%), transparent) 0%, transparent 72%)",
              "linear-gradient(180deg, var(--cromo-top) 0%, var(--cromo-bottom) 100%)",
            ].join(", "),
          }}
        >
          {showPhoto ? (
            // biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy
            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: photo load fallback to silhouette
            <img
              alt=""
              className={cn(
                "absolute inset-0 size-full object-cover object-[50%_18%]",
                "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
                photoRevealed
                  ? "opacity-100 motion-safe:scale-100"
                  : "opacity-0 motion-safe:scale-[1.06]"
              )}
              decoding="async"
              height={317}
              key={imageUrl}
              onError={() => {
                setPhotoFailed(true);
              }}
              onLoad={() => {
                setPhotoRevealed(true);
              }}
              ref={(node) => {
                if (node?.complete) {
                  setPhotoRevealed(true);
                }
              }}
              src={imageUrl}
              width={264}
            />
          ) : (
            <div className="flex size-full items-end justify-center pb-6">
              <CromoSilhouette />
            </div>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-t-full rounded-b-sm"
            style={{
              boxShadow:
                "inset 0 0 0 1px color-mix(in oklch, currentColor calc(var(--cromo-edge) * 100%), transparent)",
            }}
          />
        </div>

        {playerName || positionLine ? (
          <header className="space-y-0.5 px-0.5">
            {playerName ? (
              <p className="text-2xl font-bold leading-[1.05] tracking-[-0.02em]">
                {playerName}
              </p>
            ) : null}
            {positionLine ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                {positionLine}
              </p>
            ) : null}
          </header>
        ) : null}

        <footer className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div
              aria-hidden
              className="flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-text-primary"
            >
              <StreakFireIcon
                backColor={STREAK_FIRE_TONE.back}
                className="h-3.5 w-3.5"
                frontColor={STREAK_FIRE_TONE.front}
              />
              <span className="text-base font-bold leading-none tabular-nums">
                {streakCount}
              </span>
            </div>

            {clubCrestUrl ? (
              <div className="size-11 shrink-0 overflow-hidden rounded-full border border-border-secondary bg-bg-secondary p-1">
                {/* biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy */}
                <img
                  alt=""
                  className="size-full object-contain"
                  height={44}
                  src={clubCrestUrl}
                  width={44}
                />
              </div>
            ) : (
              <p className="max-w-24 text-right text-[0.6rem] font-bold uppercase leading-tight tracking-widest text-text-secondary">
                {CROMO_CLAIM}
              </p>
            )}
          </div>

          <div className="flex w-full min-w-0 items-stretch overflow-hidden rounded-sm border-2 border-text-primary text-[0.65rem] font-bold uppercase tracking-[0.08em]">
            <span className="shrink-0 px-1.5 py-1">
              {CROMO_TIER_LABEL[tier]}
            </span>
            <span
              aria-hidden
              className="w-3.5 shrink-0 border-x-2 border-text-primary bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,currentColor_2px,currentColor_3px)]"
            />
            <span className="min-w-0 flex-1 truncate px-1.5 py-1 text-right normal-case tracking-normal">
              {FOCUS_COPY.streakCalm(streakCount)}
            </span>
          </div>
        </footer>
      </article>
      {showRestart ? (
        <p className="text-sm text-text-secondary">
          {FOCUS_COPY.streakRestart}
        </p>
      ) : null}
    </div>
  );
}
