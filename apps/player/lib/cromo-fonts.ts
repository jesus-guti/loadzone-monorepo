import { Instrument_Serif } from "next/font/google";

/**
 * Player-local Cromo display serif — not a second product typeface.
 * Used for Team name on the card.
 */
export const cromoInstrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cromo-instrument",
});
