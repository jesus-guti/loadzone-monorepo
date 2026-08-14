"use client";

import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import type { ReactElement } from "react";
import { usePrimerosPasosChrome } from "@/features/primeros-pasos";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type PrimerosPasosReopenSectionProperties = {
  readonly userId: string;
  readonly clubId: string;
};

/**
 * Club settings control to restore Primeros pasos after dismiss / auto-hide.
 * Shown only when User×Club chrome is `dismissed`; restore writes `expanded`.
 */
export function PrimerosPasosReopenSection({
  userId,
  clubId,
}: PrimerosPasosReopenSectionProperties): ReactElement | null {
  const { chrome, setChrome, hydrated } = usePrimerosPasosChrome(userId, clubId);

  if (!hydrated || chrome !== "dismissed") {
    return null;
  }

  const handleRestore = (): void => {
    setChrome("expanded");
    toast.success("Primeros pasos visible de nuevo.");
  };

  return (
    <SettingsSection
      description="Guía de configuración recomendada. Puedes volver a mostrarla en el panel lateral."
      id="primeros-pasos"
      title="Primeros pasos"
    >
      <SettingsRow label="Panel lateral">
        <div className="flex justify-end">
          <Button onClick={handleRestore} size="sm" type="button" variant="outline">
            Mostrar Primeros pasos
          </Button>
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}
