/**
 * Staff-authored Injury create (shared by promote + Registrar lesión).
 * Never emits Care Alerts (JES-47 HITL C).
 */

import type { InjurySeverity } from "./generated/client";
import {
  BODY_REGION_IDS,
  type BodyRegionCatalogId,
} from "./body-region-catalog";
import {
  civilDateToUtcMidnight,
  toCivilDateString,
} from "./recoverable-streak";
import {
  syncPlayerStatusFromInjuries,
  type InjuryStatusDbClient,
} from "./injury-status";

export type StaffInjuryCreateInput = {
  readonly playerId: string;
  readonly teamId: string;
  readonly cause: string;
  readonly severity: InjurySeverity;
  /** Civil YYYY-MM-DD; defaults to today in timeZone when omitted. */
  readonly startDate?: string;
  readonly regionIds: readonly BodyRegionCatalogId[];
  readonly regionDetail?: string | null;
  readonly staffNotes?: string | null;
  readonly createdByUserId?: string | null;
  readonly timeZone: string;
};

export type StaffInjuryCreateResult = {
  readonly id: string;
  readonly startDate: string;
};

export type StaffInjuryWriteClient = {
  readonly injury: {
    create: (args: {
      data: {
        playerId: string;
        teamId: string;
        startDate: Date;
        cause: string;
        severity: InjurySeverity;
        regionDetail: string | null;
        staffNotes: string | null;
        createdByUserId: string | null;
        regions: {
          create: Array<{ regionId: BodyRegionCatalogId }>;
        };
      };
      select: { id: true; startDate: true };
    }) => Promise<{ id: string; startDate: Date }>;
    count: InjuryStatusDbClient["injury"]["count"];
  };
  readonly player: InjuryStatusDbClient["player"];
};

function isBodyRegionId(value: string): value is BodyRegionCatalogId {
  return (BODY_REGION_IDS as readonly string[]).includes(value);
}

/**
 * Create an official Injury with ≥1 BodyRegion, then sync Player.status.
 * Callers must not invoke Care Alert evaluation on this path (JES-47 HITL C).
 */
export async function createStaffInjury(
  db: StaffInjuryWriteClient,
  input: StaffInjuryCreateInput
): Promise<StaffInjuryCreateResult> {
  const uniqueRegionIds = [...new Set(input.regionIds)];
  if (uniqueRegionIds.length === 0) {
    throw new Error("Injury requires at least one BodyRegion.");
  }
  for (const regionId of uniqueRegionIds) {
    if (!isBodyRegionId(regionId)) {
      throw new Error(`Unknown BodyRegion: ${regionId}`);
    }
  }

  const startDateCivil =
    input.startDate ?? toCivilDateString(new Date(), input.timeZone);

  const row = await db.injury.create({
    data: {
      playerId: input.playerId,
      teamId: input.teamId,
      startDate: civilDateToUtcMidnight(startDateCivil),
      cause: input.cause,
      severity: input.severity,
      regionDetail: input.regionDetail ?? null,
      staffNotes: input.staffNotes ?? null,
      createdByUserId: input.createdByUserId ?? null,
      regions: {
        create: uniqueRegionIds.map((regionId) => ({ regionId })),
      },
    },
    select: { id: true, startDate: true },
  });

  await syncPlayerStatusFromInjuries(db, input.playerId, {
    timeZone: input.timeZone,
    asOf: startDateCivil,
  });

  return {
    id: row.id,
    startDate: startDateCivil,
  };
}

export function parseBodyRegionIds(
  values: readonly string[]
): BodyRegionCatalogId[] {
  const out: BodyRegionCatalogId[] = [];
  for (const value of values) {
    if (isBodyRegionId(value) && !out.includes(value)) {
      out.push(value);
    }
  }
  return out;
}
