import { FireIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties, JSX } from "react";

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
      aria-hidden
      className={cn("relative block size-3.5 shrink-0", className)}
    >
      <FireIcon
        className="absolute inset-0 block h-full w-full"
        style={backStyle}
        weight="fill"
      />
      <FireIcon
        className="absolute left-[15%] bottom-[7%] block h-[70%] w-[70%]"
        style={frontStyle}
        weight="fill"
      />
    </span>
  );
}
