"use client";

import {
  DocumentDuplicateIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
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
} from "../actions/exercise-actions";

type ExerciseRowActionsProps = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly canDelete: boolean;
};

export function ExerciseRowActions({
  exerciseId,
  exerciseName,
  canDelete,
}: ExerciseRowActionsProps) {
  const router = useRouter();
  const [isDuplicating, startDuplicate] = useTransition();
  const [isArchiving, startArchive] = useTransition();

  function handleDuplicate(): void {
    startDuplicate(async () => {
      const result = await duplicateExercise(exerciseId);
      if (result.ok) {
        toast.success("Ejercicio duplicado.");
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
          <PencilSquareIcon className="size-4 text-text-secondary" />
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
        <DocumentDuplicateIcon className="size-4 text-text-secondary" />
      </Button>
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
