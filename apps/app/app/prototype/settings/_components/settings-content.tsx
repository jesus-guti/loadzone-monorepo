import type { ReactNode } from "react";

type SettingsContentProps = {
  readonly children: ReactNode;
};

/**
 * Content column geometry (JES-57 layout law):
 * mobile max-w-[640px] + mx-10 + mb-16; tablet+ no max-w, same margins.
 * Do not use w-full with mx-* — width:100% + horizontal margins overflows the
 * overflow-x-hidden inset and visually drops the max-w / margin constraints.
 */
export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <div className="mx-10 mb-16 min-w-0 max-w-[640px] pt-2 md:max-w-none">
      {children}
    </div>
  );
}
