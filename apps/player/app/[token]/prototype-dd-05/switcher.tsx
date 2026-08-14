"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretLeftIcon } from "@phosphor-icons/react/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/CaretRight";
import { cn } from "@repo/design-system/lib/utils";
import {
  BAND_KEYS,
  BAND_META,
  LAB_CROMO_STREAKS,
  VARIANT_KEYS,
  VARIANT_META,
  type AgeBand,
  type PrototypeVariant,
} from "./constants";

type PrototypeSwitcherProperties = {
  readonly variant: PrototypeVariant;
  readonly band: AgeBand;
  readonly streakCount: number;
  readonly simulateMiss: boolean;
  readonly onToggleMiss: () => void;
};

export function PrototypeSwitcher({
  variant,
  band,
  streakCount,
  simulateMiss,
  onToggleMiss,
}: PrototypeSwitcherProperties) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const replaceParams = useCallback(
    (next: {
      variant?: PrototypeVariant;
      band?: AgeBand;
      streak?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.variant) params.set("variant", next.variant);
      if (next.band) params.set("band", next.band);
      if (next.streak !== undefined) params.set("streak", String(next.streak));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const cycleVariant = useCallback(
    (direction: -1 | 1) => {
      const index = VARIANT_KEYS.indexOf(variant);
      const next =
        VARIANT_KEYS[(index + direction + VARIANT_KEYS.length) % VARIANT_KEYS.length];
      if (next) replaceParams({ variant: next });
    },
    [replaceParams, variant]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycleVariant(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycleVariant(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleVariant]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
        {BAND_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => replaceParams({ band: key })}
            className={cn(
              "min-h-10 rounded-full px-3 text-xs font-semibold transition",
              band === key
                ? "bg-text-primary text-bg-primary"
                : "bg-bg-tertiary/95 text-text-secondary backdrop-blur"
            )}
          >
            {BAND_META[key].label}
          </button>
        ))}
        <button
          type="button"
          onClick={onToggleMiss}
          className={cn(
            "min-h-10 rounded-full px-3 text-xs font-semibold transition",
            simulateMiss
              ? "bg-premium text-premium-foreground"
              : "bg-bg-tertiary/95 text-text-secondary backdrop-blur"
          )}
        >
          {simulateMiss ? "Día perdido ON" : "Simular día perdido"}
        </button>
        {variant === "C"
          ? LAB_CROMO_STREAKS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => replaceParams({ streak: days })}
                className={cn(
                  "min-h-10 rounded-full px-3 text-xs font-semibold transition",
                  streakCount === days && !simulateMiss
                    ? "bg-brand text-brand-foreground"
                    : "bg-bg-tertiary/95 text-text-secondary backdrop-blur"
                )}
              >
                {days}d
              </button>
            ))
          : null}
      </div>

      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-text-primary px-2 py-1.5 text-bg-primary shadow-floating">
        <button
          type="button"
          aria-label="Variante anterior"
          onClick={() => cycleVariant(-1)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
        >
          <CaretLeftIcon weight="bold" className="size-5" />
        </button>
        <div className="min-w-[10.5rem] text-center">
          <p className="text-sm font-bold tracking-wide">
            {variant} — {VARIANT_META[variant].name}
          </p>
          <p className="text-[10px] opacity-70">{VARIANT_META[variant].thesis}</p>
        </div>
        <button
          type="button"
          aria-label="Variante siguiente"
          onClick={() => cycleVariant(1)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
        >
          <CaretRightIcon weight="bold" className="size-5" />
        </button>
      </div>
    </div>
  );
}
