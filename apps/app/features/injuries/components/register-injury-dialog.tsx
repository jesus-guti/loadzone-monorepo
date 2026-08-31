"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import type { JSX } from "react";
import { InjuryLogForm } from "./injury-log-form";

export type RegisterInjuryDialogTarget = {
  readonly playerId: string;
  readonly playerName: string;
  readonly painAlertId?: string;
  readonly prefillCause?: string;
  readonly prefillStartDate?: string;
  readonly prefillRegionDetail?: string;
};

type RegisterInjuryDialogProperties = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly todayCivil: string;
  readonly target: RegisterInjuryDialogTarget | null;
};

export function RegisterInjuryDialog({
  open,
  onOpenChange,
  todayCivil,
  target,
}: RegisterInjuryDialogProperties): JSX.Element | null {
  if (!target) {
    return null;
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto bg-bg-primary p-4 text-text-primary sm:max-w-4xl"
        showCloseButton
      >
        <DialogHeader className="p-0">
          <DialogTitle>Registrar lesión</DialogTitle>
          <DialogDescription className="text-text-secondary">
            {target.playerName}
          </DialogDescription>
        </DialogHeader>
        <InjuryLogForm
          key={`${target.playerId}-${target.painAlertId ?? "new"}`}
          layout="dialog"
          mode="create"
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
          painAlertId={target.painAlertId ?? null}
          playerId={target.playerId}
          prefillCause={target.prefillCause}
          prefillRegionDetail={target.prefillRegionDetail}
          prefillStartDate={target.prefillStartDate}
          todayCivil={todayCivil}
        />
      </DialogContent>
    </Dialog>
  );
}
