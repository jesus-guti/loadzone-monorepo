/**
 * Injury active-day predicate and Player.status sync (JES-30 / JES-50).
 * Import from `@repo/database/injury-status`.
 */

import type { PlayerStatus } from "./generated/client";
import {
  civilDateToUtcMidnight,
  compareCivilDates,
  toCivilDateString,
} from "./recoverable-streak";

export type InjuryDateBounds = {
  readonly startDate: string;
  readonly endDate: string | null;
};

/**
 * Calendar-day coverage (wellness exemption / streaks): startDate ≤ D and
 * (endDate null or D ≤ endDate). Inclusive endDate (JES-30).
 */
export function isInjuryActiveOnCivilDay(
  startDate: string,
  endDate: string | null,
  civilYmd: string
): boolean {
  if (compareCivilDates(startDate, civilYmd) > 0) {
    return false;
  }
  if (endDate === null) {
    return true;
  }
  return compareCivilDates(civilYmd, endDate) <= 0;
}

/**
 * Open episode for Player.status (Lesionado): started by D and not yet given
 * alta (`endDate` null). Closed rows stay on the calendar via
 * {@link isInjuryActiveOnCivilDay} but must not keep status INJURED.
 */
export function isOpenInjuryOnCivilDay(
  startDate: string,
  endDate: string | null,
  civilYmd: string
): boolean {
  return endDate === null && compareCivilDates(startDate, civilYmd) <= 0;
}

export function derivePlayerStatusFromActiveInjuries(args: {
  readonly hasActiveInjury: boolean;
  readonly currentStatus: PlayerStatus;
}): PlayerStatus | null {
  if (args.hasActiveInjury) {
    return args.currentStatus === "INJURED" ? null : "INJURED";
  }
  if (args.currentStatus === "INJURED") {
    return "AVAILABLE";
  }
  return null;
}

/**
 * While ≥1 active Injury, only INJURED is allowed (no manual override).
 */
export function isPlayerStatusOverrideBlocked(args: {
  readonly hasActiveInjury: boolean;
  readonly requestedStatus: PlayerStatus;
}): boolean {
  return args.hasActiveInjury && args.requestedStatus !== "INJURED";
}

export type InjuryStatusDbClient = {
  readonly injury: {
    count: (args: {
      where: {
        playerId: string;
        startDate: { lte: Date };
        endDate: null;
      };
    }) => Promise<number>;
  };
  readonly player: {
    findUnique: (args: {
      where: { id: string };
      select: { status: true };
    }) => Promise<{ status: PlayerStatus } | null>;
    update: (args: {
      where: { id: string };
      data: { status: PlayerStatus };
    }) => Promise<unknown>;
  };
};

function toCivilYmdFromDbDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function playerHasActiveInjury(
  db: InjuryStatusDbClient,
  playerId: string,
  civilYmd: string,
  _timeZone: string
): Promise<boolean> {
  const civilDate = civilDateToUtcMidnight(civilYmd);
  const count = await db.injury.count({
    where: {
      playerId,
      startDate: { lte: civilDate },
      endDate: null,
    },
  });
  return count > 0;
}

export type SyncPlayerStatusOptions = {
  readonly timeZone: string;
  /** Civil YYYY-MM-DD; defaults to now in timeZone. */
  readonly asOf?: string;
};

export async function syncPlayerStatusFromInjuries(
  db: InjuryStatusDbClient,
  playerId: string,
  options: SyncPlayerStatusOptions
): Promise<PlayerStatus | null> {
  const asOf =
    options.asOf ?? toCivilDateString(new Date(), options.timeZone);
  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { status: true },
  });
  if (!player) {
    return null;
  }

  const hasActive = await playerHasActiveInjury(
    db,
    playerId,
    asOf,
    options.timeZone
  );
  const next = derivePlayerStatusFromActiveInjuries({
    hasActiveInjury: hasActive,
    currentStatus: player.status,
  });
  if (next === null) {
    return player.status;
  }

  await db.player.update({
    where: { id: playerId },
    data: { status: next },
  });
  return next;
}

/** Map Injury rows with @db.Date fields to civil YYYY-MM-DD intervals. */
export function mapInjuryRowsToIntervals(
  injuries: Array<{ startDate: Date; endDate: Date | null }>
): InjuryDateBounds[] {
  return injuries.map((injury) => ({
    startDate: toCivilYmdFromDbDate(injury.startDate),
    endDate: injury.endDate ? toCivilYmdFromDbDate(injury.endDate) : null,
  }));
}
