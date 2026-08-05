import type { ReactNode } from "react";

type SettingsContentProps = {
  readonly children: ReactNode;
};

/**
 * Content column geometry (JES-57 layout law):
 * mobile max-w-[640px] + mx-10 + mb-16; tablet+ no max-w, same margins.
 */
export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <div className="mx-10 mb-16 w-full max-w-[640px] md:max-w-none">
      {children}
    </div>
  );
}
