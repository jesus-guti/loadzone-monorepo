"use client";

import { CaretDownIcon, FireIcon } from "@phosphor-icons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import { Badge } from "@repo/design-system/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/design-system/components/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PlayerInjuriesPanel } from "@/features/injuries/components/player-injuries-panel";
import type { InjuryListItem } from "@/features/injuries/types";
import { ExcusedAbsenceForm } from "./excused-absence-form";
import { PlayerCharts } from "./player-charts";
import { getRiskLabel, PlayerHistoryTable } from "./player-history-table";

type ChartEntry = React.ComponentProps<typeof PlayerCharts>["entries"][number];
type ChartStat = React.ComponentProps<typeof PlayerCharts>["stats"][number];
type HistoryRow = React.ComponentProps<
  typeof PlayerHistoryTable
>["rows"][number];

const PLAYER_DETAIL_TABS = ["wellness", "lesiones"] as const;
type PlayerDetailTab = (typeof PLAYER_DETAIL_TABS)[number];

function isPlayerDetailTab(value: string | null): value is PlayerDetailTab {
  return (
    value !== null &&
    (PLAYER_DETAIL_TABS as readonly string[]).includes(value)
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type PlayerDetailShellProperties = {
  readonly playerId: string;
  readonly playerName: string;
  readonly playerImageUrl: string | null;
  readonly statusLabel: string;
  readonly displayStreak: number;
  readonly longestStreak: number;
  readonly preDoneToday: boolean;
  readonly postDoneToday: boolean;
  readonly physioAlertToday: boolean;
  readonly todayCivil: string;
  readonly openInjuries: readonly InjuryListItem[];
  readonly closedInjuries: readonly InjuryListItem[];
  readonly allInjuries: readonly InjuryListItem[];
  readonly excusedDates: readonly string[];
  readonly entryCount: number;
  readonly lastRpe: number | null;
  readonly lastAcwr: number | null;
  readonly chartEntries: readonly ChartEntry[];
  readonly chartStats: readonly ChartStat[];
  readonly historyRows: readonly HistoryRow[];
};

export function PlayerDetailShell(
  properties: PlayerDetailShellProperties
): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();

  const rawTab = searchParameters.get("tab");
  const tab: PlayerDetailTab = isPlayerDetailTab(rawTab) ? rawTab : "wellness";

  const setTab = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParameters.toString());
      next.set("tab", value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParameters]
  );

  const latestRiskLevel = properties.historyRows.at(0)?.riskLevel ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-0 pb-24 md:pb-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-border-secondary border-b bg-bg-primary py-3">
        <Avatar className="size-12 rounded-2xl border border-border-secondary">
          {properties.playerImageUrl ? (
            <AvatarImage
              alt={properties.playerName}
              className="object-cover"
              src={properties.playerImageUrl}
            />
          ) : null}
          <AvatarFallback className="rounded-2xl bg-bg-secondary font-semibold text-sm text-text-primary">
            {getInitials(properties.playerName)}
          </AvatarFallback>
        </Avatar>

        <Badge>{properties.statusLabel}</Badge>
        {properties.physioAlertToday ? (
          <Badge variant="destructive">Alerta de fisio hoy</Badge>
        ) : null}

        <span className="text-sm text-text-secondary">
          Hoy: pre {properties.preDoneToday ? "enviado" : "pendiente"} · post{" "}
          {properties.postDoneToday ? "enviado" : "pendiente"}
        </span>

        <span className="flex items-center gap-1 text-sm text-text-secondary">
          <FireIcon className="size-3 text-premium" />
          Racha {properties.displayStreak} días (máx. {properties.longestStreak}
          )
        </span>
      </div>

      <Tabs onValueChange={setTab} value={tab}>
        <TabsList variant="line">
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="lesiones">Lesiones</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-10 pt-6" value="wellness">
          <dl className="grid gap-6 border-border-secondary border-b pb-8 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Riesgo actual", getRiskLabel(latestRiskLevel)],
              ["Último RPE", properties.lastRpe?.toString() ?? "—"],
              ["Último ACWR", properties.lastAcwr?.toFixed(2) ?? "—"],
              ["Registros totales", String(properties.entryCount)],
            ].map(([label, value]) => (
              <div className="space-y-1" key={label}>
                <dt className="font-medium text-text-secondary text-xs uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="font-semibold text-2xl text-text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <PlayerCharts
            entries={[...properties.chartEntries]}
            stats={[...properties.chartStats]}
          />

          <PlayerHistoryTable rows={[...properties.historyRows]} />

          <Collapsible className="border-border-secondary border-t pt-6">
            <CollapsibleTrigger className="group flex items-center gap-2 font-medium text-text-secondary text-xs uppercase tracking-wide hover:text-text-primary focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">
              Ausencia justificada
              <CaretDownIcon
                aria-hidden
                className="size-3 transition-transform duration-200 group-data-[panel-open]:rotate-180 motion-reduce:transition-none"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <ExcusedAbsenceForm
                excusedDates={[...properties.excusedDates]}
                playerId={properties.playerId}
              />
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent className="space-y-6 pt-4" value="lesiones">
          <PlayerInjuriesPanel
            allInjuries={properties.allInjuries}
            closedInjuries={properties.closedInjuries}
            openInjuries={properties.openInjuries}
            playerId={properties.playerId}
            todayCivil={properties.todayCivil}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
