"use client";

import type { JSX } from "react";

import { cn } from "@repo/design-system/lib/utils";
import { BAND_META, type AgeBand } from "./constants";
import { COPY } from "./copy";

export function PrototypeMark(): JSX.Element {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-premium">
      {COPY.prototypeBadge}
    </p>
  );
}

export function BandCaption({ band }: { readonly band: AgeBand }): JSX.Element {
  const meta = BAND_META[band];
  return (
    <p className="text-xs text-text-tertiary">
      {meta.label}
      {meta.caption ? ` · ${meta.caption}` : null}
    </p>
  );
}

export function CalmStreakChip({
  days,
  simulateMiss,
}: {
  readonly days: number;
  readonly simulateMiss: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(
        "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium",
        simulateMiss
          ? "bg-bg-tertiary text-text-secondary"
          : "bg-premium/15 text-premium-foreground"
      )}
    >
      {simulateMiss ? COPY.streakMissCalm : COPY.streakCalm(days)}
    </div>
  );
}

export function FootballTeaser({
  prominent = false,
}: {
  readonly prominent?: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-bg-tertiary p-5",
        prominent && "p-6"
      )}
    >
      <div
        aria-hidden
        className="mx-auto mb-4 flex h-36 w-28 items-end justify-center rounded-[1.25rem] bg-gradient-to-b from-brand/25 to-bg-quaternary"
      >
        <div className="mb-3 h-16 w-16 rounded-full bg-bg-primary/50" />
      </div>
      <p className="text-center text-sm font-semibold text-text-primary">
        {COPY.footballTeaserTitle}
      </p>
      <p className="mt-1 text-center text-xs text-text-secondary">
        {COPY.footballAttribute}
      </p>
      {COPY.footballTeaserHint ? (
        <p className="mt-3 text-center text-[11px] leading-snug text-text-tertiary">
          {COPY.footballTeaserHint}
        </p>
      ) : null}
    </div>
  );
}

export function AnswerGrid({
  options,
  onSelect,
  large = false,
}: {
  readonly options: readonly {
    readonly value: number;
    readonly label: string;
    readonly emoji?: string;
  }[];
  readonly onSelect: (value: number) => void;
  readonly large?: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(
        "grid gap-2",
        large ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-1"
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onSelect(option.value);
            if (navigator.vibrate) navigator.vibrate(8);
          }}
          className={cn(
            "flex min-h-12 w-full items-center gap-3 rounded-2xl bg-bg-primary px-4 text-left text-base font-semibold text-text-primary transition active:scale-[0.98]",
            "hover:bg-bg-tertiary",
            large && "min-h-14 text-lg"
          )}
        >
          {option.emoji ? (
            <span className="text-xl" aria-hidden>
              {option.emoji}
            </span>
          ) : null}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ProgressDots({
  total,
  current,
}: {
  readonly total: number;
  readonly current: number;
}): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full transition",
            index < current
              ? "bg-brand"
              : index === current
                ? "scale-125 bg-text-primary"
                : "bg-bg-quaternary"
          )}
        />
      ))}
    </div>
  );
}
