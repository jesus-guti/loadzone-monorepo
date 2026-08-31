"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

const CLUB_SETTINGS_TABS = ["club", "usuarios"] as const;
export type ClubSettingsTab = (typeof CLUB_SETTINGS_TABS)[number];

function isClubSettingsTab(value: string | null): value is ClubSettingsTab {
  return (
    value !== null && (CLUB_SETTINGS_TABS as readonly string[]).includes(value)
  );
}

type ClubSettingsTabsProperties = {
  readonly clubPanel: ReactNode;
  readonly usersPanel: ReactNode;
};

export function ClubSettingsTabs({
  clubPanel,
  usersPanel,
}: ClubSettingsTabsProperties) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const rawTab = searchParameters.get("tab");
  const tab: ClubSettingsTab = isClubSettingsTab(rawTab) ? rawTab : "club";

  const setTab = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParameters.toString());
      next.set("tab", value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParameters]
  );

  return (
    <Tabs className="gap-0" onValueChange={setTab} value={tab}>
      <TabsList
        aria-label="Secciones de configuración del club"
        className="mb-4"
        variant="line"
      >
        <TabsTrigger value="club">Club</TabsTrigger>
        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
      </TabsList>
      <TabsContent className="pt-2" value="club">
        {clubPanel}
      </TabsContent>
      <TabsContent className="pt-2" value="usuarios">
        {usersPanel}
      </TabsContent>
    </Tabs>
  );
}
