const CIVIL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CSV_SPECIAL_CHARS_PATTERN = /[;"\r\n]/;
const UTF8_BOM = "\uFEFF";

export const TEAM_WELLNESS_CSV_HEADERS = [
  "Jugador",
  "Fecha",
  "Temporada",
  "Recuperación",
  "Energía",
  "Molestias",
  "Horas de sueño",
  "Calidad de sueño",
  "RPE",
  "Duración",
  "Alerta fisio",
  "PRE rellenado",
  "POST rellenado",
] as const;

export type TeamWellnessCsvRow = {
  playerName: string;
  date: string;
  seasonName: string;
  recovery: number | null;
  energy: number | null;
  soreness: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  rpe: number | null;
  duration: number | null;
  physioAlert: boolean;
  preFilledAt: string | null;
  postFilledAt: string | null;
};

export type TeamWellnessCsvSourceRow = TeamWellnessCsvRow & {
  teamId: string;
};

export function isCivilDateString(value: string): boolean {
  return CIVIL_DATE_PATTERN.test(value);
}

export function isExportDateRangeValid(from: string, to: string): boolean {
  return isCivilDateString(from) && isCivilDateString(to) && from <= to;
}

export function selectTeamWellnessCsvRows(
  rows: readonly TeamWellnessCsvSourceRow[],
  options: { teamId: string; from: string; to: string }
): TeamWellnessCsvRow[] {
  return rows
    .filter(
      (row) =>
        row.teamId === options.teamId &&
        row.date >= options.from &&
        row.date <= options.to
    )
    .slice()
    .sort((left, right) => {
      if (left.date !== right.date) {
        return left.date < right.date ? -1 : 1;
      }
      return left.playerName.localeCompare(right.playerName, "es");
    })
    .map((row) => ({
      playerName: row.playerName,
      date: row.date,
      seasonName: row.seasonName,
      recovery: row.recovery,
      energy: row.energy,
      soreness: row.soreness,
      sleepHours: row.sleepHours,
      sleepQuality: row.sleepQuality,
      rpe: row.rpe,
      duration: row.duration,
      physioAlert: row.physioAlert,
      preFilledAt: row.preFilledAt,
      postFilledAt: row.postFilledAt,
    }));
}

function csvField(value: string): string {
  if (CSV_SPECIAL_CHARS_PATTERN.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function metricField(value: number | null): string {
  return value === null ? "" : String(value);
}

export function formatTeamWellnessCsv(rows: readonly TeamWellnessCsvRow[]): string {
  const lines = [
    TEAM_WELLNESS_CSV_HEADERS.join(";"),
    ...rows.map((row) =>
      [
        csvField(row.playerName),
        csvField(row.date),
        csvField(row.seasonName),
        metricField(row.recovery),
        metricField(row.energy),
        metricField(row.soreness),
        metricField(row.sleepHours),
        metricField(row.sleepQuality),
        metricField(row.rpe),
        metricField(row.duration),
        row.physioAlert ? "Sí" : "No",
        row.preFilledAt ?? "",
        row.postFilledAt ?? "",
      ].join(";")
    ),
  ];

  return `${UTF8_BOM}${lines.join("\r\n")}\r\n`;
}

export function buildWellnessCsvFilename(
  teamName: string,
  from: string,
  to: string
): string {
  const slug = teamName
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  const safeSlug = slug.length > 0 ? slug : "equipo";
  return `wellness-${safeSlug}-${from}-${to}.csv`;
}
