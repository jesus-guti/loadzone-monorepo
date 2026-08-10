"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useRef, type ChangeEvent, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import {
  sliderReadoutDigit,
  sliderThumbOffsetPercent,
} from "../lib/slider-readout";
import "./slider-input.css";

type SliderInputProperties = {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly onCommit?: (value: number) => void;
  readonly anchorLabels: readonly [string, string];
  readonly labelForValue?: (value: number) => string;
  readonly colorForValue?: (value: number) => string;
  readonly gradientClassName?: string;
};

/** Tras el último movimiento del slider, sin nuevos cambios, avanzamos. */
const IDLE_COMMIT_MS = 520;

/** Tras soltar dedo/ratón, avanzamos un poco antes que el idle (mejor UX). */
const RELEASE_COMMIT_MS = 300;

/** Evita doble disparo pointerup + touchend con el mismo valor. */
const RELEASE_DEDUP_MS = 380;

/** Matches thumb geometry in slider-input.css (`3rem`). */
const THUMB_SIZE = "3rem";

const KEYS_THAT_MOVE_RANGE = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

const RANGE_APPEARANCE_STYLE = {
  WebkitAppearance: "none",
  appearance: "none",
  background: "transparent",
} as CSSProperties;

function defaultColor(): string {
  return "text-text-primary";
}

export function SliderInput({
  name,
  min,
  max,
  step = 1,
  value,
  onChange,
  onCommit,
  anchorLabels,
  labelForValue,
  colorForValue = defaultColor,
  gradientClassName = "from-danger via-premium to-brand",
}: SliderInputProperties) {
  const isUnset = value === null;
  const readoutDigit = sliderReadoutDigit(value, min, max);
  const thumbPercent = sliderThumbOffsetPercent(readoutDigit, min, max);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);
  const latestRef = useRef<number | null>(null);
  const lastReleaseDedupeRef = useRef<{ at: number; value: number } | null>(
    null
  );

  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  useEffect(() => {
    return (): void => {
      if (commitTimerRef.current !== null) {
        clearTimeout(commitTimerRef.current);
      }
    };
  }, []);

  function clearCommitTimer(): void {
    if (commitTimerRef.current !== null) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }

  function bumpTick(): number {
    tickRef.current += 1;
    return tickRef.current;
  }

  function scheduleCommitFromIdle(): void {
    clearCommitTimer();
    const tick = bumpTick();
    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = null;
      if (tick !== tickRef.current) return;
      const committed = latestRef.current;
      if (committed == null || Number.isNaN(committed)) return;
      flushSync(() => {
        onChange(committed);
      });
      onCommit?.(committed);
    }, IDLE_COMMIT_MS);
  }

  function scheduleCommitFromRelease(input: HTMLInputElement): void {
    const raw = Number(input.value);
    if (Number.isNaN(raw)) return;

    const now = Date.now();
    const prev = lastReleaseDedupeRef.current;
    if (
      prev !== null &&
      now - prev.at < RELEASE_DEDUP_MS &&
      prev.value === raw
    ) {
      return;
    }
    lastReleaseDedupeRef.current = { at: now, value: raw };

    clearCommitTimer();
    const tick = bumpTick();
    latestRef.current = raw;
    flushSync(() => {
      onChange(raw);
    });
    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = null;
      if (tick !== tickRef.current) return;
      onCommit?.(raw);
    }, RELEASE_COMMIT_MS);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    latestRef.current = next;
    onChange(next);
    if (navigator.vibrate) navigator.vibrate(6);
    scheduleCommitFromIdle();
  }

  function handlePointerUp(
    event: React.PointerEvent<HTMLInputElement>
  ): void {
    scheduleCommitFromRelease(event.currentTarget);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLInputElement>): void {
    scheduleCommitFromRelease(event.currentTarget);
  }

  function handleMouseUp(event: React.MouseEvent<HTMLInputElement>): void {
    scheduleCommitFromRelease(event.currentTarget);
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (!KEYS_THAT_MOVE_RANGE.has(event.key)) return;
    scheduleCommitFromRelease(event.currentTarget);
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name={name} value={value ?? ""} />

      <div className="flex flex-col items-center gap-2">
        <span
          className={cn(
            "text-7xl font-black leading-none tabular-nums transition-colors",
            isUnset ? "text-text-tertiary" : colorForValue(value)
          )}
        >
          {readoutDigit}
        </span>
        {value !== null && labelForValue ? (
          <span className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            {labelForValue(value)}
          </span>
        ) : (
          <span className="text-sm text-text-tertiary">
            Pulsa o desliza para elegir
          </span>
        )}
      </div>

      <div className="group relative min-h-12 py-2">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-linear-to-r",
            gradientClassName
          )}
        />
        <div
          aria-hidden
          data-slider-thumb=""
          data-unset={isUnset ? "true" : undefined}
          className="player-slider-thumb"
          style={{
            left: `calc(${thumbPercent / 100} * (100% - ${THUMB_SIZE}))`,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            boxSizing: "border-box",
            borderRadius: 9999,
            borderStyle: "solid",
            borderWidth: 3,
            borderColor: isUnset
              ? "var(--text-secondary)"
              : "var(--text-primary)",
            backgroundColor: "var(--bg-primary)",
            opacity: isUnset ? 0.7 : 1,
            position: "absolute",
            top: "50%",
            zIndex: 20,
            pointerEvents: "none",
            transform: "translateY(-50%)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={readoutDigit}
          onChange={handleChange}
          onPointerUp={handlePointerUp}
          onTouchEnd={handleTouchEnd}
          onMouseUp={handleMouseUp}
          onKeyUp={handleKeyUp}
          style={RANGE_APPEARANCE_STYLE}
          className="player-slider-range relative z-10 h-12 w-full cursor-pointer"
          aria-label={`Valor de ${min} a ${max}`}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
        <span>{anchorLabels[0]}</span>
        <span>{anchorLabels[1]}</span>
      </div>
    </div>
  );
}
