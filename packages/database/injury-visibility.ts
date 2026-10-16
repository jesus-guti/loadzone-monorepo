/**
 * Injury visibility filters (soft-delete). Import from `@repo/database/injury-visibility`.
 */

export const injuryNotDeletedWhere = { deletedAt: null };

export type SoftDeleteInjuryClient = {
  readonly injury: {
    update: (args: {
      where: { id: string };
      data: { deletedAt: Date };
    }) => Promise<unknown>;
  };
};

export async function softDeleteInjuryRecord(
  db: SoftDeleteInjuryClient,
  injuryId: string,
  deletedAt: Date = new Date()
): Promise<void> {
  await db.injury.update({
    where: { id: injuryId },
    data: { deletedAt },
  });
}

/** Rows with `deletedAt` set are hidden from staff/player injury surfaces. */
export function visibleInjuryRows<
  T extends { readonly deletedAt: Date | null },
>(rows: readonly T[]): T[] {
  return rows.filter((row) => row.deletedAt === null);
}
