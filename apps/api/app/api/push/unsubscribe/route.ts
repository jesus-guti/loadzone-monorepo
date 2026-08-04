import { database } from "@repo/database";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "@repo/database/age-band-policy";
import {
  consentStateAfterOptOut,
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
  type PlayerReminderConsentState,
} from "@repo/database/reminder-consent";
import { unsubscribePush } from "@repo/push-notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const unsubscribeSchema = z.object({
  token: z.string().min(1),
  endpoint: z.string().url(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid unsubscribe data" },
        { status: 400 }
      );
    }

    const player = await database.player.findUnique({
      where: { token: parsed.data.token, isArchived: false },
      select: {
        id: true,
        dateOfBirth: true,
        ageBandOverride: true,
        reminderConsentState: true,
        team: {
          select: {
            timezone: true,
            ageBandPolicy: true,
            reminderConsentPolicy: true,
            club: {
              select: { ageBandPolicy: true },
            },
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const subscription = await database.pushSubscription.findUnique({
      where: { endpoint: parsed.data.endpoint },
      select: { id: true, playerId: true },
    });

    if (!subscription || subscription.playerId !== player.id) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const effectiveAge = resolveEffectiveAgeBandPolicy({
      teamPolicy: player.team.ageBandPolicy,
      clubPolicy: player.team.club.ageBandPolicy,
    });
    const resolvedAge = resolveAgeBandPolicy({
      policy: effectiveAge.policy,
      policySource: effectiveAge.source,
      dateOfBirth: player.dateOfBirth,
      ageBandOverride: player.ageBandOverride,
      teamTimezone: player.team.timezone,
    });
    const { policy: reminderPolicy } = resolveEffectiveReminderConsentPolicy({
      teamPolicy: player.team.reminderConsentPolicy,
    });
    const consent = resolvePushConsent({
      resolvedAge,
      reminderConsentPolicy: reminderPolicy,
      playerConsentState:
        player.reminderConsentState as PlayerReminderConsentState,
      hasActiveSubscription: true,
    });

    try {
      await unsubscribePush(parsed.data.endpoint);
    } catch {
      // Row may already be gone; continue to update consent ledger.
    }

    const nextState = consentStateAfterOptOut(
      player.reminderConsentState as PlayerReminderConsentState,
      consent.mode
    );
    if (nextState !== player.reminderConsentState) {
      await database.player.update({
        where: { id: player.id },
        data: { reminderConsentState: nextState },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
