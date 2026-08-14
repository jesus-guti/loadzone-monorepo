import { database } from "@repo/database";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "@repo/database/age-band-policy";
import {
  consentStateAfterSubscribe,
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
  type PlayerReminderConsentState,
} from "@repo/database/reminder-consent";
import { subscribePush } from "@repo/push-notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  token: z.string().min(1),
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
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
      // Permission to create/upsert is independent of existing endpoints.
      hasActiveSubscription: false,
    });

    if (!consent.canSubscribe) {
      return NextResponse.json(
        { error: "Reminder consent does not allow push subscription" },
        { status: 403 }
      );
    }

    await subscribePush({
      playerId: player.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
    });

    const nextState = consentStateAfterSubscribe(
      player.reminderConsentState as PlayerReminderConsentState
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
