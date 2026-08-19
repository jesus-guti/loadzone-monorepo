"use server";

import { getCurrentStaffContext } from "@/lib/auth-context";
import { loadTeamWellnessCsvRows } from "../lib/load-team-wellness-csv-rows";
import {
  buildWellnessCsvFilename,
  formatTeamWellnessCsv,
  isExportDateRangeValid,
} from "../lib/team-wellness-csv";

export type ExportTeamWellnessCsvResult =
  | { ok: true; filename: string; csv: string }
  | { ok: false; error: string };

export async function exportTeamWellnessCsv(
  from: string,
  to: string
): Promise<ExportTeamWellnessCsvResult> {
  const staffContext = await getCurrentStaffContext();
  const team = staffContext?.activeTeam;
  if (!team) {
    return { ok: false, error: "No autorizado." };
  }

  if (!isExportDateRangeValid(from, to)) {
    return { ok: false, error: "El rango de fechas no es válido." };
  }

  const rows = await loadTeamWellnessCsvRows(team.id, from, to);
  return {
    ok: true,
    filename: buildWellnessCsvFilename(team.name, from, to),
    csv: formatTeamWellnessCsv(rows),
  };
}
