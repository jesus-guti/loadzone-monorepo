/**
 * Promote an open Pain Alert into a staff Injury (JES-54).
 * Prefills cause/severity/notes from the alert; BodyRegions are staff-selected.
 * Never emits Care Alerts (JES-47 HITL C).
 */

import type { InjurySeverity } from "./generated/client";
import type { BodyRegionCatalogId } from "./body-region-catalog";
import {
  createStaffInjury,
  type StaffInjuryWriteClient,
} from "./create-injury";

export type PromotePainAlertInput = {
  readonly painAlertId: string;
  readonly teamId: string;
  readonly regionIds: readonly BodyRegionCatalogId[];
  readonly timeZone: string;
  readonly createdByUserId?: string | null;
  /** Optional override; defaults to today in timeZone via createStaffInjury. */
  readonly startDate?: string;
};

export type PromotePainAlertResult = {
  readonly injuryId: string;
  readonly painAlertId: string;
};

export type OpenPainAlertRow = {
  readonly id: string;
  readonly playerId: string;
  readonly teamId: string;
  readonly title: string;
  readonly description: string | null;
  readonly bodyPart: string | null;
  readonly severity: InjurySeverity;
  readonly promotedInjuryId: string | null;
};

export type PromotePainAlertClient = StaffInjuryWriteClient & {
  readonly painAlert: {
    findFirst: (args: {
      where: {
        id: string;
        teamId: string;
        promotedInjuryId: null;
      };
      select: {
        id: true;
        playerId: true;
        teamId: true;
        title: true;
        description: true;
        bodyPart: true;
        severity: true;
        promotedInjuryId: true;
      };
    }) => Promise<OpenPainAlertRow | null>;
    update: (args: {
      where: { id: string };
      data: { promotedInjuryId: string };
    }) => Promise<unknown>;
  };
};

/**
 * Open triage = promotedInjuryId is null. Promoted alerts keep the row for audit
 * but are excluded from the open set via this FK link.
 */
export function isOpenPainAlert(
  alert: Pick<OpenPainAlertRow, "promotedInjuryId">
): boolean {
  return alert.promotedInjuryId === null;
}

/**
 * Build staff Injury create prefill from a Pain Alert.
 * BodyRegions are never auto-mapped from free-text bodyPart (hint only).
 */
export function buildInjuryPrefillFromPainAlert(alert: {
  readonly title: string;
  readonly description: string | null;
  readonly bodyPart: string | null;
  readonly severity: InjurySeverity;
}): {
  readonly cause: string;
  readonly severity: InjurySeverity;
  readonly staffNotes: string | null;
  readonly regionDetail: string | null;
} {
  const detailParts: string[] = [];
  if (alert.description && alert.description.trim().length > 0) {
    detailParts.push(alert.description.trim());
  }
  if (alert.bodyPart && alert.bodyPart.trim().length > 0) {
    detailParts.push(`Zona (jugador): ${alert.bodyPart.trim()}`);
  }

  return {
    cause: alert.title,
    severity: alert.severity,
    staffNotes: detailParts.length > 0 ? detailParts.join("\n") : null,
    regionDetail: null,
  };
}

/**
 * Create Injury via the shared staff create path, then link the Pain Alert.
 * Does not call Care Alert evaluation (JES-47 HITL C — staff Injury / promote).
 */
export async function promotePainAlertToInjury(
  db: PromotePainAlertClient,
  input: PromotePainAlertInput
): Promise<PromotePainAlertResult> {
  const alert = await db.painAlert.findFirst({
    where: {
      id: input.painAlertId,
      teamId: input.teamId,
      promotedInjuryId: null,
    },
    select: {
      id: true,
      playerId: true,
      teamId: true,
      title: true,
      description: true,
      bodyPart: true,
      severity: true,
      promotedInjuryId: true,
    },
  });

  if (!alert || !isOpenPainAlert(alert)) {
    throw new Error("Aviso de dolor no encontrado o ya promovido.");
  }

  const prefill = buildInjuryPrefillFromPainAlert(alert);

  const injury = await createStaffInjury(db, {
    playerId: alert.playerId,
    teamId: alert.teamId,
    cause: prefill.cause,
    severity: prefill.severity,
    staffNotes: prefill.staffNotes,
    regionDetail: prefill.regionDetail,
    regionIds: input.regionIds,
    startDate: input.startDate,
    createdByUserId: input.createdByUserId ?? null,
    timeZone: input.timeZone,
  });

  await db.painAlert.update({
    where: { id: alert.id },
    data: { promotedInjuryId: injury.id },
  });

  return {
    injuryId: injury.id,
    painAlertId: alert.id,
  };
}
