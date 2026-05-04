"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { PrinterIcon } from "@phosphor-icons/react/ssr";

export function PrintButton() {
  return (
    <Button
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      <PrinterIcon className="mr-1 size-4" />
      Imprimir
    </Button>
  );
}
