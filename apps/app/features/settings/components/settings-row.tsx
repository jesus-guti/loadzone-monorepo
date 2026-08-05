import type { ReactNode } from "react";

type SettingsRowProps = {
  readonly label: string;
  readonly htmlFor?: string;
  readonly children: ReactNode;
};

export function SettingsRow({ label, htmlFor, children }: SettingsRowProps) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-border-secondary border-t py-3">
      {htmlFor ? (
        <label
          className="shrink-0 font-medium text-sm text-text-primary"
          htmlFor={htmlFor}
        >
          {label}
        </label>
      ) : (
        <span className="shrink-0 font-medium text-sm text-text-primary">
          {label}
        </span>
      )}
      <div className="min-w-0 max-w-[min(100%,16rem)] flex-1 sm:max-w-[18rem]">
        {children}
      </div>
    </div>
  );
}
