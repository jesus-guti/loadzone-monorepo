export type ExerciseLibraryItem = {
  id: string;
  name: string;
  durationMinutes: number;
  complexity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
};

export type SessionBuilderItem = {
  uid: string;
  exerciseId: string;
  name: string;
  durationMinutes: number;
  durationOverride: number | null;
  notes: string;
};
