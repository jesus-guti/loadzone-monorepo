import type { DayColumn, MicrocycleSheet } from "./microcycles";

const CSV_SPECIAL_CHARS_PATTERN = /[;"\r\n]/;
const UTF8_BOM = "\uFEFF";

function csvField(value: string): string {
  if (CSV_SPECIAL_CHARS_PATTERN.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function commaDecimal(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function acField(day: DayColumn): string {
  if (day.chronic === 0) {
    return "0";
  }
  return commaDecimal(day.ac);
}

function row(label: string, cells: readonly string[]): string {
  return [csvField(label), ...cells].join(";");
}

export function formatCargaMicrocycleCsv(sheet: MicrocycleSheet): string {
  const microcycleCells = sheet.microcycles.flatMap((microcycle) => [
    `Microciclo ${microcycle.index}`,
    ...Array.from({ length: microcycle.days.length - 1 }, () => ""),
  ]);
  const dates = sheet.days.map((day) => day.key);
  const sumByMonday = new Map(
    sheet.microcycles.flatMap((microcycle) => {
      const monday = microcycle.days[0]?.key;
      return monday ? [[monday, String(microcycle.loadSum)] as const] : [];
    })
  );
  const sumatorio = sheet.days.map((day) => sumByMonday.get(day.key) ?? "");

  const lines = [
    row("Jugador", microcycleCells),
    row("", dates),
    ...sheet.players.map((player) =>
      row(
        player.name,
        player.rpe.map((value) => (value === null ? "" : String(value)))
      )
    ),
    row(
      "Tiempo",
      sheet.days.map((day) => String(day.minutes))
    ),
    row(
      "Carga del día",
      sheet.days.map((day) => String(day.teamLoad))
    ),
    row(
      "Aguda 7d",
      sheet.days.map((day) => String(day.acute))
    ),
    row(
      "Crónica 28d",
      sheet.days.map((day) => String(day.chronic))
    ),
    row("A:C", sheet.days.map(acField)),
    row("Sumatorio", sumatorio),
  ];

  return `${UTF8_BOM}${lines.join("\r\n")}\r\n`;
}

export function buildCargaCsvFilename(sheet: MicrocycleSheet): string {
  const start = sheet.days[0]?.key ?? "temporada";
  const end = sheet.days.at(-1)?.key ?? start;
  return `carga-${start}-${end}.csv`;
}
