"use client";

import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { useTransition } from "react";
import { DatePicker } from "@/components/date-picker";
import { createSeasonFromShell } from "../actions/season-actions";

type CreateSeasonDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export function CreateSeasonDialog({
  open,
  onOpenChange,
}: CreateSeasonDialogProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear temporada</DialogTitle>
          <DialogDescription>
            La nueva temporada se activará automáticamente en el shell.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createSeasonFromShell(formData);
            });
          }}
          className="space-y-4 p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="create-season-name">Nombre</Label>
            <Input
              autoFocus
              id="create-season-name"
              name="name"
              placeholder="Ej: 2025/2026"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-season-start">Fecha de inicio</Label>
            <DatePicker
              id="create-season-start"
              name="startDate"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-season-end">Fecha de fin</Label>
            <DatePicker id="create-season-end" name="endDate" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-season-pre">
              Fin de pre-temporada (opcional)
            </Label>
            <DatePicker id="create-season-pre" name="preSeasonEnd" />
          </div>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creando..." : "Crear y activar temporada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
