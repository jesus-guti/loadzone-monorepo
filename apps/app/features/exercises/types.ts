/** Contrato serializable para la biblioteca de ejercicios (API y cliente). */
export type ExerciseLibraryListItem = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly clubId: string | null;
  readonly isSystem: boolean;
  readonly durationMinutes: number;
  readonly complexity: string;
  readonly strategy: string;
  readonly tacticalIntention: string;
  readonly dynamicType: string;
  readonly coordinativeSkill: string;
  readonly gameSituation: string;
  readonly coordinationType: string;
  readonly visibility: "PRIVATE" | "CLUB_SHARED";
  readonly createdByMembershipId: string | null;
  readonly createdByUserName: string | null;
  readonly updatedAt: string;
  readonly isFavorite: boolean;
  /** JSON string del diagrama para `BoardPreview`, o `null` si no hay pizarra. */
  readonly diagramDataJson: string | null;
  readonly diagramThumbnailUrl: string | null;
};

/** Fila mínima para el selector de ejercicios al crear sesiones. */
export type ExercisePickerRow = {
  readonly id: string;
  readonly name: string;
  readonly durationMinutes: number;
  readonly complexity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
};

export type ExerciseLibraryPayload = {
  readonly favorites: readonly ExerciseLibraryListItem[];
  readonly rest: readonly ExerciseLibraryListItem[];
};

/** Claves de orden soportadas en la biblioteca (cliente y API). */
export type ExerciseLibrarySortKey =
  | "updated_desc"
  | "updated_asc"
  | "name_asc"
  | "name_desc"
  | "duration_asc"
  | "duration_desc"
  | "complexity_asc"
  | "complexity_desc"
  | "strategy_asc"
  | "strategy_desc"
  | "tactical_asc"
  | "tactical_desc"
  | "dynamic_asc"
  | "dynamic_desc"
  | "coordinative_asc"
  | "coordinative_desc"
  | "game_situation_asc"
  | "game_situation_desc"
  | "coordination_asc"
  | "coordination_desc";
