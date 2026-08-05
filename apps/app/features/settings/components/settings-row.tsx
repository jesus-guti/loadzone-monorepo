import type { ReactNode } from "react";

type SettingsRowProperties = {
  readonly label: string;
  readonly htmlFor?: string;
  readonly description?: string;
  readonly children: ReactNode;
};

/** Linear-style row: label + control, separated by a hairline (JES-59). */
export function SettingsRow({
  label,
  htmlFor,
  description,
  children,
}: SettingsRowProperties) {
  return (
    <div className="flex min-h-12 flex-col gap-2 border-border-secondary border-t py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 shrink-0">
        <label
          className="block font-medium text-sm text-text-primary"
          htmlFor={htmlFor}
        >
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 sm:max-w-[18rem]">{children}</div>
    </div>
  );
}
