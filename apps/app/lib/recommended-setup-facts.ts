import { database } from "@repo/database";
import type { RecommendedSetupClubFacts } from "@/lib/recommended-setup";

/**
 * Club-scoped existence facts for Primeros pasos (Recommended Setup).
 * Cheap findFirst / select-id queries — not full lists.
 */
export async function loadClubRecommendedSetupFacts(
  clubId: string,
): Promise<RecommendedSetupClubFacts> {
  const teamInClub = { team: { clubId } } as const;

  const [
    club,
    season,
    player,
    favorite,
    sessionExercise,
    session,
  ] = await Promise.all([
    database.club.findUnique({
      where: { id: clubId },
      select: { logoUrl: true },
    }),
    database.season.findFirst({
      where: teamInClub,
      select: { id: true },
    }),
    database.player.findFirst({
      where: teamInClub,
      select: { id: true },
    }),
    database.membershipExerciseFavorite.findFirst({
      where: { membership: { clubId } },
      select: { membershipId: true },
    }),
    database.sessionExercise.findFirst({
      where: { teamSession: { clubId } },
      select: { id: true },
    }),
    database.teamSession.findFirst({
      where: { clubId },
      select: { id: true },
    }),
  ]);

  return {
    hasClubLogo: Boolean(club?.logoUrl),
    hasAnySeason: season !== null,
    hasAnyPlayer: player !== null,
    hasMembershipExerciseFavorite: favorite !== null,
    hasExerciseOnSession: sessionExercise !== null,
    hasAnySession: session !== null,
  };
}
