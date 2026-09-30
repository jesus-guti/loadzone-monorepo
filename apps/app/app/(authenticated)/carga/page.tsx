import { toCivilDateString } from "@repo/database/recoverable-streak";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layouts/header";
import { loadMicrocycleSheet } from "@/features/carga/load-microcycle-sheet";
import { MicrocycleSheetView } from "@/features/carga/screen";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Carga | LoadZone",
};

export default async function CargaPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const season = staffContext.activeSeason;
  const timeZone = staffContext.activeTeam.timezone || "Europe/Madrid";
  const today = toCivilDateString(new Date(), timeZone);
  const sheet = season
    ? await loadMicrocycleSheet(staffContext.activeTeam.id, season.id, timeZone)
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header page="Carga" pages={["LoadZone"]} />
      {sheet !== null && sheet.days.length > 0 ? (
        <MicrocycleSheetView sheet={sheet} today={today} />
      ) : (
        <p className="px-6 py-4 text-sm text-text-secondary">
          Elige una temporada para ver los microciclos.
        </p>
      )}
    </div>
  );
}
