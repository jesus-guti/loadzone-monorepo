import type { ReactNode } from "react";

type SettingsContentProps = {
  readonly children: ReactNode;
};

/**
 * Content column geometry: centered max-w-[640px] column. Horizontal
 * padding lives on the outer wrapper so the column keeps its full width
 * when centered. Do not put w-full on the same node as horizontal
 * margins — width:100% + mx-* overflows the overflow-x-hidden inset.
 */
export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <div className="mb-16 px-10 pt-2">
      <div className="mx-auto min-w-0 max-w-[640px]">{children}</div>
    </div>
  );
}
