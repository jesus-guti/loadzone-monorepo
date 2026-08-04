import type { BodyRegionCatalogId } from "@repo/database/body-region-catalog";

export type InjuryListItem = {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly cause: string;
  readonly regionDetail: string | null;
  readonly regionIds: readonly BodyRegionCatalogId[];
  readonly regionLabels: readonly string[];
};
