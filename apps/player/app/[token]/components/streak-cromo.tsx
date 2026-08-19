"use client";

import { useEffect, useState, type JSX } from "react";
import { UserIcon } from "@phosphor-icons/react/User";

import { cn } from "@repo/design-system/lib/utils";
import { formatPlayingPositionCromoLine } from "@repo/database/playing-position";
import type { PlayingPosition } from "@repo/database/playing-position";

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
};

function CromoSilhouette(): JSX.Element {
  return (
    <div className="mb-2 flex flex-col items-center gap-1 opacity-70">
      <div className="flex size-16 items-center justify-center rounded-full bg-bg-primary/45">
        <UserIcon className="size-9" weight="regular" />
      </div>
      <div className="h-8 w-14 rounded-t-[1.5rem] bg-bg-primary/45" />
    </div>
  );
}

export function StreakCromo({
  streakCount,
  restarted,
  imageUrl = null,
  clubCrestUrl = null,
  playingPosition = null,
}: StreakCromoProperties): JSX.Element {
  const tier = streakCountToCromoTier(streakCount);
  const showRestart = restarted || streakCount === 0;
  const positionLine = formatPlayingPositionCromoLine(playingPosition);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [imageUrl]);

  const showPhoto = Boolean(imageUrl) && !photoFailed;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <article
        data-streak-cromo-tier={tier}
        className={cn(
          "relative flex h-80 w-60 flex-col items-center justify-between overflow-hidden rounded-[1.75rem] p-5",
          "border border-white/30 motion-safe:transition-[box-shadow,filter] motion-safe:duration-300",
          "text-[color:var(--cromo-fg)]"
        )}
        style={{
          ...CROMO_TIER_SHELL[tier],
          backgroundImage: [
            "radial-gradient(ellipse 80% 55% at 50% 12%, color-mix(in oklch, var(--cromo-top) calc(var(--cromo-glow) * 100%), transparent) 0%, transparent 72%)",
            "linear-gradient(180deg, var(--cromo-top) 0%, var(--cromo-bottom) 100%)",
          ].join(", "),
          boxShadow: [
            "inset 0 1.5px 1px 0 oklch(1 0 0 / 0.7)",
            "inset 0 -4px 8px 0 color-mix(in oklch, var(--cromo-bottom) calc(var(--cromo-inset) * 100%), transparent)",
            "0 16px 32px -8px color-mix(in oklch, var(--cromo-bottom) calc(var(--cromo-edge) * 100%), transparent)",
          ].join(", "),
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,oklch(1_0_0/0.12)_50%,transparent_55%)] motion-reduce:hidden"
        />

        {clubCrestUrl ? (
          <div className="absolute right-4 top-4 z-20 size-10 overflow-hidden rounded-full bg-bg-primary/85 p-1">
            {/* biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy */}
            <img
              src={clubCrestUrl}
              alt=""
              className="size-full object-contain"
            />
          </div>
        ) : null}

        <header className="relative z-10 space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
            {CROMO_TIER_LABEL[tier]}
          </p>
          <p className="text-lg font-semibold">{FOCUS_COPY.streakCalm(streakCount)}</p>
          {positionLine ? (
            <p className="text-xs font-medium opacity-80">{positionLine}</p>
          ) : null}
        </header>

        <div
          aria-hidden
          className="relative z-10 mb-2 flex h-28 w-24 items-end justify-center overflow-hidden rounded-[1.25rem] bg-bg-primary/20"
        >
          {showPhoto && imageUrl ? (
            // biome-ignore lint/performance/noImgElement: cookie-authed private blob proxy
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
              onError={() => {
                setPhotoFailed(true);
              }}
            />
          ) : (
            <CromoSilhouette />
          )}
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
