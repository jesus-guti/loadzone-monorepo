import { SettingsContent } from "../_components/settings-content";

type StubPageProps = {
  readonly title: string;
};

export function SettingsStubPage({ title }: StubPageProps) {
  return (
    <SettingsContent>
      <p className="pt-2 text-sm text-text-secondary">
        {title}: sin contenido en este prototipo.
      </p>
    </SettingsContent>
  );
}
