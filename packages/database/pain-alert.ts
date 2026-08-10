/**
 * Player Pain Alert intake writes (JES-50 / JES-54). Never creates Injury.
 * Care Alert evaluation (when Parental Supervision allows) stays on the player
 * save path only — see JES-47 HITL C; staff promote / Injury create must not emit.
 */

import type { InjurySeverity, InjurySide } from "./generated/client";

export type PlayerPainAlertIntakeInput = {
  readonly playerId: string;
  readonly teamId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly bodyPart?: string | null;
  readonly side?: InjurySide | null;
  readonly injuryType?: string | null;
  readonly severity?: InjurySeverity;
};

export type PlayerPainAlertCreateResult = {
  readonly id: string;
  readonly bodyPart: string | null;
  readonly side: InjurySide | null;
  readonly injuryType: string | null;
  readonly reportedAt: Date;
};

export type PainAlertWriteClient = {
  readonly painAlert: {
    create: (args: {
      data: {
        playerId: string;
        teamId: string;
        title: string;
        description: string | null;
        bodyPart: string | null;
        side: InjurySide | null;
        injuryType: string | null;
        severity: InjurySeverity;
      };
      select: {
        id: true;
        bodyPart: true;
        side: true;
        injuryType: true;
        reportedAt: true;
      };
    }) => Promise<PlayerPainAlertCreateResult>;
  };
};

/**
 * Persist a player Pain Alert. Callers must not create Injury from this path.
 */
export async function createPlayerPainAlert(
  db: PainAlertWriteClient,
  input: PlayerPainAlertIntakeInput
): Promise<PlayerPainAlertCreateResult> {
  const row = await db.painAlert.create({
    data: {
      playerId: input.playerId,
      teamId: input.teamId,
      title: input.title,
      description: input.description ?? null,
      bodyPart: input.bodyPart ?? null,
      side: input.side ?? null,
      injuryType: input.injuryType ?? null,
      severity: input.severity ?? "UNKNOWN",
    },
    select: {
      id: true,
      bodyPart: true,
      side: true,
      injuryType: true,
      reportedAt: true,
    },
  });
  return row;
}
