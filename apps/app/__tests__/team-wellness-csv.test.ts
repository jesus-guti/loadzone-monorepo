import { describe, expect, it } from "vitest";
import {
  TEAM_WELLNESS_CSV_HEADERS,
  buildWellnessCsvFilename,
  formatTeamWellnessCsv,
  isExportDateRangeValid,
  selectTeamWellnessCsvRows,
  type TeamWellnessCsvSourceRow,
} from "@/features/wellness/lib/team-wellness-csv";

const UTF8_BOM = "\uFEFF";

type SourceFixture = TeamWellnessCsvSourceRow & {
  playerToken: string;
  isArchived: boolean;
  formSubmissionPayload?: unknown;
  acuteLoad?: number | null;
};

function sourceRow(overrides: Partial<SourceFixture> = {}): SourceFixture {
  return {
    teamId: "team_active",
    playerName: "Ana García",
    playerToken: "secret-player-token",
    isArchived: false,
    date: "2026-08-10",
    seasonName: "2026-27",
    recovery: 4,
    energy: 3,
    soreness: 2,
    sleepHours: 8,
    sleepQuality: 4,
    rpe: 6,
    duration: 90,
    physioAlert: false,
    preFilledAt: "2026-08-10T07:00:00.000Z",
    postFilledAt: "2026-08-10T21:00:00.000Z",
    formSubmissionPayload: { answers: [1, 2, 3] },
    acuteLoad: 120,
    ...overrides,
  };
}

describe("selectTeamWellnessCsvRows", () => {
  it("keeps only the active Team, inclusive civil dates, and archived Players", () => {
    const rows = selectTeamWellnessCsvRows(
      [
        sourceRow({ date: "2026-08-01", playerName: "In range" }),
        sourceRow({ date: "2026-07-31", playerName: "Before" }),
        sourceRow({ date: "2026-08-31", playerName: "End inclusive" }),
        sourceRow({ date: "2026-09-01", playerName: "After" }),
        sourceRow({
          date: "2026-08-15",
          playerName: "Archived",
          isArchived: true,
        }),
        sourceRow({
          date: "2026-08-15",
          playerName: "Other squad",
          teamId: "team_other",
        }),
      ],
      { teamId: "team_active", from: "2026-08-01", to: "2026-08-31" }
    );

    expect(rows.map((row) => row.playerName)).toEqual([
      "In range",
      "Archived",
      "End inclusive",
    ]);
  });

  it("does not invent empty days and names Temporada from the row Season", () => {
    const rows = selectTeamWellnessCsvRows(
      [
        sourceRow({ date: "2026-06-30", seasonName: "2025-26" }),
        sourceRow({
          date: "2026-08-10",
          seasonName: "2026-27",
          playerName: "Ana García",
        }),
      ],
      { teamId: "team_active", from: "2026-06-01", to: "2026-08-31" }
    );

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.seasonName)).toEqual(["2025-26", "2026-27"]);
  });
});

describe("formatTeamWellnessCsv", () => {
  it("writes UTF-8 BOM, Spanish headers, and semicolon dialect with no data rows", () => {
    const csv = formatTeamWellnessCsv([]);

    expect(csv.startsWith(UTF8_BOM)).toBe(true);
    expect(csv).toBe(`${UTF8_BOM}${TEAM_WELLNESS_CSV_HEADERS.join(";")}\r\n`);
    expect(csv).not.toContain(",");
  });

  it("puts PRE and POST on one row and never leaks token, form payload, or load stats", () => {
    const [row] = selectTeamWellnessCsvRows([sourceRow()], {
      teamId: "team_active",
      from: "2026-08-01",
      to: "2026-08-31",
    });
    expect(row).toBeDefined();

    const csv = formatTeamWellnessCsv([row!]);
    const body = csv.slice(UTF8_BOM.length);
    const lines = body.trimEnd().split("\r\n");
    expect(lines[0]).toBe(TEAM_WELLNESS_CSV_HEADERS.join(";"));
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe(
      "Ana García;2026-08-10;2026-27;4;3;2;8;4;6;90;No;2026-08-10T07:00:00.000Z;2026-08-10T21:00:00.000Z"
    );
    expect(csv).not.toContain("secret-player-token");
    expect(csv).not.toContain("answers");
    expect(csv).not.toContain("120");
  });

  it("leaves null metrics empty and quotes fields that contain the separator", () => {
    const [row] = selectTeamWellnessCsvRows(
      [
        sourceRow({
          playerName: "Ruiz; hijo",
          recovery: null,
          energy: null,
          soreness: null,
          sleepHours: null,
          sleepQuality: null,
          rpe: null,
          duration: null,
          preFilledAt: null,
          postFilledAt: null,
        }),
      ],
      { teamId: "team_active", from: "2026-08-01", to: "2026-08-31" }
    );

    const csv = formatTeamWellnessCsv([row!]);
    const dataLine = csv.slice(UTF8_BOM.length).trimEnd().split("\r\n")[1];
    expect(dataLine).toBe('"Ruiz; hijo";2026-08-10;2026-27;;;;;;;;No;;');
  });
});

describe("buildWellnessCsvFilename", () => {
  it("uses sanitized team name and civil dates", () => {
    expect(buildWellnessCsvFilename("Juvenil A / Norte", "2026-08-01", "2026-08-31")).toBe(
      "wellness-juvenil-a-norte-2026-08-01-2026-08-31.csv"
    );
  });
});

describe("isExportDateRangeValid", () => {
  it("requires both dates and start not after end", () => {
    expect(isExportDateRangeValid("", "2026-08-31")).toBe(false);
    expect(isExportDateRangeValid("2026-08-01", "")).toBe(false);
    expect(isExportDateRangeValid("2026-09-01", "2026-08-31")).toBe(false);
    expect(isExportDateRangeValid("2026-08-01", "2026-08-31")).toBe(true);
    expect(isExportDateRangeValid("2026-08-10", "2026-08-10")).toBe(true);
  });
});
