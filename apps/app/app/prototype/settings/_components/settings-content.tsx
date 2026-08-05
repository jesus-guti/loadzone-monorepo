import type { ReactNode } from "react";

type SettingsContentProps = {
  readonly children: ReactNode;
};

/**
 * Content column geometry (JES-57 layout law):
 * max-w-[640px] + mx-10 + mb-16 at all breakpoints.
 * Do not use w-full with mx-* — width:100% + horizontal margins overflows the
 * overflow-x-hidden inset and visually drops the max-w / margin constraints.
 */
export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <div className="mx-10 mb-16 min-w-0 max-w-[640px] pt-2">
      {children}
    </div>
  );
}
