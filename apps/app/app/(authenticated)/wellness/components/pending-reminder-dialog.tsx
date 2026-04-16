"use client";

import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
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
          className="size-10 rounded-full"
          disabled={pendingCount === 0}
          size="icon"
          variant="ghost"
        >
          <ArrowRightIcon className="size-5" />
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
          <div className="rounded-lg border border-border-secondary bg-bg-secondary px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-danger/10 p-2 text-danger">
                <BellAlertIcon className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">
                  Pendientes actuales
                </p>
                <p className="text-sm text-text-secondary">
                  {pendingCount} jugadores siguen sin rellenarlo.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border-secondary bg-bg-primary px-4 py-4">
            <p className="text-sm text-text-secondary">
              Recomendación: enviar solo cuando el bloque de pendientes siga alto
              y evitar más de 1 o 2 recordatorios extra por tramo del día.
            </p>
          </div>
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
