"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecommendedSetupPanelChrome } from "@/lib/recommended-setup";
import {
  parsePrimerosPasosChrome,
  primerosPasosChromeKey,
  writePrimerosPasosChrome,
} from "../lib/chrome-storage";

type UsePrimerosPasosChromeResult = {
  chrome: RecommendedSetupPanelChrome;
  setChrome: (next: RecommendedSetupPanelChrome) => void;
  hydrated: boolean;
};

/**
 * User×Club Primeros pasos chrome from localStorage.
 * Missing key ⇒ expanded. Server snapshot is always expanded until hydrate.
 */
export function usePrimerosPasosChrome(
  userId: string,
  clubId: string,
): UsePrimerosPasosChromeResult {
  const [chrome, setChromeState] =
    useState<RecommendedSetupPanelChrome>("expanded");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const key = primerosPasosChromeKey(userId, clubId);
    setChromeState(
      parsePrimerosPasosChrome(window.localStorage.getItem(key)),
    );
    setHydrated(true);
  }, [userId, clubId]);

  const setChrome = useCallback(
    (next: RecommendedSetupPanelChrome): void => {
      setChromeState(next);
      writePrimerosPasosChrome(userId, clubId, next);
    },
    [userId, clubId],
  );

  return { chrome, setChrome, hydrated };
}
