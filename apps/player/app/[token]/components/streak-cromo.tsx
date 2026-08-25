"use client";

import { UserIcon } from "@phosphor-icons/react/User";
import type { PlayingPosition } from "@repo/database/playing-position";
import { formatPlayingPositionCromoLine } from "@repo/database/playing-position";
import { cn } from "@repo/design-system/lib/utils";
import { type JSX, type ReactNode, useId, useState } from "react";

import { FOCUS_COPY } from "../lib/focus-copy";
import {
  CROMO_CLAIM,
  CROMO_FOIL_INTENSITY,
  CROMO_SEAL_ARC_TOP,
  CROMO_SHIRT_OVERPRINT_ROTATION_DEG,
  CROMO_SHIRT_SEAL_ROTATION_DEG,
  CROMO_TIER_LABEL,
  type CromoFoilKind,
  type CromoTier,
  cromoFoilKind,
  cromoSealArcBottom,
  cromoShirtOverprintLabel,
  cromoTeamRankLabel,
  resolveCromoShirtNumber,
  resolveTeamStreakRank,
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
  /** Team display name; omitted when empty. */
  readonly teamName?: string | null;
  /** Player.shirtNumber; portrait overprint omitted when null. */
  readonly shirtNumber?: number | null;
  /** Other non-archived teammates’ display streaks (this Player excluded). */
  readonly teammateStreaks?: readonly number[];
};

const SEAL_ARC_TOP = "M 10.5,50 A 39.5,39.5 0 1 1 89.5,50";
const SEAL_ARC_BOTTOM = "M 3.5,50 A 46.5,46.5 0 1 0 96.5,50";

function ShirtInkSeal({
  rank,
  teamSize,
}: {
  readonly rank: number;
  readonly teamSize: number;
}): JSX.Element {
  const arcId = useId();

  return (
    <div
      className="relative size-9 shrink-0 motion-safe:transition-transform motion-safe:duration-300"
      style={{ transform: `rotate(${CROMO_SHIRT_SEAL_ROTATION_DEG}deg)` }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 100 100"
      >
        <defs>
          <path d={SEAL_ARC_TOP} id={`${arcId}-top`} />
          <path d={SEAL_ARC_BOTTOM} id={`${arcId}-bottom`} />
        </defs>

        <circle cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r="37" vectorEffect="non-scaling-stroke" />

        <g
          fill="currentColor"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.35"
          stroke="none"
          textAnchor="middle"
        >
          <text>
            <textPath href={`#${arcId}-top`} startOffset="50%">
              {CROMO_SEAL_ARC_TOP}
            </textPath>
          </text>
          <text>
            <textPath href={`#${arcId}-bottom`} startOffset="50%">
              {cromoSealArcBottom(teamSize)}
            </textPath>
          </text>
        </g>
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-start leading-none">
          <span className="mt-px text-[0.4rem] font-black">#</span>
          <span className="text-[1rem] font-black leading-[0.8] tracking-[-0.04em] tabular-nums">
            {rank}
          </span>
        </span>
      </span>
    </div>
  );
}

function ShirtOverprint({
  shirtNumber,
}: {
  readonly shirtNumber: number;
}): JSX.Element {
  const twoDigits = shirtNumber >= 10;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-t-full rounded-b-sm">
      <p className="sr-only">{cromoShirtOverprintLabel(shirtNumber)}</p>
      <div
        aria-hidden
        className="absolute -left-1 bottom-5 motion-safe:transition-transform motion-safe:duration-300"
        style={{
          transform: `rotate(${CROMO_SHIRT_OVERPRINT_ROTATION_DEG}deg)`,
        }}
      >
        <span
          className={cn(
            "font-black leading-[0.72] tracking-[-0.07em] tabular-nums text-white/25",
            twoDigits ? "text-[3.6rem]" : "text-[4.5rem]"
          )}
          style={{
            WebkitTextStroke: "1.5px oklch(1 0 0 / 0.85)",
          }}
        >
          {shirtNumber}
        </span>
      </div>
    </div>
  );
}

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

function CromoHoloShine({
  intensity,
}: {
  readonly intensity: number;
}): JSX.Element {
  return (
    <span
      aria-hidden
      className="cromo-foil-holo pointer-events-none absolute inset-0 z-20"
      style={{ opacity: 0.28 + 0.52 * intensity }}
    >
      <span className="cromo-foil-holo-mask">
        <span className="cromo-foil-holo-layer cromo-foil-holo-rainbow" />
        <span className="cromo-foil-holo-layer cromo-foil-holo-sparkle" />
      </span>
      <span className="cromo-foil-holo-glare" />
    </span>
  );
}

function CromoPlateShine({
  intensity,
}: {
  readonly intensity: number;
}): JSX.Element {
  return (
    <span
      aria-hidden
      className="cromo-foil-brushed pointer-events-none absolute inset-0 z-20"
      style={{ opacity: 0.35 + 0.5 * intensity }}
    />
  );
}

function CromoFoilShell({
  tier,
  foilKind,
  foilIntensity,
  children,
}: {
  readonly tier: CromoTier;
  readonly foilKind: CromoFoilKind;
  readonly foilIntensity: number;
  readonly children: ReactNode;
}): JSX.Element {
  const plateShadow =
    foilKind === "plate"
      ? `inset 0 1px 0 oklch(1 0 0 / ${0.1 + 0.45 * foilIntensity}), inset 0 -1px 0 oklch(0 0 0 / ${0.15 + 0.3 * foilIntensity})`
      : "none";

  return (
    <div
      className="cromo-foil-frame"
      data-cromo-foil={foilKind}
      data-streak-cromo-tier={tier}
      style={{
        ["--cromo-foil-intensity" as string]: String(foilIntensity),
      }}
    >
      {foilKind === "holo" ? (
        <CromoHoloShine intensity={foilIntensity} />
      ) : null}

      <article
        className={cn(
          "cromo-shell relative z-10 flex w-full flex-col gap-4 overflow-hidden p-4",
          "motion-safe:transition-[background-color,color] motion-safe:duration-300"
        )}
        style={{ boxShadow: plateShadow }}
      >
        {foilKind === "plate" ? (
          <CromoPlateShine intensity={foilIntensity} />
        ) : null}
        {children}
      </article>
    </div>
  );
}

function cromoFooterSignals({
  streakCount,
  shirtNumber,
  teammateStreaks,
  teamName,
}: {
  readonly streakCount: number;
  readonly shirtNumber: number | null;
  readonly teammateStreaks: readonly number[];
  readonly teamName: string | null;
}): {
  readonly dorsal: number | null;
  readonly rank: number | null;
  readonly teamSize: number;
  readonly trimmedTeamName: string;
} {
  const teamRank = resolveTeamStreakRank({
    playerStreak: streakCount,
    teamStreaks: [...teammateStreaks, streakCount],
  });

  return {
    dorsal: resolveCromoShirtNumber(shirtNumber),
    rank: teamRank.position,
    teamSize: teamRank.teamSize,
    trimmedTeamName: teamName?.trim() ?? "",
  };
}

function CromoPortrait({
  imageUrl,
  dorsal,
  tier,
}: {
  readonly imageUrl: string | null;
  readonly dorsal: number | null;
  readonly tier: CromoTier;
}): JSX.Element {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoRevealed, setPhotoRevealed] = useState(false);
  const showPhoto = imageUrl !== null && imageUrl !== "" && !photoFailed;

  return (
    <div className="mt-2 relative mx-auto aspect-5/5 w-full overflow-hidden rounded-t-full rounded-b-sm">
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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent"
      />
      {dorsal === null ? null : <ShirtOverprint shirtNumber={dorsal} />}
      <p
        className={cn(
          "cromo-tier-label pointer-events-none absolute right-2.5 bottom-2 z-10 max-w-[85%] text-right italic leading-[0.95] text-white",
          tier <= 3 ? "text-[1.35rem]" : "text-[1.5rem] font-semibold"
        )}
        style={{
          textShadow:
            "0 1px 1px oklch(0 0 0 / 0.45), 0 8px 18px oklch(0 0 0 / 0.4)",
        }}
      >
        {CROMO_TIER_LABEL[tier]}
      </p>
    </div>
  );
}

function CromoCardFooter({
  rank,
  teamSize,
  clubCrestUrl,
  streakCount,
  trimmedTeamName,
}: {
  readonly rank: number | null;
  readonly teamSize: number;
  readonly clubCrestUrl: string | null;
  readonly streakCount: number;
  readonly trimmedTeamName: string;
}): JSX.Element {
  return (
    <footer className="mt-auto flex flex-col gap-2">
      <div className="relative flex items-center justify-between gap-3">
        {rank === null ? null : (
          <div className="flex items-end absolute top-3.5 left-1">
            <p className="sr-only">{cromoTeamRankLabel(rank, teamSize)}</p>
            <span aria-hidden>
              <ShirtInkSeal rank={rank} teamSize={teamSize} />
            </span>
          </div>
        )}

        {clubCrestUrl ? (
          <div className="ml-auto size-11 shrink-0 overflow-hidden rounded-full border border-border-secondary bg-bg-secondary p-1">
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
          <p className="ml-auto max-w-24 text-right text-[0.6rem] font-bold uppercase leading-tight tracking-widest opacity-70">
            {CROMO_CLAIM}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex w-fit min-w-24 items-stretch overflow-hidden rounded-[4px] opacity-80 border border-current text-[0.45rem] font-bold uppercase tracking-[0.08em]">
          <span className="shrink-0 px-1.5 py-1">LOADZONE</span>
          <span
            aria-hidden
            className="w-3.5 shrink-0 border-x border-current bg-[repeating-linear-gradient(-45deg,transparent,transparent_1px,currentColor_1px,currentColor_2px)]"
          />
          <span className="min-w-0 flex-1 truncate px-1.5 py-1 text-right normal-case tracking-normal">
            {FOCUS_COPY.streakCalm(streakCount)}
          </span>
        </div>
        {trimmedTeamName ? (
          <p className="cromo-team-name">{trimmedTeamName}</p>
        ) : null}
      </div>
    </footer>
  );
}

export function StreakCromo({
  streakCount,
  restarted,
  imageUrl = null,
  clubCrestUrl = null,
  playingPosition = null,
  playerName = null,
  teamName = null,
  shirtNumber = null,
  teammateStreaks = [],
}: StreakCromoProperties): JSX.Element {
  const tier = streakCountToCromoTier(streakCount);
  const showRestart = restarted || streakCount === 0;
  const positionLine = formatPlayingPositionCromoLine(playingPosition);
  const { dorsal, rank, teamSize, trimmedTeamName } = cromoFooterSignals({
    streakCount,
    shirtNumber,
    teammateStreaks,
    teamName,
  });
  const foilKind = cromoFoilKind(tier);
  const foilIntensity = CROMO_FOIL_INTENSITY[tier];

  return (
    <div className="flex w-full flex-col items-center gap-3 mt-auto mb-3">
      <CromoFoilShell
        foilIntensity={foilIntensity}
        foilKind={foilKind}
        tier={tier}
      >
        <CromoPortrait dorsal={dorsal} imageUrl={imageUrl} tier={tier} />

        {playerName || positionLine ? (
          <header className="space-y-0.5 px-0.5">
            {playerName ? (
              <p className="text-2xl font-bold leading-[1.05] tracking-[-0.02em]">
                {playerName}
              </p>
            ) : null}
            {positionLine ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                {positionLine}
              </p>
            ) : null}
          </header>
        ) : null}

        <CromoCardFooter
          clubCrestUrl={clubCrestUrl}
          rank={rank}
          streakCount={streakCount}
          teamSize={teamSize}
          trimmedTeamName={trimmedTeamName}
        />
      </CromoFoilShell>
      {showRestart ? (
        <p className="text-sm text-text-secondary">
          {FOCUS_COPY.streakRestart}
        </p>
      ) : null}
    </div>
  );
}
