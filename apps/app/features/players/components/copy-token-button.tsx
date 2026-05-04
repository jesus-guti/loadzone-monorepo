"use client";

import { CheckIcon, ClipboardTextIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/ui/button";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useState } from "react";
import { UI_FEEDBACK_TIMEOUT_MS } from "@/lib/durations";

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
      setTimeout(() => setCopied(false), UI_FEEDBACK_TIMEOUT_MS);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <CheckIcon className="size-4 text-brand" />
      ) : (
        <ClipboardTextIcon className="size-4" />
      )}
      <span className="sr-only">Copiar enlace</span>
    </Button>
  );
}
