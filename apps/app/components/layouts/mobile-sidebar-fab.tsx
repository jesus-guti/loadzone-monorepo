"use client";

import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";

export function MobileSidebarFab() {
  return (
    <SidebarTrigger
      aria-label="Abrir menú lateral"
      className={cn(
        "fixed z-40 touch-manipulation md:hidden",
        "bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-4",
        "size-11 rounded-full border border-border-primary bg-bg-primary/95 shadow-md backdrop-blur"
      )}
    />
  );
}
