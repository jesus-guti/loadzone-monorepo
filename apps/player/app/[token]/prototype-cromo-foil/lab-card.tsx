"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties, JSX } from "react";
import { FOCUS_COPY } from "../lib/focus-copy";
import {
  CROMO_CLAIM,
  CROMO_TIER_SHELL,
  type CromoTier,
} from "../lib/streak-cromo";
import {
  DEMO_PLAYER_NAME,
  DEMO_POSITION,
  DEMO_TEAM_NAME,
  VARIANT_META,
  type PrototypeVariant,
  labStreakForTier,
} from "./constants";
import { usePointerTilt } from "./use-pointer-tilt";

type LabCardProperties = {
  readonly variant: PrototypeVariant;
  readonly tier: CromoTier;
  readonly reducedMotion: boolean;
};

export function LabFoilCard({
  variant,
  tier,
  reducedMotion,
}: LabCardProperties): JSX.Element {
  const recipe = VARIANT_META[variant].recipe;
  const tilt = usePointerTilt(reducedMotion);
  const streak = labStreakForTier(tier);
  const shell = CROMO_TIER_SHELL[tier];
  const brush = tier === 1 ? "18deg" : "96deg";

  const rootStyle = {
    ...tilt.style,
    ...shell,
    ["--lz-tier-top" as string]: shell["--cromo-top"],
    ["--lz-tier-bottom" as string]: shell["--cromo-bottom"],
    ["--lz-tier-fg" as string]: shell["--cromo-fg"],
    ["--lz-brush" as string]: brush,
  } as CSSProperties;

  return (
    <div
      className="lz-foil-lab lz-foil-stage"
      data-recipe={recipe}
      data-streak-cromo-tier={tier}
      style={rootStyle}
    >
      <div
        className="lz-foil-rotator"
        onPointerEnter={tilt.onPointerEnter}
        onPointerLeave={tilt.onPointerLeave}
        onPointerMove={tilt.onPointerMove}
      >
        <article className="lz-foil-card">
          <div className="lz-foil-chrome">
            <span className="lz-foil-glare" />
            <div className="lz-foil-window">
              <div aria-hidden className="lz-foil-portrait">
                <span className="lz-foil-portrait-kit" />
                <span className="lz-foil-portrait-face" />
              </div>
              <p className="sr-only">Retrato mate de prototipo</p>
              <span aria-hidden className="lz-foil-dorsal">
                10
              </span>
            </div>

            <div className="lz-foil-ink">
              <p className="lz-foil-name">{DEMO_PLAYER_NAME}</p>
              <p className="lz-foil-meta">{DEMO_POSITION}</p>
            </div>

            <footer className="lz-foil-footer">
              <div className="lz-foil-seal" title="Sello de puesto">
                <span className="lz-foil-seal-n">1</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
                <div className="lz-foil-pill">
                  <span>LOADZONE</span>
                  <span className="lz-foil-pill-mid" />
                  <span className="normal-case tracking-normal">
                    {FOCUS_COPY.streakCalm(streak)}
                  </span>
                </div>
                <p className="lz-foil-team">{DEMO_TEAM_NAME}</p>
              </div>
            </footer>
          </div>
        </article>
      </div>
      <p className="mt-3 text-center text-[11px] text-text-secondary">
        {tilt.interacting ? "Puntero activo" : "Bucle ambiente"}
        {" · "}
        {CROMO_CLAIM}
      </p>
      <p
        className={cn(
          "mt-1 text-center font-mono text-[10px] text-text-tertiary"
        )}
      >
        recipe={recipe} tier={tier} reducedMotion={String(reducedMotion)}
      </p>
    </div>
  );
}
