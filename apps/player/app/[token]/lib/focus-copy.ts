import {
  DEFAULT_AGE_BAND,
  type AgeBand,
} from "./age-band";

export { DEFAULT_AGE_BAND, type AgeBand };

/**
 * Thin adaptive overlay for known mappingKeys.
 * Unknown questions keep the staff-authored template label.
 */
const QUESTION_PROMPTS: Record<string, Record<AgeBand, string>> = {
  recovery: {
    assisted: "¿Cómo te has recuperado?",
    guided: "¿Cómo te has recuperado?",
    independent: "¿Recuperación?",
  },
  energy: {
    assisted: "¿Cómo está tu energía?",
    guided: "¿Cómo está tu energía?",
    independent: "¿Tu energía?",
  },
  soreness: {
    assisted: "¿Te duelen los músculos?",
    guided: "¿Agujetas?",
    independent: "¿Agujetas?",
  },
  sleepHours: {
    assisted: "¿Cuántas horas dormiste?",
    guided: "¿Horas de sueño?",
    independent: "¿Sueño (h)?",
  },
  sleepQuality: {
    assisted: "¿Cómo dormiste?",
    guided: "¿Cómo dormiste?",
    independent: "¿Calidad del sueño?",
  },
  rpe: {
    assisted: "¿Qué tan duro se sintió?",
    guided: "¿Qué tan duro se sintió?",
    independent: "¿Esfuerzo (RPE)?",
  },
};

export function resolveQuestionLabel(
  mappingKey: string | null,
  band: AgeBand,
  fallbackLabel: string
): string {
  if (!mappingKey) return fallbackLabel;
  return QUESTION_PROMPTS[mappingKey]?.[band] ?? fallbackLabel;
}

export function shouldShowAssistedPresence(band: AgeBand): boolean {
  return band === "assisted";
}

export function shouldShowCareSilentNote(
  band: AgeBand,
  careTriggered: boolean
): boolean {
  return careTriggered && band !== "independent";
}

/** Care-relevant threshold aligned with DD-05 soreness care flag. */
export function isCareRelevantAnswer(
  mappingKey: string,
  value: number | null
): boolean {
  if (value === null) return false;
  if (mappingKey === "soreness") return value >= 4;
  return false;
}

export const FOCUS_COPY = {
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
  assistedPresence: "Un adulto puede acompañarte.",
  careSilentNote: "El club puede enterarse.",
  streakCalm: (n: number): string => `${n} días`,
  /** Calm restart after an unexcused miss — no guilt framing. */
  streakRestart: "Empezamos de nuevo.",
  stepOf: (current: number, total: number): string => `${current}/${total}`,
  save: "Guardar",
  saving: "Guardando…",
  remainingOne: "Falta 1 respuesta",
  remainingMany: (n: number): string => `Faltan ${n} respuestas`,
  preDoneTitle: "Pre-sesión lista",
  preDoneBody: "Cuando termines, sigue con post-sesión.",
  postDoneTitle: "Post-sesión lista",
  postDoneBody: (firstName: string): string => `Buen trabajo, ${firstName}.`,
  editPre: "Editar pre-sesión",
  editPost: "Editar post-sesión",
  goPost: "Ir a post-sesión",
  pastDateDone: "Pre y post registradas para esta fecha.",
} as const;
