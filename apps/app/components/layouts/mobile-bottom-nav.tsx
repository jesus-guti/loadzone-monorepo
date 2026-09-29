"use client";

import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { operationalNavigation } from "@/lib/admin-navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 bg-bg-tertiary/50 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {operationalNavigation.map((item) => {
          const isActive = !item.disabled && Boolean(item.match(pathname));
          const content = (
            <>
              <item.icon
                className={cn(
                  "size-4",
                  isActive ? "text-brand" : "text-text-tertiary"
                )}
                weight="fill"
              />
              {item.label}
              {item.badge ? (
                <span className="font-medium text-[9px] uppercase tracking-wide">
                  {item.badge}
                </span>
              ) : null}
            </>
          );

          return (
            <li key={item.href}>
              {item.disabled ? (
                <span
                  aria-disabled="true"
                  className="flex flex-col items-center justify-center gap-1 px-1 py-3 font-medium text-[11px] text-text-tertiary"
                >
                  {content}
                </span>
              ) : (
                <Link
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-1 py-3 font-medium text-[11px] text-text-secondary transition-colors",
                    isActive ? "text-text-primary" : false
                  )}
                  href={item.href}
                  prefetch
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
