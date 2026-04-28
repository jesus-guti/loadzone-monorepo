"use client";

import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/lib/admin-navigation";
import { AskLoadzoneButton } from "./ask-loadzone-button";

export function MobileBottomNav() {
  const pathname = usePathname();
  const leadingItems = primaryNavigation.slice(0, 2);
  const trailingItems = primaryNavigation.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border-secondary bg-bg-primary/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {leadingItems.map((item) => {
          const isActive = item.match(pathname);

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] font-medium text-text-secondary transition-colors",
                  isActive && "text-text-primary"
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
        <li className="flex items-start justify-center">
          <div className="relative -translate-y-5">
            <AskLoadzoneButton variant="fab" />
          </div>
        </li>
        {trailingItems.map((item) => {
          const isActive = item.match(pathname);

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] font-medium text-text-secondary transition-colors",
                  isActive && "text-text-primary"
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
