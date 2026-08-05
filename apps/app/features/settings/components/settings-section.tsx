import type { ReactNode } from "react";

type SettingsSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly id?: string;
  readonly children: ReactNode;
};

export function SettingsSection({
  title,
  description,
  id,
  children,
}: SettingsSectionProps) {
  return (
    <section className="scroll-mt-28 pt-8 first:pt-4" id={id}>
      <h2 className="font-medium text-xs text-text-secondary uppercase tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
