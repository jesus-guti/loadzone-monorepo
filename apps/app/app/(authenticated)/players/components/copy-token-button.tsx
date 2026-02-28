"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { toast } from "@repo/design-system/components/ui/sonner";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

type CopyTokenButtonProperties = {
  readonly token: string;
};

export function CopyTokenButton({ token }: CopyTokenButtonProperties) {
  const [copied, setCopied] = useState(false);

  const playerUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace("app.", "player.")}/${token}`
      : `/${token}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(playerUrl);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      <span className="sr-only">Copiar enlace</span>
    </Button>
  );
}
