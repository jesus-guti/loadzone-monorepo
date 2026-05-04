"use client";

import { StarIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/ui/button";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleExerciseFavorite } from "../actions/exercise-actions";
import { exerciseLibraryQueryKey } from "./exercise-library-keys";

type ExerciseLibraryFavoriteButtonProps = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly isFavorite: boolean;
};

export function ExerciseLibraryFavoriteButton({
  exerciseId,
  exerciseName,
  isFavorite,
}: ExerciseLibraryFavoriteButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleExerciseFavorite(exerciseId),
    onSuccess: async (result) => {
      if (result.ok === false) {
        toast.error(result.error);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: exerciseLibraryQueryKey,
      });
    },
    onError: () => {
      toast.error("No se pudo actualizar el favorito. Vuelve a intentarlo.");
    },
  });

  const label = isFavorite
    ? `Quitar de favoritos: ${exerciseName}`
    : `Marcar como favorito: ${exerciseName}`;

  return (
    <Button
      aria-label={label}
      aria-pressed={isFavorite}
      disabled={mutation.isPending}
      onClick={() => {
        mutation.mutate();
      }}
      size="icon"
      type="button"
      variant="ghost"
    >
      <StarIcon
        className="size-4 text-text-secondary"
        weight={isFavorite ? "fill" : "regular"}
      />
    </Button>
  );
}
