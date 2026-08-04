export type TeamInjuryListItem = {
  readonly id: string;
  readonly playerId: string;
  readonly playerName: string;
  /** Civil YYYY-MM-DD */
  readonly startDate: string;
  /** Civil YYYY-MM-DD when closed; null when open */
  readonly endDate: string | null;
  readonly cause: string;
  readonly regionLabels: readonly string[];
  readonly regionDetail: string | null;
};

export type TeamPainAlertListItem = {
  readonly id: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly reportedAt: string;
  readonly title: string;
  readonly summary: string | null;
};

export type TeamInjuriesListPayload = {
  readonly painAlerts: readonly TeamPainAlertListItem[];
  readonly activeInjuries: readonly TeamInjuryListItem[];
  readonly closedInjuries: readonly TeamInjuryListItem[];
};
