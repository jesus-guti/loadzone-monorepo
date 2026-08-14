/**
 * Visual midpoint for an unset range control (display-only; do not persist).
 */
export function midpointForRange(min: number, max: number): number {
  return Math.round((min + max) / 2);
}

/**
 * Large readout digit: muted mid while unset, committed value after interaction.
 */
export function sliderReadoutDigit(
  value: number | null,
  min: number,
  max: number
): number {
  return value ?? midpointForRange(min, max);
}

/**
 * 0–100 position along the track for the visual thumb (matches native range).
 */
export function sliderThumbOffsetPercent(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) {
    return 0;
  }
  return ((value - min) / (max - min)) * 100;
}
