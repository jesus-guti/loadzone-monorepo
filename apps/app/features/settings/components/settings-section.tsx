import type { ReactNode } from "react";

type SettingsSectionProperties = {
  readonly title: string;
  readonly description?: string;
  readonly id?: string;
  readonly children: ReactNode;
};

/** Linear-style section: label + optional helper copy, no card chrome (JES-59). */
export function SettingsSection({
  title,
  description,
  id,
  children,
}: SettingsSectionProperties) {
  return (
    <section className="scroll-mt-24 pt-8 first:pt-4" id={id}>
      <h2 className="font-medium text-text-secondary text-xs uppercase tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
