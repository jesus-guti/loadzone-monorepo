import {
  bodyRegionById,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import type {
  TeamInjuryListItem,
  TeamPainAlertListItem,
} from "../types";

export const TEAM_INJURIES_LIST_SECTION_CAP = 50;

export type InjuryOpenClosedRow = {
  readonly id: string;
  readonly endDate: string | null;
};

/**
 * Team list open/closed rule (JES-30 / JES-52): open when endDate is null.
 */
export function isOpenInjury(endDate: string | null): boolean {
  return endDate === null;
}

/**
 * Split official Injuries into Activas (open) vs Histórico (closed).
 * Does not accept Pain Alert rows — callers must keep SoTs separate.
 */
export function partitionInjuriesByOpenClosed<T extends InjuryOpenClosedRow>(
  injuries: readonly T[]
): { readonly open: T[]; readonly closed: T[] } {
  const open: T[] = [];
  const closed: T[] = [];
  for (const injury of injuries) {
    if (isOpenInjury(injury.endDate)) {
      open.push(injury);
    } else {
      closed.push(injury);
    }
  }
  return { open, closed };
}

export type PainAlertTriageRow = {
  readonly id: string;
  readonly promotedInjuryId: string | null;
};

/** Triage queue: not yet promoted to an official Injury. */
export function isOpenPainAlert(
  promotedInjuryId: string | null
): boolean {
  return promotedInjuryId === null;
}

export function filterOpenPainAlerts<T extends PainAlertTriageRow>(
  alerts: readonly T[]
): T[] {
  return alerts.filter((alert) => isOpenPainAlert(alert.promotedInjuryId));
}

export function playerProfileHref(playerId: string): string {
  return `/players/${playerId}`;
}

export function truncateText(
  value: string,
  maxLength: number
): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function isBodyRegionCatalogId(value: string): value is BodyRegionCatalogId {
  return bodyRegionById.has(value as BodyRegionCatalogId);
}

export function formatInjuryRegionLabels(
  regionIds: readonly string[],
  regionDetail: string | null
): string[] {
  const labels = regionIds.map((regionId) => {
    if (isBodyRegionCatalogId(regionId)) {
      return bodyRegionById.get(regionId)?.labelEs ?? regionId;
    }
    return regionId;
  });
  if (labels.length > 0) {
    return labels;
  }
  if (regionDetail && regionDetail.trim().length > 0) {
    return [regionDetail.trim()];
  }
  return [];
}

export function sortOpenInjuriesNewestFirst(
  injuries: readonly TeamInjuryListItem[]
): TeamInjuryListItem[] {
  return [...injuries].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );
}

export function sortClosedInjuriesNewestFirst(
  injuries: readonly TeamInjuryListItem[]
): TeamInjuryListItem[] {
  return [...injuries].sort((a, b) => {
    const endA = a.endDate ?? "";
    const endB = b.endDate ?? "";
    const byEnd = endB.localeCompare(endA);
    if (byEnd !== 0) {
      return byEnd;
    }
    return b.startDate.localeCompare(a.startDate);
  });
}

export function sortPainAlertsNewestFirst(
  alerts: readonly TeamPainAlertListItem[]
): TeamPainAlertListItem[] {
  return [...alerts].sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt)
  );
}

export function takeSectionCap<T>(
  items: readonly T[],
  cap: number = TEAM_INJURIES_LIST_SECTION_CAP
): T[] {
  return items.slice(0, cap);
}

export function toCivilYmd(value: Date): string {
  return value.toISOString().slice(0, 10);
}
