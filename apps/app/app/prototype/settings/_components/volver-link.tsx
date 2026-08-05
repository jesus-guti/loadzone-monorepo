"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/design-system/components/sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_VOLVER_MEMORY,
  VOLVER_STORAGE_KEY,
  type VolverMemory,
} from "./nav-config";

function readVolverMemory(): VolverMemory {
  if (typeof window === "undefined") {
    return DEFAULT_VOLVER_MEMORY;
  }

  try {
    const raw = sessionStorage.getItem(VOLVER_STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(
        VOLVER_STORAGE_KEY,
        JSON.stringify(DEFAULT_VOLVER_MEMORY)
      );
      return DEFAULT_VOLVER_MEMORY;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "href" in parsed &&
      "label" in parsed &&
      typeof (parsed as VolverMemory).href === "string" &&
      typeof (parsed as VolverMemory).label === "string"
    ) {
      return parsed as VolverMemory;
    }
  } catch {
    // Fall through to default seed.
  }

  sessionStorage.setItem(
    VOLVER_STORAGE_KEY,
    JSON.stringify(DEFAULT_VOLVER_MEMORY)
  );
  return DEFAULT_VOLVER_MEMORY;
}

export function VolverLink() {
  const [memory, setMemory] = useState<VolverMemory>(DEFAULT_VOLVER_MEMORY);

  useEffect(() => {
    setMemory(readVolverMemory());
  }, []);

  const label = `Volver a ${memory.label}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="[&_svg]:size-5"
          render={
            <Link href={memory.href} prefetch>
              <ArrowLeftIcon className="size-5 shrink-0" weight="fill" />
              <span>{label}</span>
            </Link>
          }
          tooltip={label}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
