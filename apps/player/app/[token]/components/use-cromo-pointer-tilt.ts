"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type TiltVars = {
  readonly style: CSSProperties;
  readonly interacting: boolean;
  readonly onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  readonly onPointerEnter: () => void;
  readonly onPointerLeave: () => void;
};

type SpringPair = {
  value: number;
  velocity: number;
};

/** Modest pointer spring for cromo 3D tilt (inspired rewrite; not GPL CSS). */
const INTERACT_STIFFNESS = 0.066;
const INTERACT_DAMPING = 0.25;
/** Same as `interactEnd` snap-back. */
const SNAP_STIFFNESS = 0.01;
const SNAP_DAMPING = 0.06;
const SNAP_DELAY_MS = 500;
const SETTLE = 0.01;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 3): number {
  return Number.parseFloat(value.toFixed(precision));
}

function mapFromPercent(value: number, outMin: number, outMax: number): number {
  return outMin + ((outMax - outMin) * value) / 100;
}

function isSettled(a: SpringPair, b: SpringPair, c: SpringPair): boolean {
  return a.velocity === 0 && b.velocity === 0 && c.velocity === 0;
}

function stepSpring(
  spring: SpringPair,
  target: number,
  stiffness: number,
  damping: number
): void {
  const delta = target - spring.value;
  const acceleration = stiffness * delta - damping * spring.velocity;
  spring.velocity += acceleration;
  spring.value += spring.velocity;
  if (Math.abs(spring.velocity) < SETTLE && Math.abs(delta) < SETTLE) {
    spring.value = target;
    spring.velocity = 0;
  }
}

/**
 * Pointer → CSS vars. Targets update on move; painted values follow a
 * svelte/motion-style spring so the card eases toward the cursor instead of snapping.
 */
export function usePointerTilt(reducedMotion: boolean): TiltVars {
  const [interacting, setInteracting] = useState(false);
  const interactingRef = useRef(false);
  const snapTimerRef = useRef<number>(0);
  const frameRef = useRef(0);
  const [style, setStyle] = useState<CSSProperties>({});

  const px = useRef<SpringPair>({ value: 50, velocity: 0 });
  const py = useRef<SpringPair>({ value: 50, velocity: 0 });
  const opacity = useRef<SpringPair>({ value: 0.38, velocity: 0 });
  const targetPx = useRef(50);
  const targetPy = useRef(50);
  const targetOpacity = useRef(0.38);
  const stiffness = useRef(INTERACT_STIFFNESS);
  const damping = useRef(INTERACT_DAMPING);
  const leaveRest = useRef(false);

  useEffect(() => {
    const paint = (x: number, y: number, o: number, interactingFlag: 0 | 1): void => {
      const fromCenter = clamp(Math.hypot(x - 50, y - 50) / 50, 0, 1);
      setStyle({
        ["--lz-pointer-x" as string]: `${x}%`,
        ["--lz-pointer-y" as string]: `${y}%`,
        ["--lz-from-center" as string]: String(fromCenter),
        ["--lz-from-left" as string]: String(x / 100),
        ["--lz-from-top" as string]: String(y / 100),
        ["--lz-rotate-y" as string]: `${-((x - 50) / 3.5)}deg`,
        ["--lz-rotate-x" as string]: `${(y - 50) / 3.5}deg`,
        ["--lz-bg-x" as string]: `${mapFromPercent(x, 37, 63)}%`,
        ["--lz-bg-y" as string]: `${mapFromPercent(y, 33, 67)}%`,
        ["--lz-card-opacity" as string]: String(o),
        ["--lz-interacting" as string]: String(interactingFlag),
      });
    };

    if (reducedMotion) {
      paint(50, 50, 0, 0);
      return;
    }

    const tick = (time: number): void => {
      const idleAmbient = !interactingRef.current && !leaveRest.current;
      if (idleAmbient) {
        const t = time / 1000;
        targetPx.current = 50 + Math.sin(t * 0.55) * 14;
        targetPy.current = 50 + Math.cos(t * 0.42) * 10;
        targetOpacity.current = 0.38;
        stiffness.current = INTERACT_STIFFNESS;
        damping.current = INTERACT_DAMPING;
      }

      stepSpring(px.current, targetPx.current, stiffness.current, damping.current);
      stepSpring(py.current, targetPy.current, stiffness.current, damping.current);
      stepSpring(
        opacity.current,
        targetOpacity.current,
        stiffness.current,
        damping.current
      );

      if (leaveRest.current && isSettled(px.current, py.current, opacity.current)) {
        leaveRest.current = false;
      }

      paint(
        px.current.value,
        py.current.value,
        opacity.current.value,
        interactingRef.current ? 1 : 0
      );
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(snapTimerRef.current);
    };
  }, [reducedMotion]);

  return {
    style,
    interacting,
    onPointerEnter: () => {
      if (reducedMotion) {
        return;
      }
      window.clearTimeout(snapTimerRef.current);
      leaveRest.current = false;
      interactingRef.current = true;
      stiffness.current = INTERACT_STIFFNESS;
      damping.current = INTERACT_DAMPING;
      setInteracting(true);
    },
    onPointerLeave: () => {
      interactingRef.current = false;
      setInteracting(false);
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = window.setTimeout(() => {
        leaveRest.current = true;
        stiffness.current = SNAP_STIFFNESS;
        damping.current = SNAP_DAMPING;
        targetPx.current = 50;
        targetPy.current = 50;
        targetOpacity.current = 0;
      }, SNAP_DELAY_MS);
    },
    onPointerMove: (event) => {
      if (reducedMotion) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      targetPx.current = clamp(
        round(((event.clientX - rect.left) / rect.width) * 100),
        0,
        100
      );
      targetPy.current = clamp(
        round(((event.clientY - rect.top) / rect.height) * 100),
        0,
        100
      );
      targetOpacity.current = 0.58;
    },
  };
}
