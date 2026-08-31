"use client";

import { cn } from "@repo/design-system/lib/utils";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { MOBILE_SHELL_FAB_BOTTOM_CLASS } from "./mobile-shell-chrome";

export function MobileSeasonFab() {
  return (
    <div
      className={cn(
        "fixed z-40 touch-manipulation md:hidden",
        MOBILE_SHELL_FAB_BOTTOM_CLASS,
        "right-4"
      )}
    >
      <ActiveSeasonSwitcher variant="fab" />
    </div>
  );
}
