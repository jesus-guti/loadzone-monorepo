import { database } from "@repo/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../components/header";
import { updateInjury } from "./actions/injury-actions";

export const metadata: Metadata = {
  title: "Lesiones | LoadZone",
};

const InjuriesPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const injuries = await database.injuryReport.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
    },
    orderBy: {
      reportedAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      bodyPart: true,
      severity: true,
      status: true,
      staffNotes: true,
      reportedAt: true,
      reportedByPlayer: true,
      player: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <>
      <Header page="Lesiones" pages={["LoadZone"]} />
      <div className="mx-auto max-w-4xl space-y-4 p-4 pt-0">
        {injuries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-text-secondary">
              No hay reportes de lesión todavía.
            </CardContent>
          </Card>
        ) : (
          injuries.map((injury) => (
            <Card key={injury.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {injury.player.name}: {injury.title}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {new Date(injury.reportedAt).toLocaleString("es-ES")} ·{" "}
                  {injury.bodyPart ?? "Sin localización"} · {injury.severity} ·{" "}
                  {injury.reportedByPlayer ? "Jugador" : "Staff"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {injury.description ? (
                  <p className="text-sm text-text-secondary">{injury.description}</p>
                ) : null}

                <form action={updateInjury} className="space-y-3">
                  <input type="hidden" name="injuryId" value={injury.id} />
                  <div className="space-y-2">
                    <label
                      htmlFor={`status-${injury.id}`}
                      className="text-sm font-medium"
                    >
                      Estado
                    </label>
                    <select
                      id={`status-${injury.id}`}
                      name="status"
                      defaultValue={injury.status}
                      className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                    >
                      <option value="REPORTED">Reportada</option>
                      <option value="UNDER_REVIEW">En revisión</option>
                      <option value="RESOLVED">Resuelta</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`staffNotes-${injury.id}`}
                      className="text-sm font-medium"
                    >
                      Notas del staff
                    </label>
                    <textarea
                      id={`staffNotes-${injury.id}`}
                      name="staffNotes"
                      defaultValue={injury.staffNotes ?? ""}
                      rows={3}
                      className="w-full rounded-md border border-border-secondary bg-bg-primary px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
                  >
                    Guardar
                  </button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default InjuriesPage;
