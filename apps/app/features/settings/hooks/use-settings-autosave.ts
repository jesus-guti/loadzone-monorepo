"use client";

import { toast } from "@repo/design-system/components/sonner";
import { useCallback, useEffect, useRef } from "react";

export type SettingsFieldResult = {
  success: boolean;
  error?: string;
};

const TEXT_DEBOUNCE_MS = 300;

type UseSettingsAutosaveOptions = {
  readonly teamId: string;
  readonly routeKey: string;
};

/**
 * Field-level autosave helper: generation counter ignores stale completions
 * when team or route context changes (JES-58).
 */
export function useSettingsAutosave({
  teamId,
  routeKey,
}: UseSettingsAutosaveOptions) {
  const generationRef = useRef(0);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    generationRef.current += 1;
    for (const timer of debounceTimers.current.values()) {
      clearTimeout(timer);
    }
    debounceTimers.current.clear();
  }, [teamId, routeKey]);

  useEffect(() => {
    return () => {
      for (const timer of debounceTimers.current.values()) {
        clearTimeout(timer);
      }
      debounceTimers.current.clear();
    };
  }, []);

  const runSave = useCallback(
    async (
      save: () => Promise<SettingsFieldResult>,
      generation: number
    ): Promise<void> => {
      const result = await save();
      if (generation !== generationRef.current) {
        return;
      }
      if (!result.success) {
        toast.error(result.error ?? "No se pudo guardar el cambio.");
      }
    },
    []
  );

  const saveImmediate = useCallback(
    (save: () => Promise<SettingsFieldResult>): void => {
      const generation = generationRef.current;
      void runSave(save, generation);
    },
    [runSave]
  );

  const saveDebounced = useCallback(
    (fieldKey: string, save: () => Promise<SettingsFieldResult>): void => {
      const existing = debounceTimers.current.get(fieldKey);
      if (existing) {
        clearTimeout(existing);
      }
      const generation = generationRef.current;
      const timer = setTimeout(() => {
        debounceTimers.current.delete(fieldKey);
        void runSave(save, generation);
      }, TEXT_DEBOUNCE_MS);
      debounceTimers.current.set(fieldKey, timer);
    },
    [runSave]
  );

  const flushDebounced = useCallback(
    (fieldKey: string, save: () => Promise<SettingsFieldResult>): void => {
      const existing = debounceTimers.current.get(fieldKey);
      if (existing) {
        clearTimeout(existing);
        debounceTimers.current.delete(fieldKey);
      }
      const generation = generationRef.current;
      void runSave(save, generation);
    },
    [runSave]
  );

  return { saveImmediate, saveDebounced, flushDebounced };
}
