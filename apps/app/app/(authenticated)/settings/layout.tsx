import type { ReactNode } from "react";
import { SettingsLayoutClient } from "./settings-layout-client";

type SettingsLayoutProps = {
  readonly children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <SettingsLayoutClient>{children}</SettingsLayoutClient>;
}
