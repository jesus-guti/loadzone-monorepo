"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rememberOperationalPath } from "@/lib/settings-volver";

/** Writes Volver memory on every operational navigation (JES-61). */
export function OperationalRouteMemory() {
  const pathname = usePathname();

  useEffect(() => {
    rememberOperationalPath(pathname);
  }, [pathname]);

  return null;
}
