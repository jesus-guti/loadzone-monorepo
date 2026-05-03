"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { ShieldCheckIcon } from "@heroicons/react/20/solid";
import { cn } from "@repo/design-system/lib/utils";

type TeamBrandingProperties = {
  readonly clubName: string;
  readonly clubLogoUrl: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly compact?: boolean;
  readonly showClubOnly?: boolean;
};

function getInitials(value: string | null): string {
  if (!value) {
    return "LZ";
  }

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamBranding({
  clubName,
  clubLogoUrl,
  teamName,
  teamLogoUrl,
  compact = false,
  showClubOnly = false,
}: TeamBrandingProperties) {
  const primaryLabel = showClubOnly ? clubName : teamName ?? clubName;
  const secondaryLabel = showClubOnly ? null : teamName ? clubName : "Workspace operativo";
  const imageUrl = teamLogoUrl ?? clubLogoUrl;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={cn("size-9 rounded-xl border border-border-secondary", compact && "size-10")}>
        {imageUrl ? (
          <AvatarImage
            alt={primaryLabel}
            className="object-contain p-1"
            src={imageUrl}
          />
        ) : null}
        <AvatarFallback className="rounded-xl bg-brand/10 text-xs font-semibold text-text-primary">
          {imageUrl ? <ShieldCheckIcon className="size-4" /> : getInitials(primaryLabel)}
        </AvatarFallback>
      </Avatar>
      <div className={cn("min-w-0", compact && "hidden")}>
        <p className="truncate text-sm font-semibold text-text-primary">
          {primaryLabel}
        </p>
        {secondaryLabel ? (
          <p className="truncate text-xs uppercase tracking-[0.14em] text-text-secondary">
            {secondaryLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
