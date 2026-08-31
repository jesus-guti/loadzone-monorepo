"use client";

import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import { useTransition } from "react";
import {
  dismissPainAlert,
  restorePainAlert,
} from "../actions/injury-actions";

type DismissPainAlertButtonProperties = {
  readonly painAlertId: string;
};

export function DismissPainAlertButton({
  painAlertId,
}: DismissPainAlertButtonProperties): React.JSX.Element {
  const [pending, startTransition] = useTransition();

  const handleDismiss = (): void => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("painAlertId", painAlertId);
      const result = await dismissPainAlert({ success: false }, formData);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo descartar el aviso.");
        return;
      }
      toast.success("Aviso descartado", {
        action: {
          label: "Deshacer",
          onClick: () => {
            const restoreData = new FormData();
            restoreData.set("painAlertId", painAlertId);
            void restorePainAlert({ success: false }, restoreData).then(
              (restoreResult) => {
                if (!restoreResult.success) {
                  toast.error(
                    restoreResult.error ?? "No se pudo deshacer."
                  );
                }
              }
            );
          },
        },
      });
    });
  };

  return (
    <Button
      disabled={pending}
      onClick={handleDismiss}
      size="sm"
      type="button"
      variant="ghost"
    >
      {pending ? "Descartando…" : "Descartar"}
    </Button>
  );
}
