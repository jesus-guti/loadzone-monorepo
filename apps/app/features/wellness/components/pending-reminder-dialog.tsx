"use client";

import { BellRingingIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/dialog";
import { toast } from "@repo/design-system/components/sonner";
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

        if (result.blockedReason === "quiet_hours") {
          toast.message(
            result.blockedMessage ??
              "No se pueden enviar recordatorios durante la noche (22:00–08:00). Prueba más tarde."
          );
          return;
        }

        if (result.targetedPlayers === 0) {
          toast.success("No quedan jugadores pendientes.");
          setIsOpen(false);
          return;
        }

        if (result.sentNotifications > 0) {
          toast.success(
            `Recordatorio enviado a ${result.sentNotifications} pendientes (máx. 1 por ventana).`
          );
        } else if (result.skippedAlreadyNudged > 0) {
          toast.message(
            "Ya se envió el re-aviso de staff para estas ventanas. No se puede repetir."
          );
        } else {
          toast.message(
            "Hay jugadores pendientes, pero no hay suscripciones push activas o el consentimiento no permite avisarles ahora."
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
      <DialogTrigger
        render={
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
            <BellRingingIcon className="size-5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Re-notificar pendientes</DialogTitle>
          <DialogDescription>
            Se enviará un recordatorio push invitacional a quienes siguen sin
            completar el wellness. Empujón puntual: como máximo un re-aviso de
            staff por ventana (pre o post).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1 border-l-2 border-danger py-2 pl-4">
            <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <BellRingingIcon className="size-4 text-danger" />
              Pendientes actuales
            </p>
            <p className="text-sm text-text-secondary">
              {pendingCount} jugadores siguen sin rellenarlo.
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            No disponible entre las 22:00 y las 08:00 (horario de la sesión). No
            uses este aviso como secuencia agresiva ni como alerta de cuidado.
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
