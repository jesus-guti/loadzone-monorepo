"use client";

import { CaretLeftIcon } from "@phosphor-icons/react/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/CaretRight";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, type JSX } from "react";

import {
  CROMO_RARITY_KEYS,
  CROMO_RARITY_META,
  parseCromoRarity,
  rarityCaption,
  type CromoRarity,
} from "./constants";

/** null = production cromo; then each rarity / tier replica. */
const RARITY_CYCLE = [null, ...CROMO_RARITY_KEYS] as const;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function rarityCycleStep(key: string): -1 | 1 | null {
  if (key === "ArrowLeft") {
    return -1;
  }
  if (key === "ArrowRight") {
    return 1;
  }
  return null;
}

export function CromoTcgSwitcher(): JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rarity = parseCromoRarity(searchParams.get("rarity"));

  const replaceRarity = useCallback(
    (next: CromoRarity | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("cromo");
      params.delete("tier");
      if (next) {
        params.set("rarity", next);
      } else {
        params.delete("rarity");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const cycleRarity = useCallback(
    (direction: -1 | 1) => {
      const index = RARITY_CYCLE.indexOf(rarity);
      const next =
        RARITY_CYCLE[
          (index + direction + RARITY_CYCLE.length) % RARITY_CYCLE.length
        ] ?? null;
      replaceRarity(next);
    },
    [rarity, replaceRarity]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (isTypingTarget(event.target)) {
        return;
      }
      const step = rarityCycleStep(event.key);
      if (step === null) {
        return;
      }
      event.preventDefault();
      cycleRarity(step);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleRarity]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const title = rarity ? rarityCaption(rarity) : "producción — losa";
  const thesis = rarity
    ? CROMO_RARITY_META[rarity].thesis
    : "Cromo actual. Derecha: una rareza por CromoTier.";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-text-primary px-2 py-1.5 text-bg-primary shadow-floating">
        <button
          aria-label="Rareza anterior"
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
          onClick={() => cycleRarity(-1)}
          type="button"
        >
          <CaretLeftIcon className="size-5" weight="bold" />
        </button>
        <div className="min-w-[13rem] text-center">
          <p className="text-sm font-bold tracking-wide">{title}</p>
          <p className="text-[10px] opacity-70">{thesis}</p>
        </div>
        <button
          aria-label="Rareza siguiente"
          className="flex size-11 items-center justify-center rounded-full hover:bg-bg-primary/15"
          onClick={() => cycleRarity(1)}
          type="button"
        >
          <CaretRightIcon className="size-5" weight="bold" />
        </button>
      </div>
    </div>
  );
}
