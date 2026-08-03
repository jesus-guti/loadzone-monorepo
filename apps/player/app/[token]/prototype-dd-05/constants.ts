/**
 * PROTOTYPE (DD-05) — throwaway check-in + reward-loop lab.
 * Three structural variants (A Focus / B Quiet timeline / C Reward-forward),
 * switchable via ?variant= and ?band= on the existing [token] route.
 */

export const PROTOTYPE_LAB_TOKEN = "cprototype000000000000001";

export const VARIANT_KEYS = ["A", "B", "C"] as const;
export type PrototypeVariant = (typeof VARIANT_KEYS)[number];

export const VARIANT_META: Record<
  PrototypeVariant,
  { readonly name: string; readonly thesis: string }
> = {
  A: {
    name: "Focus frame",
    thesis: "Una pregunta a pantalla completa · recompensa calmada al final",
  },
  B: {
    name: "Quiet timeline",
    thesis: "Filas completadas + un paso activo grande · racha quieta",
  },
  C: {
    name: "Reward-forward",
    thesis: "Cierre centrado en identidad futbolística (sin puntuación)",
  },
};

export const BAND_KEYS = ["assisted", "guided", "independent"] as const;
export type AgeBand = (typeof BAND_KEYS)[number];

/** Indicative defaults — staff-configurable; not hard product law. */
export const BAND_META: Record<
  AgeBand,
  {
    readonly label: string;
    readonly indicativeAges: string;
    readonly caption: string;
  }
> = {
  assisted: {
    label: "Asistida",
    indicativeAges: "ejemplo ~menores de 10 (configurable)",
    caption:
      "Check-in asistido: un adulto puede acompañar; responde el jugador. Una pregunta a la vez.",
  },
  guided: {
    label: "Guiada",
    indicativeAges: "ejemplo ~10–15 (configurable)",
    caption:
      "Puede completar solo; supervisión parental post-hoc (ver / avisar). Sin aprobar el check-in.",
  },
  independent: {
    label: "Independiente",
    indicativeAges: "ejemplo 16+ (configurable; 18+ supervisión off por defecto)",
    caption:
      "Opera solo. Supervisión off en demo 18+; 16–17 solo nota de política del club.",
  },
};

export type StubQuestion = {
  readonly id: string;
  readonly key: string;
  readonly options: readonly {
    readonly value: number;
    readonly labelAssisted: string;
    readonly labelGuided: string;
    readonly labelIndependent: string;
    readonly emoji?: string;
  }[];
  readonly careRelevant?: boolean;
  readonly careThreshold?: number;
};

export const STUB_QUESTIONS: readonly StubQuestion[] = [
  {
    id: "q-energy",
    key: "energy",
    options: [
      {
        value: 1,
        labelAssisted: "Muy bajo",
        labelGuided: "Muy baja",
        labelIndependent: "Muy baja",
        emoji: "😴",
      },
      {
        value: 2,
        labelAssisted: "Bajo",
        labelGuided: "Baja",
        labelIndependent: "Baja",
        emoji: "😕",
      },
      {
        value: 3,
        labelAssisted: "Normal",
        labelGuided: "Normal",
        labelIndependent: "Moderada",
        emoji: "😐",
      },
      {
        value: 4,
        labelAssisted: "Bien",
        labelGuided: "Alta",
        labelIndependent: "Alta",
        emoji: "🙂",
      },
      {
        value: 5,
        labelAssisted: "Genial",
        labelGuided: "Muy alta",
        labelIndependent: "Muy alta",
        emoji: "⚡",
      },
    ],
  },
  {
    id: "q-feel",
    key: "feel",
    options: [
      {
        value: 1,
        labelAssisted: "Mal",
        labelGuided: "Mal",
        labelIndependent: "Malestar",
        emoji: "😣",
      },
      {
        value: 2,
        labelAssisted: "Regular",
        labelGuided: "Regular",
        labelIndependent: "Regular",
        emoji: "😕",
      },
      {
        value: 3,
        labelAssisted: "Bien",
        labelGuided: "Bien",
        labelIndependent: "Bien",
        emoji: "🙂",
      },
      {
        value: 4,
        labelAssisted: "Muy bien",
        labelGuided: "Muy bien",
        labelIndependent: "Muy bien",
        emoji: "😊",
      },
      {
        value: 5,
        labelAssisted: "Súper",
        labelGuided: "Excelente",
        labelIndependent: "Excelente",
        emoji: "🌟",
      },
    ],
  },
  {
    id: "q-sleep",
    key: "sleep",
    options: [
      {
        value: 1,
        labelAssisted: "Poco",
        labelGuided: "Poco sueño",
        labelIndependent: "Sueño insuficiente",
        emoji: "🥱",
      },
      {
        value: 2,
        labelAssisted: "Algo",
        labelGuided: "Regular",
        labelIndependent: "Irregular",
        emoji: "😑",
      },
      {
        value: 3,
        labelAssisted: "Normal",
        labelGuided: "Normal",
        labelIndependent: "Adecuado",
        emoji: "😐",
      },
      {
        value: 4,
        labelAssisted: "Bien",
        labelGuided: "Bien",
        labelIndependent: "Reparador",
        emoji: "😌",
      },
      {
        value: 5,
        labelAssisted: "Genial",
        labelGuided: "Muy bien",
        labelIndependent: "Óptimo",
        emoji: "😴",
      },
    ],
  },
  {
    id: "q-soreness",
    key: "soreness",
    careRelevant: true,
    careThreshold: 4,
    options: [
      {
        value: 1,
        labelAssisted: "Nada",
        labelGuided: "Sin agujetas",
        labelIndependent: "Sin dolor muscular",
        emoji: "✨",
      },
      {
        value: 2,
        labelAssisted: "Poquito",
        labelGuided: "Leves",
        labelIndependent: "Leve",
        emoji: "🤏",
      },
      {
        value: 3,
        labelAssisted: "Un poco",
        labelGuided: "Moderadas",
        labelIndependent: "Moderado",
        emoji: "😮‍💨",
      },
      {
        value: 4,
        labelAssisted: "Bastante",
        labelGuided: "Bastante",
        labelIndependent: "Marcado",
        emoji: "😣",
      },
      {
        value: 5,
        labelAssisted: "Mucho",
        labelGuided: "Muy fuertes",
        labelIndependent: "Severo",
        emoji: "🤕",
      },
    ],
  },
];

export const DEMO_STREAK = 4;
export const DEMO_PLAYER_NAME = "Alex";
export const DEMO_TEAM_NAME = "Cadete A";

export function parseVariant(raw: string | undefined): PrototypeVariant | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === "A" || upper === "B" || upper === "C") return upper;
  return null;
}

export function parseBand(raw: string | undefined): AgeBand {
  if (raw === "guided" || raw === "independent" || raw === "assisted") {
    return raw;
  }
  return "assisted";
}

export function isPrototypeLabToken(token: string): boolean {
  return token === PROTOTYPE_LAB_TOKEN;
}
