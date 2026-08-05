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
  readVolverMemory,
  type VolverMemory,
} from "@/lib/settings-volver";

export function SettingsVolverLink() {
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
