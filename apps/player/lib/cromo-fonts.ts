import { Fraunces, Instrument_Serif } from "next/font/google";

/**
 * Player-local Cromo display serifs — not a second product typeface.
 * Quiet tiers: Instrument Serif. High tiers: Fraunces (softer, more optical size).
 */
export const cromoInstrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cromo-instrument",
});

export const cromoFraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-cromo-fraunces",
});
