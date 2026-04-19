"use client";

import { BellAlertIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useState, useTransition } from "react";
import { remindPendingWellnessPlayers } from "../actions/remind-pending-players";

type PendingReminderDialogProperties = {
  readonly evaluatedDate: string;
  readonly pendingCount: number;
};

export function PendingReminderDialog({
  evaluatedDate,
  pendingCount,
}: PendingReminderDialogProperties) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleRemind = (): void => {
    startTransition(async () => {
      try {
        const result = await remindPendingWellnessPlayers(evaluatedDate);

        if (result.targetedPlayers === 0) {
          toast.success("No quedan jugadores pendientes.");
          setIsOpen(false);
          return;
        }

        if (result.sentNotifications > 0) {
          toast.success(
            `Recordatorio enviado a ${result.sentNotifications} jugadores pendientes.`
          );
        } else {
          toast.message(
            "Hay jugadores pendientes, pero no hay suscripciones push activas para avisarles ahora."
          );
        }

        setIsOpen(false);
      } catch {
        toast.error("No se pudo enviar el recordatorio.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Re-notificar jugadores pendientes"
          className={cn(
            "size-10 rounded-full",
            pendingCount > 0 ? "glass-surface text-text-primary" : null
          )}
          disabled={pendingCount === 0}
          size="icon"
          variant="ghost"
        >
          <BellAlertIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Re-notificar pendientes</DialogTitle>
          <DialogDescription>
            Se reenviará un recordatorio push a quienes siguen sin completar el
            wellness. Úsalo como empujón puntual, no como secuencia agresiva.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1 border-l-2 border-danger py-2 pl-4">
            <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <BellAlertIcon className="size-4 text-danger" />
              Pendientes actuales
            </p>
            <p className="text-sm text-text-secondary">
              {pendingCount} jugadores siguen sin rellenarlo.
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            Recomendación: enviar solo cuando el bloque de pendientes siga alto
            y evitar más de 1 o 2 recordatorios extra por tramo del día.
          </p>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending || pendingCount === 0}
            onClick={handleRemind}
            variant="outline"
          >
            Re-notificar ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
