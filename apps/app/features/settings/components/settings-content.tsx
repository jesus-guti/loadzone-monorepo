import type { ReactNode } from "react";

type SettingsContentProperties = {
  readonly children: ReactNode;
};

/**
 * Content column geometry (JES-56 layout law):
 * max-w-[640px] + mx-10 + mb-16 on mobile, unconstrained from `md:` up since
 * the settings sidebar already bounds the reading width. Do not use w-full
 * with mx-* — width:100% + horizontal margins overflows the
 * overflow-x-hidden inset and visually drops the max-w / margin constraints.
 */
export function SettingsContent({ children }: SettingsContentProperties) {
  return (
    <div className="mx-10 mb-16 min-w-0 max-w-[640px] pt-2 md:max-w-none">
      {children}
    </div>
  );
}
