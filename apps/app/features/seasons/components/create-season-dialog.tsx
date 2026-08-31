"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { ConfigureSeasonForm } from "./configure-season-form";

type CreateSeasonDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export function CreateSeasonDialog({
  open,
  onOpenChange,
}: CreateSeasonDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar temporada</DialogTitle>
          <DialogDescription>
            Elige el año de inicio. Las fechas se calculan solas; puedes ajustar
            pretemporada y cierre por semanas.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {open ? (
            <ConfigureSeasonForm
              onCancel={() => onOpenChange(false)}
              variant="dialog"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
