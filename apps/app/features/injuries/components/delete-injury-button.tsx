"use client";

import { Button } from "@repo/design-system/components/button";
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
} from "@repo/design-system/components/alert-dialog";
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect } from "react";
import {
  deleteInjury,
  type InjuryActionResult,
} from "../actions/injury-actions";
import type { InjuryListItem } from "../types";

type DeleteInjuryButtonProperties = {
  readonly injury: InjuryListItem;
};

const emptyResult: InjuryActionResult = { success: false };

export function DeleteInjuryButton({
  injury,
}: DeleteInjuryButtonProperties): React.JSX.Element {
  const [state, formAction, pending] = useActionState(
    deleteInjury,
    emptyResult
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Lesión eliminada");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const zones = injury.regionLabels.join(", ") || "Sin zona";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button disabled={pending} size="sm" type="button" variant="ghost">
            {pending ? "Eliminando…" : "Eliminar"}
          </Button>
        }
      />
      <AlertDialogContent className="bg-bg-primary text-text-primary">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar lesión</AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            Se quitará {zones} · {injury.startDate}
            {injury.endDate ? ` → ${injury.endDate}` : ""} · {injury.cause}.
            Esta acción no se puede deshacer. Si era la lesión abierta, el
            jugador dejará de aparecer como lesionado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={formAction}>
            <input name="injuryId" type="hidden" value={injury.id} />
            <AlertDialogAction
              disabled={pending}
              type="submit"
              variant="destructive"
            >
              {pending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
