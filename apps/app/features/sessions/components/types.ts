export type { ExercisePickerRow as ExerciseLibraryItem } from "@/features/exercises/types";

export type SessionBuilderItem = {
  uid: string;
  exerciseId: string;
  name: string;
  durationMinutes: number;
  durationOverride: number | null;
  notes: string;
};
