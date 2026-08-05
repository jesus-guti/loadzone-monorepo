"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SettingsFieldResult } from "./types";

const TEXT_DEBOUNCE_MS = 300;

/**
 * Prototype mirror of useSettingsAutosave (JES-58 generation / debounce law).
 * Surfaces last outcome via optional onResult for the state panel.
 */
export function usePrototypeAutosave(options: {
  readonly scopeKey: string;
  readonly onResult?: (
    fieldKey: string,
    result: SettingsFieldResult
  ) => void;
}) {
  const { scopeKey, onResult } = options;
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
  }, [scopeKey]);

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
      fieldKey: string,
      save: () => Promise<SettingsFieldResult>,
      generation: number
    ): Promise<void> => {
      const result = await save();
      if (generation !== generationRef.current) {
        return;
      }
      onResult?.(fieldKey, result);
    },
    [onResult]
  );

  const saveImmediate = useCallback(
    (
      fieldKey: string,
      save: () => Promise<SettingsFieldResult>
    ): void => {
      const generation = generationRef.current;
      void runSave(fieldKey, save, generation);
    },
    [runSave]
  );

  const saveDebounced = useCallback(
    (
      fieldKey: string,
      save: () => Promise<SettingsFieldResult>
    ): void => {
      const existing = debounceTimers.current.get(fieldKey);
      if (existing) {
        clearTimeout(existing);
      }
      const generation = generationRef.current;
      const timer = setTimeout(() => {
        debounceTimers.current.delete(fieldKey);
        void runSave(fieldKey, save, generation);
      }, TEXT_DEBOUNCE_MS);
      debounceTimers.current.set(fieldKey, timer);
    },
    [runSave]
  );

  const flushDebounced = useCallback(
    (
      fieldKey: string,
      save: () => Promise<SettingsFieldResult>
    ): void => {
      const existing = debounceTimers.current.get(fieldKey);
      if (existing) {
        clearTimeout(existing);
        debounceTimers.current.delete(fieldKey);
      }
      const generation = generationRef.current;
      void runSave(fieldKey, save, generation);
    },
    [runSave]
  );

  return { saveImmediate, saveDebounced, flushDebounced };
}
