import type { AgeBand, StubQuestion } from "./constants";

export function questionPrompt(key: string, band: AgeBand): string {
  const prompts: Record<string, Record<AgeBand, string>> = {
    energy: {
      assisted: "¿Cómo está tu energía hoy?",
      guided: "¿Cómo está tu energía hoy?",
      independent: "¿Cómo valoras tu energía hoy?",
    },
    feel: {
      assisted: "¿Cómo te sientes?",
      guided: "¿Cómo te sientes en general?",
      independent: "¿Cómo describirías tu estado de bienestar?",
    },
    sleep: {
      assisted: "¿Cómo dormiste?",
      guided: "¿Cómo dormiste anoche?",
      independent: "¿Cómo fue la calidad de tu sueño?",
    },
    soreness: {
      assisted: "¿Te duelen los músculos?",
      guided: "¿Tienes agujetas o dolor muscular?",
      independent: "¿Nivel de dolor / agujetas musculares?",
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
  prototypeBadge: "PROTOTIPO · DD-05",
  prototypeHint:
    "Throwaway lab. Sin guardar. Sin notificaciones reales. Las edades son ejemplos configurables por el club.",
  continue: "Continuar",
  finish: "Terminar check-in",
  restart: "Empezar de nuevo",
  simulateMiss: "Simular día perdido",
  clearMiss: "Quitar simulación",
  streakCalm: (n: number) => `${n} días seguidos`,
  streakMissCalm:
    "Hoy no contó — está bien. Cuando vuelvas, seguimos sin presión.",
  completionTitle: {
    assisted: "¡Listo!",
    guided: "Check-in completado",
    independent: "Registro completado",
  } as Record<AgeBand, string>,
  completionBody: {
    assisted: "Gracias. Tu club cuida de ti.",
    guided: "Gracias. Tu club puede ver que completaste el check-in.",
    independent: "Gracias. Tu registro quedó disponible para el staff.",
  } as Record<AgeBand, string>,
  assistedPresence:
    "Está bien que un adulto te acompañe. Tú respondes las preguntas.",
  careSilentNote:
    "Tu club / un adulto puede ver una alerta de cuidado. No hace falta aprobar nada.",
  deferredBanner:
    "Cuando termines, un adulto puede ver que completaste el check-in (solo ver — sin aprobar).",
  independentFootnote:
    "Política del club (ejemplo 16–17): la supervisión puede estar activa según configuración del staff.",
  footballTeaserTitle: "Tu carta de hoy",
  footballTeaserHint:
    "Solo un guiño de identidad. No es puntuación médica ni de rendimiento.",
  footballAttribute: "Espíritu de equipo",
  howBandChanges: "Cómo cambia por banda",
  stepOf: (current: number, total: number) => `${current} de ${total}`,
} as const;
