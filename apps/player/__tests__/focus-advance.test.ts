import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFocusAdvanceScheduler,
  DISCRETE_ADVANCE_DEBOUNCE_MS,
} from "../app/[token]/lib/focus-advance";

describe("createFocusAdvanceScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exports a 300ms discrete debounce matching slider release commit", () => {
    expect(DISCRETE_ADVANCE_DEBOUNCE_MS).toBe(300);
  });

  it("fires advance once after the debounce window", () => {
    const scheduler = createFocusAdvanceScheduler();
    const advance = vi.fn();

    scheduler.schedule(advance);
    expect(advance).not.toHaveBeenCalled();

    vi.advanceTimersByTime(DISCRETE_ADVANCE_DEBOUNCE_MS - 1);
    expect(advance).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("lets the latest schedule win when re-selecting before the timer fires", () => {
    const scheduler = createFocusAdvanceScheduler();
    const first = vi.fn();
    const second = vi.fn();

    scheduler.schedule(first);
    vi.advanceTimersByTime(100);
    scheduler.schedule(second);

    vi.advanceTimersByTime(DISCRETE_ADVANCE_DEBOUNCE_MS);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("cancel prevents a pending advance (edit / re-select guard)", () => {
    const scheduler = createFocusAdvanceScheduler();
    const advance = vi.fn();

    scheduler.schedule(advance);
    scheduler.cancel();
    vi.advanceTimersByTime(DISCRETE_ADVANCE_DEBOUNCE_MS);
    expect(advance).not.toHaveBeenCalled();
  });

  it("dispose prevents pending and future advances (unmount)", () => {
    const scheduler = createFocusAdvanceScheduler();
    const pending = vi.fn();
    const afterDispose = vi.fn();

    scheduler.schedule(pending);
    scheduler.dispose();
    vi.advanceTimersByTime(DISCRETE_ADVANCE_DEBOUNCE_MS);
    expect(pending).not.toHaveBeenCalled();

    scheduler.schedule(afterDispose);
    vi.advanceTimersByTime(DISCRETE_ADVANCE_DEBOUNCE_MS);
    expect(afterDispose).not.toHaveBeenCalled();
  });
});
