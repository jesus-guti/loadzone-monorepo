import type { ReactNode } from "react";

type SettingsContentProps = {
  readonly children: ReactNode;
};

/** Page-column geometry per JES-56 layout law. */
export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <div className="mx-10 mb-16 min-w-0 max-w-[640px] pt-2 md:max-w-none">
      {children}
    </div>
  );
}
