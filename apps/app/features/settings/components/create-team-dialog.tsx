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
import { createTeamFromSettings } from "../actions/team-settings";

type CreateTeamDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultTimezone: string;
};

export function CreateTeamDialog({
  open,
  onOpenChange,
  defaultTimezone,
}: CreateTeamDialogProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear equipo</DialogTitle>
          <DialogDescription>
            El nuevo equipo se activará automáticamente en el shell.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createTeamFromSettings(formData);
            });
          }}
          className="space-y-4 p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="create-team-name">Nombre</Label>
            <Input
              id="create-team-name"
              name="name"
              placeholder="Ej: Juvenil A"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-team-category">Categoría</Label>
            <Input
              id="create-team-category"
              name="category"
              placeholder="Ej: Juvenil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-team-timezone">Zona horaria</Label>
            <Input
              defaultValue={defaultTimezone}
              id="create-team-timezone"
              name="timezone"
              required
            />
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
              {isPending ? "Creando..." : "Crear y activar equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
