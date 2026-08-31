"use client";

import { ListIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import { useSidebar } from "@repo/design-system/components/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import { MOBILE_SHELL_FAB_BOTTOM_CLASS } from "./mobile-shell-chrome";

export function MobileSidebarFab() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      aria-label="Abrir menú lateral"
      className={cn(
        "fixed z-40 touch-manipulation md:hidden",
        MOBILE_SHELL_FAB_BOTTOM_CLASS,
        "left-4",
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
