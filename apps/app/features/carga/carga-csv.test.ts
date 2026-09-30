import { describe, expect, it } from "vitest";
import { formatCargaMicrocycleCsv } from "./carga-csv";
import { buildMicrocycleSheet } from "./microcycles";

const UTF8_BOM = "\uFEFF";

describe("formatCargaMicrocycleCsv", () => {
  it("writes the microcycle sheet in the Excel (es) dialect", () => {
    const sheet = buildMicrocycleSheet({
      seasonStart: "2026-08-05",
      seasonEnd: "2026-08-05",
      matchDates: [],
      sessionDates: ["2026-08-05"],
      players: [
        {
          id: "ana",
          name: "Ana López",
          rpeByDate: { "2026-08-05": 5 },
        },
        {
          id: "bea",
          name: "Bea; Ruiz",
          rpeByDate: {},
        },
        {
          id: "carlos",
          name: "Carlos",
          rpeByDate: { "2026-08-05": 0 },
        },
      ],
    });

    const csv = formatCargaMicrocycleCsv(sheet);
    const lines = csv
      .replace(UTF8_BOM, "")
      .split("\r\n")
      .filter((line) => line.length > 0);

    expect(csv.startsWith(UTF8_BOM)).toBe(true);
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(lines).toEqual([
      "Jugador;Microciclo 1;;;;;;",
      ";2026-08-03;2026-08-04;2026-08-05;2026-08-06;2026-08-07;2026-08-08;2026-08-09",
      "Ana López;;;5;;;;",
      '"Bea; Ruiz";;;;;;;',
      "Carlos;;;0;;;;",
      "Tiempo;0;0;80;0;0;0;0",
      "Carga del día;0;0;200;0;0;0;0",
      "Aguda 7d;0;0;67;50;40;33;29",
      "Crónica 28d;0;0;67;50;40;33;29",
      "A:C;0;0;1,00;1,00;1,00;1,00;1,00",
      "Sumatorio;200;;;;;;",
    ]);
    expect(csv).not.toContain("+15%");
    expect(csv).not.toContain("MD");
    expect(csv).not.toContain("ago");
  });
});
