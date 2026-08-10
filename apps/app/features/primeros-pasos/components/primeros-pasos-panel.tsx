"use client";

import {
  CheckCircleIcon,
  CircleIcon,
  MinusIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";
import {
  resolveRecommendedSetup,
  type RecommendedSetupActiveTeam,
  type RecommendedSetupClubFacts,
} from "@/lib/recommended-setup";
import { usePrimerosPasosChrome } from "../hooks/use-primeros-pasos-chrome";
import { getPrimerosPasosStepConfig } from "../lib/step-config";
import { PrimerosPasosBadge } from "./primeros-pasos-badge";

type PrimerosPasosPanelProperties = {
  readonly userId: string;
  readonly clubId: string;
  readonly clubFacts: RecommendedSetupClubFacts;
  readonly activeTeam: RecommendedSetupActiveTeam;
};

/**
 * Operational sidebar footer Primeros pasos checklist / badge.
 * Visibility comes from resolveRecommendedSetup; chrome from localStorage.
 * Transition-only auto-hide: write dismissed once when completedCount flips to 5
 * while chrome is expanded — not while staying expanded/minimized at 5/5.
 */
export function PrimerosPasosPanel({
  userId,
  clubId,
  clubFacts,
  activeTeam,
}: PrimerosPasosPanelProperties): ReactElement | null {
  const { chrome, setChrome, hydrated } = usePrimerosPasosChrome(userId, clubId);
  const previousCompletedCountRef = useRef<number | null>(null);

  const result = resolveRecommendedSetup({
    clubFacts,
    panelChrome: chrome,
    activeTeam,
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const previous = previousCompletedCountRef.current;
    previousCompletedCountRef.current = result.completedCount;

    if (previous === null) {
      return;
    }

    if (
      previous < result.totalCount &&
      result.completedCount === result.totalCount &&
      chrome === "expanded"
    ) {
      setChrome("dismissed");
    }
  }, [
    chrome,
    hydrated,
    result.completedCount,
    result.totalCount,
    setChrome,
  ]);

  if (!hydrated || result.panelVisibility === "hidden") {
    return null;
  }

  if (result.panelVisibility === "minimized") {
    return (
      <PrimerosPasosBadge
        completedCount={result.completedCount}
        onExpand={() => {
          setChrome("expanded");
        }}
        totalCount={result.totalCount}
      />
    );
  }

  return (
    <div className="rounded-sm border border-border-secondary bg-bg-primary p-2.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">
            Primeros pasos
          </p>
          <p className="tabular-nums text-[11px] text-text-secondary">
            {result.completedCount}/{result.totalCount}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            aria-label="Minimizar Primeros pasos"
            className="size-7"
            onClick={() => {
              setChrome("minimized");
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <MinusIcon className="size-3.5" weight="fill" />
          </Button>
          <Button
            aria-label="Descartar Primeros pasos"
            className="size-7"
            onClick={() => {
              setChrome("dismissed");
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <XIcon className="size-3.5" weight="fill" />
          </Button>
        </div>
      </div>

      <ul className="flex flex-col gap-0.5">
        {result.steps.map((step) => {
          const config = getPrimerosPasosStepConfig(step.id);
          const rowClassName = cn(
            "flex items-center gap-2 rounded-sm px-1.5 py-1.5 text-xs",
            step.done
              ? "text-text-secondary"
              : "text-text-primary hover:bg-bg-secondary",
          );

          if (step.done) {
            return (
              <li className={rowClassName} key={step.id}>
                <CheckCircleIcon
                  aria-hidden
                  className="size-3.5 shrink-0 text-brand"
                  weight="fill"
                />
                <span className="min-w-0 truncate line-through decoration-border-secondary">
                  {config.label}
                </span>
              </li>
            );
          }

          return (
            <li key={step.id}>
              <Link className={rowClassName} href={config.href} prefetch>
                <CircleIcon
                  aria-hidden
                  className="size-3.5 shrink-0 text-text-tertiary"
                  weight="regular"
                />
                <span className="min-w-0 truncate">{config.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
