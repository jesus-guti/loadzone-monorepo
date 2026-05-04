"use client";

import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/lib/admin-navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 bg-bg-tertiary/50 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {primaryNavigation.map((item) => {
          const isActive = Boolean(item.match(pathname));

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 font-medium text-[11px] text-text-secondary transition-colors",
                  isActive ? "text-text-primary" : false
                )}
                href={item.href}
                prefetch
              >
                <item.icon
                  className={cn(
                    "size-4",
                    isActive ? "text-brand" : "text-text-tertiary"
                  )}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
