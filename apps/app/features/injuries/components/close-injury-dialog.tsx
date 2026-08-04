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
import { toast } from "@repo/design-system/components/sonner";
import { useActionState, useEffect, useState } from "react";
import {
  closeInjury,
  type InjuryActionResult,
} from "../actions/injury-actions";
import type { InjuryListItem } from "../types";

type CloseInjuryDialogProperties = {
  readonly injury: InjuryListItem | null;
  readonly todayCivil: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

const emptyResult: InjuryActionResult = { success: false };

export function CloseInjuryDialog({
  injury,
  todayCivil,
  open,
  onOpenChange,
}: CloseInjuryDialogProperties) {
  const [endDate, setEndDate] = useState(todayCivil);
  const [state, formAction, pending] = useActionState(
    closeInjury,
    emptyResult
  );

  useEffect(() => {
    if (open) {
      setEndDate(todayCivil);
    }
  }, [open, todayCivil, injury?.id]);

  useEffect(() => {
    if (state.success) {
      toast.success("Lesión dada de alta");
      onOpenChange(false);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!injury) {
    return null;
  }

  const labels = injury.regionLabels.join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-primary text-text-primary sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Dar de alta</DialogTitle>
          <DialogDescription className="text-text-secondary">
            {labels} · inicio {injury.startDate} · {injury.cause}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="injuryId" value={injury.id} />
          <div className="space-y-1.5">
            <Label htmlFor="injury-end-date">
              Fecha de fin <span className="text-danger">*</span>
            </Label>
            <Input
              id="injury-end-date"
              name="endDate"
              type="date"
              required
              min={injury.startDate}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <DialogFooter className="border-border-secondary bg-bg-secondary">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Confirmando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
