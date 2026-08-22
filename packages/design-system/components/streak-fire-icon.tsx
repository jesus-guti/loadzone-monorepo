import type { CSSProperties, JSX } from "react";
import { FireIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@repo/design-system/lib/utils";

type StreakFireIconProperties = {
  readonly className?: string;
  readonly backColor?: string;
  readonly frontColor?: string;
};

/**
 * Dual-tone flame: two filled FireIcons overlaid. Colors come from the caller.
 */
export function StreakFireIcon({
  className,
  backColor,
  frontColor,
}: StreakFireIconProperties): JSX.Element {
  const backStyle: CSSProperties | undefined = backColor
    ? { color: backColor }
    : undefined;
  const frontStyle: CSSProperties | undefined = frontColor
    ? { color: frontColor }
    : undefined;

  return (
    <span
      className={cn("relative block size-3.5 shrink-0", className)}
      aria-hidden
    >
      <FireIcon
        className="absolute inset-0 block h-full w-full"
        weight="fill"
        style={backStyle}
      />
      <FireIcon
        className="absolute left-[12%] top-[6%] block h-[78%] w-[78%]"
        weight="fill"
        style={frontStyle}
      />
    </span>
  );
}
