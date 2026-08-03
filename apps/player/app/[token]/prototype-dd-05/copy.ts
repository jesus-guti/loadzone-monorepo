import type { AgeBand, StubQuestion } from "./constants";

export function questionPrompt(key: string, band: AgeBand): string {
  const prompts: Record<string, Record<AgeBand, string>> = {
    energy: {
      assisted: "¿Cómo está tu energía?",
      guided: "¿Cómo está tu energía?",
      independent: "¿Tu energía?",
    },
    feel: {
      assisted: "¿Cómo te sientes?",
      guided: "¿Cómo te sientes?",
      independent: "¿Cómo te sientes?",
    },
    sleep: {
      assisted: "¿Cómo dormiste?",
      guided: "¿Cómo dormiste?",
      independent: "¿Cómo dormiste?",
    },
    soreness: {
      assisted: "¿Te duelen los músculos?",
      guided: "¿Agujetas?",
      independent: "¿Agujetas?",
    },
  };
  return prompts[key]?.[band] ?? key;
}

export function optionLabel(
  option: StubQuestion["options"][number],
  band: AgeBand
): string {
  if (band === "independent") return option.labelIndependent;
  if (band === "guided") return option.labelGuided;
  return option.labelAssisted;
}

export const COPY = {
  prototypeBadge: "PROTOTIPO",
  /** Lab-only; keep off the main reading path when possible. */
  prototypeHint: "",
  continue: "Continuar",
  finish: "Listo",
  restart: "Otra vez",
  simulateMiss: "Simular día perdido",
  clearMiss: "Quitar simulación",
  streakCalm: (n: number) => `${n} días`,
  streakMissCalm: "Hoy no cuenta. Sin problema.",
  completionTitle: {
    assisted: "¡Listo!",
    guided: "¡Listo!",
    independent: "Hecho",
  } as Record<AgeBand, string>,
  completionBody: {
    assisted: "Gracias.",
    guided: "Gracias.",
    independent: "Gracias.",
  } as Record<AgeBand, string>,
  /** One short line; no policy explanation. */
  assistedPresence: "Un adulto puede acompañarte.",
  careSilentNote: "El club puede enterarse.",
  deferredBanner: "",
  independentFootnote: "",
  footballTeaserTitle: "Tu carta",
  footballTeaserHint: "",
  footballAttribute: "Espíritu de equipo",
  stepOf: (current: number, total: number) => `${current}/${total}`,
} as const;
