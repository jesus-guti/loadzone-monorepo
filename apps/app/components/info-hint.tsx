"use client";

import { InfoIcon } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/tooltip";

type InfoHintProperties = {
  readonly label: string;
  readonly children: React.ReactNode;
};

/**
 * Progressive disclosure for optional explanatory copy: sits next to a title
 * so the page stays scannable and the detail only appears on demand.
 */
export function InfoHint({
  label,
  children,
}: InfoHintProperties): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-text-tertiary transition-colors hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        type="button"
      >
        <InfoIcon aria-hidden className="size-3.5" weight="regular" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left leading-snug">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
