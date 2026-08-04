import { database } from "@repo/database";
import {
  filterOpenPainAlerts,
  formatInjuryRegionLabels,
  partitionInjuriesByOpenClosed,
  sortClosedInjuriesNewestFirst,
  sortOpenInjuriesNewestFirst,
  sortPainAlertsNewestFirst,
  takeSectionCap,
  toCivilYmd,
  truncateText,
} from "../lib/team-injuries-list";
import type {
  TeamInjuriesListPayload,
  TeamInjuryListItem,
  TeamPainAlertListItem,
} from "../types";

type InjuryDbRow = {
  readonly id: string;
  readonly playerId: string;
  readonly cause: string;
  readonly regionDetail: string | null;
  readonly startDate: Date;
  readonly endDate: Date | null;
  readonly regions: readonly { readonly regionId: string }[];
  readonly player: { readonly name: string };
};

type PainAlertDbRow = {
  readonly id: string;
  readonly playerId: string;
  readonly title: string;
  readonly description: string | null;
  readonly bodyPart: string | null;
  readonly reportedAt: Date;
  readonly promotedInjuryId: string | null;
  readonly player: { readonly name: string };
};

function mapInjuryRow(row: InjuryDbRow): TeamInjuryListItem {
  return {
    id: row.id,
    playerId: row.playerId,
    playerName: row.player.name,
    startDate: toCivilYmd(row.startDate),
    endDate: row.endDate ? toCivilYmd(row.endDate) : null,
    cause: row.cause,
    regionLabels: formatInjuryRegionLabels(
      row.regions.map((region) => region.regionId),
      row.regionDetail
    ),
    regionDetail: row.regionDetail,
  };
}

function mapPainAlertRow(row: PainAlertDbRow): TeamPainAlertListItem {
  const summarySource =
    row.description?.trim() ||
    row.bodyPart?.trim() ||
    null;
  return {
    id: row.id,
    playerId: row.playerId,
    playerName: row.player.name,
    reportedAt: row.reportedAt.toISOString(),
    title: row.title,
    summary: summarySource ? truncateText(summarySource, 120) : null,
  };
}

/**
 * Team `/injuries` payload: open Pain Alerts (triage) + open/closed Injuries.
 * Pain Alerts are never mixed into Injury SoT arrays.
 */
export async function getTeamInjuriesList(
  teamId: string
): Promise<TeamInjuriesListPayload> {
  const [injuryRows, painAlertRows] = await Promise.all([
    database.injury.findMany({
      where: { teamId },
      orderBy: { startDate: "desc" },
      take: 200,
      select: {
        id: true,
        playerId: true,
        cause: true,
        regionDetail: true,
        startDate: true,
        endDate: true,
        regions: { select: { regionId: true } },
        player: { select: { name: true } },
      },
    }),
    database.painAlert.findMany({
      where: { teamId, promotedInjuryId: null },
      orderBy: { reportedAt: "desc" },
      take: 50,
      select: {
        id: true,
        playerId: true,
        title: true,
        description: true,
        bodyPart: true,
        reportedAt: true,
        promotedInjuryId: true,
        player: { select: { name: true } },
      },
    }),
  ]);

  const mappedInjuries = injuryRows.map(mapInjuryRow);
  const { open, closed } = partitionInjuriesByOpenClosed(mappedInjuries);

  const openAlerts = filterOpenPainAlerts(painAlertRows).map(mapPainAlertRow);

  return {
    painAlerts: takeSectionCap(sortPainAlertsNewestFirst(openAlerts)),
    activeInjuries: takeSectionCap(sortOpenInjuriesNewestFirst(open)),
    closedInjuries: takeSectionCap(sortClosedInjuriesNewestFirst(closed)),
  };
}
