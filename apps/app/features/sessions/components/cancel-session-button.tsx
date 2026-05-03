"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useTransition } from "react";
import { cancelSession } from "../actions/session-actions";

type CancelSessionButtonProps = {
  readonly sessionId: string;
};

export function CancelSessionButton({
  sessionId,
}: CancelSessionButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await cancelSession(sessionId);
        })
      }
      size="sm"
      type="button"
      variant="outline"
    >
      {isPending ? "Cancelando..." : "Cancelar sesión"}
    </Button>
  );
}
