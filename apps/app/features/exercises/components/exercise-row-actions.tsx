"use client";

import {
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design-system/components/ui/alert-dialog";
import { toast } from "@repo/design-system/components/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  archiveExercise,
  duplicateExercise,
  toggleExerciseVisibility,
} from "../actions/exercise-actions";

type ExerciseRowActionsProps = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly canDelete: boolean;
  readonly isPrivate: boolean;
  readonly canToggleVisibility: boolean;
  /** Tras una mutación correcta (p. ej. invalidar React Query en la biblioteca). */
  readonly onAfterMutation?: () => void;
};

export function ExerciseRowActions({
  exerciseId,
  exerciseName,
  canDelete,
  isPrivate,
  canToggleVisibility,
  onAfterMutation,
}: ExerciseRowActionsProps) {
  const router = useRouter();
  const [isDuplicating, startDuplicate] = useTransition();
  const [isArchiving, startArchive] = useTransition();
  const [isTogglingVisibility, startToggleVisibility] = useTransition();

  function handleToggleVisibility(): void {
    startToggleVisibility(async () => {
      const result = await toggleExerciseVisibility(exerciseId);
      if (result.ok) {
        toast.success(`Visibilidad cambiada a ${isPrivate ? "Compartido" : "Privado"}.`);
        onAfterMutation?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDuplicate(): void {
    startDuplicate(async () => {
      const result = await duplicateExercise(exerciseId);
      if (result.ok) {
        toast.success("Ejercicio duplicado.");
        onAfterMutation?.();
        router.push(`/exercises/${result.exerciseId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleArchive(): void {
    startArchive(async () => {
      try {
        await archiveExercise(exerciseId);
        toast.success(`${exerciseName} archivado.`);
        onAfterMutation?.();
        router.refresh();
      } catch {
        toast.error("No se pudo archivar el ejercicio.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button asChild size="icon" variant="ghost">
        <Link
          aria-label={`Editar ${exerciseName}`}
          href={`/exercises/${exerciseId}`}
        >
          <NotePencilIcon className="size-4 text-text-secondary" />
        </Link>
      </Button>
      <Button
        aria-label={`Duplicar ${exerciseName}`}
        disabled={isDuplicating}
        onClick={handleDuplicate}
        size="icon"
        type="button"
        variant="ghost"
      >
        <CopyIcon className="size-4 text-text-secondary" />
      </Button>
      {canToggleVisibility ? (
        <Button
          aria-label={`Cambiar visibilidad de ${exerciseName}`}
          disabled={isTogglingVisibility}
          onClick={handleToggleVisibility}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isPrivate ? (
            <EyeSlashIcon className="size-4 text-text-secondary" />
          ) : (
            <EyeIcon className="size-4 text-text-secondary" />
          )}
        </Button>
      ) : null}
      {canDelete ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-label={`Archivar ${exerciseName}`}
              disabled={isArchiving}
              size="icon"
              type="button"
              variant="ghost"
            >
              <TrashIcon className="size-4 text-text-secondary" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archivar ejercicio</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Archivar <strong>{exerciseName}</strong>? Dejará de aparecer en
                la biblioteca; las sesiones que ya lo usan conservan el
                historial.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>
                Archivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
