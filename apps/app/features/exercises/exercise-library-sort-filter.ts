import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
  VISIBILITY_OPTIONS,
} from "./components/exercise-enums";
import type { ExerciseLibraryListItem, ExerciseLibrarySortKey } from "./types";

/** Dimensión del filtro (alineada con campos del modelo `Exercise` en Prisma). */
export type ExerciseLibraryFilterDimension =
  | "complexity"
  | "strategy"
  | "tacticalIntention"
  | "dynamicType"
  | "coordinativeSkill"
  | "gameSituation"
  | "coordinationType"
  | "visibility"
  | "origin";

export type ExerciseLibraryFilter =
  | { readonly kind: "none" }
  | {
      readonly kind: "field";
      readonly dimension: Exclude<ExerciseLibraryFilterDimension, "origin">;
      readonly value: string;
    }
  | { readonly kind: "origin"; readonly value: "SYSTEM" | "CUSTOM" };

/** Valor del select de dimensión cuando no hay filtro (evita `value=""` en Radix Select). */
export const EXERCISE_LIBRARY_FILTER_NONE = "__none__" as const;

export const EXERCISE_LIBRARY_FILTER_DIMENSIONS: ReadonlyArray<{
  readonly value: ExerciseLibraryFilterDimension;
  readonly label: string;
}> = [
  { value: "complexity", label: "Complejidad" },
  { value: "strategy", label: "Estrategia" },
  { value: "tacticalIntention", label: "Intención táctica" },
  { value: "dynamicType", label: "Tipo dinámico" },
  { value: "coordinativeSkill", label: "Habilidad coordinativa" },
  { value: "gameSituation", label: "Situación de juego" },
  { value: "coordinationType", label: "Tipo de coordinación" },
  { value: "visibility", label: "Visibilidad" },
  { value: "origin", label: "Origen" },
] as const;

const ORIGIN_FILTER_OPTIONS = [
  { value: "SYSTEM", label: "Catálogo" },
  { value: "CUSTOM", label: "Club" },
] as const;

/** Opciones de valor para la segunda lista según la dimensión elegida. */
export function getExerciseLibraryFilterValueOptions(
  dimension: string
): ReadonlyArray<{ readonly value: string; readonly label: string }> {
  if (dimension === "" || dimension === EXERCISE_LIBRARY_FILTER_NONE) {
    return [];
  }
  if (dimension === "origin") {
    return ORIGIN_FILTER_OPTIONS;
  }
  if (dimension === "complexity") {
    return COMPLEXITY_OPTIONS;
  }
  if (dimension === "strategy") {
    return STRATEGY_OPTIONS;
  }
  if (dimension === "tacticalIntention") {
    return TACTICAL_INTENTION_OPTIONS;
  }
  if (dimension === "dynamicType") {
    return DYNAMIC_TYPE_OPTIONS;
  }
  if (dimension === "coordinativeSkill") {
    return COORDINATIVE_SKILL_OPTIONS;
  }
  if (dimension === "gameSituation") {
    return GAME_SITUATION_OPTIONS;
  }
  if (dimension === "coordinationType") {
    return COORDINATION_TYPE_OPTIONS;
  }
  if (dimension === "visibility") {
    return VISIBILITY_OPTIONS;
  }
  return [];
}

export function buildExerciseLibraryFilter(
  dimension: string,
  value: string
): ExerciseLibraryFilter {
  if (
    dimension === "" ||
    dimension === EXERCISE_LIBRARY_FILTER_NONE ||
    value === ""
  ) {
    return { kind: "none" };
  }
  if (dimension === "origin") {
    if (value !== "SYSTEM" && value !== "CUSTOM") {
      return { kind: "none" };
    }
    return { kind: "origin", value };
  }
  return {
    kind: "field",
    dimension: dimension as Exclude<ExerciseLibraryFilterDimension, "origin">,
    value,
  };
}

export function matchesExerciseLibraryFilter(
  item: ExerciseLibraryListItem,
  filter: ExerciseLibraryFilter
): boolean {
  if (filter.kind === "none") {
    return true;
  }
  if (filter.kind === "origin") {
    return filter.value === "SYSTEM" ? item.isSystem : !item.isSystem;
  }
  switch (filter.dimension) {
    case "complexity":
      return item.complexity === filter.value;
    case "strategy":
      return item.strategy === filter.value;
    case "tacticalIntention":
      return item.tacticalIntention === filter.value;
    case "dynamicType":
      return item.dynamicType === filter.value;
    case "coordinativeSkill":
      return item.coordinativeSkill === filter.value;
    case "gameSituation":
      return item.gameSituation === filter.value;
    case "coordinationType":
      return item.coordinationType === filter.value;
    case "visibility":
      return item.visibility === filter.value;
    default: {
      const _never: never = filter.dimension;
      return _never;
    }
  }
}

export function filterExerciseLibraryItems(
  items: readonly ExerciseLibraryListItem[],
  filter: ExerciseLibraryFilter
): ExerciseLibraryListItem[] {
  if (filter.kind === "none") {
    return [...items];
  }
  return items.filter((item) => matchesExerciseLibraryFilter(item, filter));
}

function enumRank(
  value: string,
  ordered: readonly { value: string }[]
): number {
  const i = ordered.findIndex((o) => o.value === value);
  return i === -1 ? ordered.length : i;
}

function tieBreak(
  a: ExerciseLibraryListItem,
  b: ExerciseLibraryListItem
): number {
  return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
}

export function compareExerciseLibraryItems(
  a: ExerciseLibraryListItem,
  b: ExerciseLibraryListItem,
  sort: ExerciseLibrarySortKey
): number {
  let cmp = 0;
  switch (sort) {
    case "name_asc":
      return tieBreak(a, b);
    case "name_desc":
      return tieBreak(b, a);
    case "updated_desc":
      cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      break;
    case "updated_asc":
      cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      break;
    case "duration_asc":
      cmp = a.durationMinutes - b.durationMinutes;
      break;
    case "duration_desc":
      cmp = b.durationMinutes - a.durationMinutes;
      break;
    case "complexity_asc":
      cmp =
        enumRank(a.complexity, COMPLEXITY_OPTIONS) -
        enumRank(b.complexity, COMPLEXITY_OPTIONS);
      break;
    case "complexity_desc":
      cmp =
        enumRank(b.complexity, COMPLEXITY_OPTIONS) -
        enumRank(a.complexity, COMPLEXITY_OPTIONS);
      break;
    case "strategy_asc":
      cmp =
        enumRank(a.strategy, STRATEGY_OPTIONS) -
        enumRank(b.strategy, STRATEGY_OPTIONS);
      break;
    case "strategy_desc":
      cmp =
        enumRank(b.strategy, STRATEGY_OPTIONS) -
        enumRank(a.strategy, STRATEGY_OPTIONS);
      break;
    case "tactical_asc":
      cmp =
        enumRank(a.tacticalIntention, TACTICAL_INTENTION_OPTIONS) -
        enumRank(b.tacticalIntention, TACTICAL_INTENTION_OPTIONS);
      break;
    case "tactical_desc":
      cmp =
        enumRank(b.tacticalIntention, TACTICAL_INTENTION_OPTIONS) -
        enumRank(a.tacticalIntention, TACTICAL_INTENTION_OPTIONS);
      break;
    case "dynamic_asc":
      cmp =
        enumRank(a.dynamicType, DYNAMIC_TYPE_OPTIONS) -
        enumRank(b.dynamicType, DYNAMIC_TYPE_OPTIONS);
      break;
    case "dynamic_desc":
      cmp =
        enumRank(b.dynamicType, DYNAMIC_TYPE_OPTIONS) -
        enumRank(a.dynamicType, DYNAMIC_TYPE_OPTIONS);
      break;
    case "coordinative_asc":
      cmp =
        enumRank(a.coordinativeSkill, COORDINATIVE_SKILL_OPTIONS) -
        enumRank(b.coordinativeSkill, COORDINATIVE_SKILL_OPTIONS);
      break;
    case "coordinative_desc":
      cmp =
        enumRank(b.coordinativeSkill, COORDINATIVE_SKILL_OPTIONS) -
        enumRank(a.coordinativeSkill, COORDINATIVE_SKILL_OPTIONS);
      break;
    case "game_situation_asc":
      cmp =
        enumRank(a.gameSituation, GAME_SITUATION_OPTIONS) -
        enumRank(b.gameSituation, GAME_SITUATION_OPTIONS);
      break;
    case "game_situation_desc":
      cmp =
        enumRank(b.gameSituation, GAME_SITUATION_OPTIONS) -
        enumRank(a.gameSituation, GAME_SITUATION_OPTIONS);
      break;
    case "coordination_asc":
      cmp =
        enumRank(a.coordinationType, COORDINATION_TYPE_OPTIONS) -
        enumRank(b.coordinationType, COORDINATION_TYPE_OPTIONS);
      break;
    case "coordination_desc":
      cmp =
        enumRank(b.coordinationType, COORDINATION_TYPE_OPTIONS) -
        enumRank(a.coordinationType, COORDINATION_TYPE_OPTIONS);
      break;
    default:
      return tieBreak(a, b);
  }
  if (cmp !== 0) {
    return cmp;
  }
  return tieBreak(a, b);
}

export function sortExerciseLibraryItems(
  items: readonly ExerciseLibraryListItem[],
  sort: ExerciseLibrarySortKey
): ExerciseLibraryListItem[] {
  return [...items].sort((a, b) => compareExerciseLibraryItems(a, b, sort));
}

export type ExerciseLibrarySortOption = {
  readonly value: ExerciseLibrarySortKey;
  readonly label: string;
  readonly group: string;
};

/** Opciones del selector de orden (orden de lista = orden de los enums en formulario). */
export const EXERCISE_LIBRARY_SORT_OPTIONS: readonly ExerciseLibrarySortOption[] =
  [
    {
      value: "updated_desc",
      label: "Última modificación (recientes primero)",
      group: "General",
    },
    {
      value: "updated_asc",
      label: "Última modificación (antiguos primero)",
      group: "General",
    },
    { value: "name_asc", label: "Nombre (A → Z)", group: "General" },
    { value: "name_desc", label: "Nombre (Z → A)", group: "General" },
    {
      value: "duration_asc",
      label: "Duración (menor a mayor)",
      group: "General",
    },
    {
      value: "duration_desc",
      label: "Duración (mayor a menor)",
      group: "General",
    },
    {
      value: "complexity_asc",
      label: "Complejidad (de baja a alta)",
      group: "Por atributo",
    },
    {
      value: "complexity_desc",
      label: "Complejidad (de alta a baja)",
      group: "Por atributo",
    },
    {
      value: "strategy_asc",
      label: "Estrategia (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "strategy_desc",
      label: "Estrategia (orden inverso)",
      group: "Por atributo",
    },
    {
      value: "tactical_asc",
      label: "Intención táctica (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "tactical_desc",
      label: "Intención táctica (orden inverso)",
      group: "Por atributo",
    },
    {
      value: "dynamic_asc",
      label: "Tipo dinámico (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "dynamic_desc",
      label: "Tipo dinámico (orden inverso)",
      group: "Por atributo",
    },
    {
      value: "coordinative_asc",
      label: "Habilidad coordinativa (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "coordinative_desc",
      label: "Habilidad coordinativa (orden inverso)",
      group: "Por atributo",
    },
    {
      value: "game_situation_asc",
      label: "Situación de juego (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "game_situation_desc",
      label: "Situación de juego (orden inverso)",
      group: "Por atributo",
    },
    {
      value: "coordination_asc",
      label: "Tipo de coordinación (orden de categorías)",
      group: "Por atributo",
    },
    {
      value: "coordination_desc",
      label: "Tipo de coordinación (orden inverso)",
      group: "Por atributo",
    },
  ] as const;

export function isExerciseLibrarySortKey(
  value: string
): value is ExerciseLibrarySortKey {
  return EXERCISE_LIBRARY_SORT_OPTIONS.some((o) => o.value === value);
}
