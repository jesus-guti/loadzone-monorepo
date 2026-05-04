"use client";

import { ListIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/ui/button";
import { useSidebar } from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";

export function MobileSidebarFab() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      aria-label="Abrir menú lateral"
      className={cn(
        "fixed z-40 touch-manipulation md:hidden",
        "bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-4",
        "size-11 rounded-full border border-border-primary bg-bg-primary/95 shadow-md backdrop-blur"
      )}
      onClick={() => {
        toggleSidebar();
      }}
      size="icon"
      type="button"
      variant="ghost"
    >
      <ListIcon className="size-5 text-text-secondary" />
    </Button>
  );
}
