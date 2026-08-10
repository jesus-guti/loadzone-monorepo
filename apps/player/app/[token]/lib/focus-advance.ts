/**
 * Debounce for Focus-frame discrete answer → step advance.
 * Matches SliderInput RELEASE_COMMIT_MS so discrete and continuous advances feel consistent.
 */
export const DISCRETE_ADVANCE_DEBOUNCE_MS = 300;

export type FocusAdvanceScheduler = {
  /** Paint is caller's job; this only schedules `advance` after idle debounce. */
  schedule: (advance: () => void) => void;
  /** Bump generation and clear timer (re-select, edit, or superseding schedule). */
  cancel: () => void;
  /** Cancel and reject any further schedules (unmount). */
  dispose: () => void;
};

/**
 * Generation-tick scheduler: latest schedule wins; cancel/dispose prevent stale advances.
 */
export function createFocusAdvanceScheduler(
  debounceMs: number = DISCRETE_ADVANCE_DEBOUNCE_MS
): FocusAdvanceScheduler {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let tick = 0;
  let disposed = false;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    schedule(advance: () => void): void {
      if (disposed) return;
      clearTimer();
      const scheduledTick = ++tick;
      timer = setTimeout(() => {
        timer = null;
        if (disposed || scheduledTick !== tick) return;
        advance();
      }, debounceMs);
    },
    cancel(): void {
      tick += 1;
      clearTimer();
    },
    dispose(): void {
      disposed = true;
      tick += 1;
      clearTimer();
    },
  };
}
