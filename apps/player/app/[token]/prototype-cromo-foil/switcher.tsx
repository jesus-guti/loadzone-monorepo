"use client";

import { CaretLeftIcon } from "@phosphor-icons/react/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/CaretRight";
import { cn } from "@repo/design-system/lib/utils";
import type { CromoTier } from "../lib/streak-cromo";
import {
  VARIANT_KEYS,
  VARIANT_META,
  type PrototypeVariant,
  labTierCaption,
} from "./constants";
import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SwitcherProperties = {
  readonly variant: PrototypeVariant;
  readonly tier: CromoTier;
};

export function FoilPrototypeSwitcher({
  variant,
  tier,
}: SwitcherProperties) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const replaceParams = useCallback(
    (next: { variant?: PrototypeVariant; tier?: CromoTier }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextVariant = next.variant ?? variant;
      params.set("variant", nextVariant);
      const nextTier =
        next.tier ??
        (next.variant ? VARIANT_META[next.variant].defaultTier : tier);
      params.set("tier", String(nextTier));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, tier, variant]
  );

  const cycleVariant = useCallback(
    (direction: -1 | 1) => {
      const index = VARIANT_KEYS.indexOf(variant);
      const next =
        VARIANT_KEYS[(index + direction + VARIANT_KEYS.length) % VARIANT_KEYS.length];
      if (next) {
        replaceParams({ variant: next });
      }
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
        {VARIANT_META[variant].tiers.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => replaceParams({ tier: key })}
            className={cn(
              "min-h-10 rounded-full px-3 text-xs font-semibold transition",
              tier === key
                ? "bg-brand text-brand-foreground"
                : "bg-bg-tertiary/95 text-text-secondary backdrop-blur"
            )}
          >
            {labTierCaption(key)}
          </button>
        ))}
      </div>
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-text-primary px-2 py-1.5 text-bg-primary shadow-floating">
        <button
          type="button"
          aria-label="Variante anterior"
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
          onClick={() => cycleVariant(-1)}
        >
          <CaretLeftIcon className="size-5" weight="bold" />
        </button>
        <div className="min-w-[11rem] text-center">
          <p className="text-sm font-bold tracking-wide">
            {variant} — {VARIANT_META[variant].name}
          </p>
          <p className="text-[10px] opacity-70">{VARIANT_META[variant].thesis}</p>
        </div>
        <button
          type="button"
          aria-label="Variante siguiente"
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
          onClick={() => cycleVariant(1)}
        >
          <CaretRightIcon className="size-5" weight="bold" />
        </button>
      </div>
    </div>
  );
}
