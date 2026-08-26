"use client";

import { UserIcon } from "@phosphor-icons/react/User";
import type { PlayingPosition } from "@repo/database/playing-position";
import { formatPlayingPositionCromoLine } from "@repo/database/playing-position";
import { cn } from "@repo/design-system/lib/utils";
import {
  type CSSProperties,
  type JSX,
  useEffect,
  useId,
  useState,
} from "react";

import { FOCUS_COPY } from "../lib/focus-copy";
import {
  CROMO_CLAIM,
  CROMO_SEAL_ARC_TOP,
  CROMO_SHIRT_OVERPRINT_ROTATION_DEG,
  CROMO_SHIRT_SEAL_ROTATION_DEG,
  cromoSealArcBottom,
  cromoShirtOverprintLabel,
  cromoTeamRankLabel,
  resolveCromoShirtNumber,
  resolveTeamStreakRank,
} from "../lib/streak-cromo";
import {
  CROMO_RARITY_TIER,
  labStreakForRarity,
  type CromoRarity,
} from "./constants";
import "./tcg-lab.css";
import { usePointerTilt } from "./use-pointer-tilt";

/**
 * One rarity foil replica per CromoTier on Bezel A (real Streak Cromo content).
 */

type TcgCromoProperties = {
  readonly rarity: CromoRarity;
  readonly streakCount: number;
  readonly restarted: boolean;
  readonly imageUrl?: string | null;
  readonly clubCrestUrl?: string | null;
  readonly playingPosition?: PlayingPosition | null;
  readonly playerName?: string | null;
  readonly teamName?: string | null;
  readonly shirtNumber?: number | null;
  readonly teammateStreaks?: readonly number[];
};

const SEAL_ARC_TOP = "M 10.5,50 A 39.5,39.5 0 1 1 89.5,50";
const SEAL_ARC_BOTTOM = "M 3.5,50 A 46.5,46.5 0 1 0 96.5,50";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function interactingLabel(interacting: boolean): string {
  if (interacting) {
    return "puntero activo";
  }
  return "bucle ambiente";
}

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
      className="relative size-9 shrink-0"
      style={{ transform: `rotate(${CROMO_SHIRT_SEAL_ROTATION_DEG}deg)` }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 z-[1] size-full"
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
      <span className="absolute inset-0 z-[1] flex items-center justify-center">
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
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <p className="sr-only">{cromoShirtOverprintLabel(shirtNumber)}</p>
      <div
        aria-hidden
        className="absolute -left-1 bottom-5"
        style={{
          transform: `rotate(${CROMO_SHIRT_OVERPRINT_ROTATION_DEG}deg)`,
        }}
      >
        <span
          className={cn(
            "lz-tcg-dorsal font-black leading-[0.72] tracking-[-0.07em] tabular-nums",
            twoDigits ? "text-[3.6rem]" : "text-[4.5rem]"
          )}
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

function CromoPortrait({
  imageUrl,
  dorsal,
}: {
  readonly imageUrl: string | null;
  readonly dorsal: number | null;
}): JSX.Element {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoRevealed, setPhotoRevealed] = useState(false);
  const showPhoto = imageUrl !== null && imageUrl !== "" && !photoFailed;

  return (
    <div className="lz-tcg-window w-full">
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent"
      />
      {dorsal === null ? null : <ShirtOverprint shirtNumber={dorsal} />}
    </div>
  );
}

function IdentityHeader({
  playerName,
  positionLine,
}: {
  readonly playerName: string | null;
  readonly positionLine: string | null;
}): JSX.Element | null {
  if (!(playerName || positionLine)) {
    return null;
  }

  return (
    <header className="relative z-1 space-y-0.5 px-0.5">
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
    <footer className="relative z-1 mt-auto flex flex-col gap-2">
      <div className="relative flex items-center justify-between gap-3">
        {rank === null ? null : (
          <div className="absolute top-3.5 left-1 flex items-end">
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
        <div className="lz-tcg-chip flex w-fit min-w-24 items-stretch overflow-hidden rounded-[4px] border border-current text-[0.45rem] font-bold uppercase tracking-[0.08em] opacity-80">
          <span className="relative z-[1] shrink-0 px-1.5 py-1">LOADZONE</span>
          <span
            aria-hidden
            className="relative z-[1] w-3.5 shrink-0 border-x border-current bg-[repeating-linear-gradient(-45deg,transparent,transparent_1px,currentColor_1px,currentColor_2px)]"
          />
          <span className="relative z-[1] min-w-0 flex-1 truncate px-1.5 py-1 text-right normal-case tracking-normal">
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

export function TcgPrototypeCromo({
  rarity,
  streakCount,
  restarted,
  imageUrl = null,
  clubCrestUrl = null,
  playingPosition = null,
  playerName = null,
  teamName = null,
  shirtNumber = null,
  teammateStreaks = [],
}: TcgCromoProperties): JSX.Element {
  const reducedMotion = useReducedMotion();
  const tilt = usePointerTilt(reducedMotion);
  const tier = CROMO_RARITY_TIER[rarity];
  const cromoStreak = labStreakForRarity(rarity);
  const showRestart = restarted || streakCount === 0;
  const positionLine = formatPlayingPositionCromoLine(playingPosition);
  const teamRank = resolveTeamStreakRank({
    playerStreak: cromoStreak,
    teamStreaks: [...teammateStreaks, cromoStreak],
  });
  const dorsal = resolveCromoShirtNumber(shirtNumber);
  const trimmedTeamName = teamName?.trim() ?? "";
  const motionLabel = reducedMotion
    ? "reduced-motion estático"
    : interactingLabel(tilt.interacting);

  const rootStyle = { ...tilt.style } as CSSProperties;

  return (
    <div className="lz-tcg-lab mb-3 mt-auto flex w-full flex-col items-center gap-3">
      <div className="lz-tcg-stage" style={rootStyle}>
        <div
          className="lz-tcg-rotator"
          onPointerEnter={tilt.onPointerEnter}
          onPointerLeave={tilt.onPointerLeave}
          onPointerMove={tilt.onPointerMove}
        >
          <article
            className="lz-tcg-frame"
            data-rarity={rarity}
            data-streak-cromo-tier={tier}
          >
            <div className="lz-tcg-mat">
              <span aria-hidden className="lz-tcg-shine" />
              <CromoPortrait dorsal={dorsal} imageUrl={imageUrl} />
              <IdentityHeader
                playerName={playerName}
                positionLine={positionLine}
              />
              <CromoCardFooter
                clubCrestUrl={clubCrestUrl}
                rank={teamRank.position}
                streakCount={cromoStreak}
                teamSize={teamRank.teamSize}
                trimmedTeamName={trimmedTeamName}
              />
            </div>
            <span aria-hidden className="lz-tcg-glare" />
          </article>
        </div>
      </div>
      <p className="font-mono text-[10px] text-text-tertiary">
        {motionLabel}
        {" · "}
        rarity={rarity} · Bezel A · tier={tier} (lab)
      </p>
      {showRestart ? (
        <p className="text-sm text-text-secondary">{FOCUS_COPY.streakRestart}</p>
      ) : null}
    </div>
  );
}
