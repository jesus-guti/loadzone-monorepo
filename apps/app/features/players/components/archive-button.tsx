"use client";

import { ArchiveIcon } from "@phosphor-icons/react/ssr";
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
import { archivePlayer } from "../actions/player-actions";

type ArchiveButtonProperties = {
  readonly playerId: string;
  readonly playerName: string;
};

export function ArchiveButton({
  playerId,
  playerName,
}: ArchiveButtonProperties) {
  async function handleArchive() {
    try {
      await archivePlayer(playerId);
      toast.success(`${playerName} archivado correctamente.`);
    } catch {
      toast.error("Error al archivar jugador.");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <ArchiveIcon className="size-4 text-text-secondary" />
          <span className="sr-only">Archivar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archivar jugador</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres archivar a{" "}
            <strong>{playerName}</strong>? El jugador no podrá acceder a su
            formulario y sus datos se conservarán pero no aparecerán en el
            dashboard.
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
  );
}
