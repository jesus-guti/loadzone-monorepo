import { database } from "@repo/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { updateInjuryTriage } from "@/features/injuries";

export const metadata: Metadata = {
  title: "Lesiones | LoadZone",
};

const InjuriesPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const teamId = staffContext.activeTeam.id;

  const [injuries, painAlerts] = await Promise.all([
    database.injury.findMany({
      where: { teamId },
      orderBy: { startDate: "desc" },
      take: 50,
      select: {
        id: true,
        cause: true,
        severity: true,
        staffNotes: true,
        regionDetail: true,
        startDate: true,
        endDate: true,
        regions: { select: { regionId: true } },
        player: { select: { name: true } },
      },
    }),
    database.painAlert.findMany({
      where: { teamId },
      orderBy: { reportedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        bodyPart: true,
        severity: true,
        reportedAt: true,
        player: { select: { name: true } },
      },
    }),
  ]);

  const hasAny = injuries.length > 0 || painAlerts.length > 0;

  return (
    <>
      <Header page="Lesiones" pages={["LoadZone"]} />
      <div className="mx-auto max-w-4xl space-y-6 p-4 pt-0">
        {!hasAny ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-text-secondary">
              No hay lesiones ni avisos de dolor todavía.
            </CardContent>
          </Card>
        ) : null}

        {injuries.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-text-secondary">
              Lesiones oficiales
            </h2>
            {injuries.map((injury) => {
              const startIso = injury.startDate.toISOString().slice(0, 10);
              const endIso = injury.endDate
                ? injury.endDate.toISOString().slice(0, 10)
                : "";
              const regionLabel =
                injury.regions.length > 0
                  ? injury.regions.map((region) => region.regionId).join(", ")
                  : (injury.regionDetail ?? "Sin zona");

              return (
                <Card key={injury.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {injury.player.name}: {injury.cause}
                    </CardTitle>
                    <p className="text-sm text-text-secondary">
                      {startIso}
                      {endIso ? ` → ${endIso}` : " · Abierta"} · {regionLabel} ·{" "}
                      {injury.severity}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form action={updateInjuryTriage} className="space-y-3">
                      <input type="hidden" name="injuryId" value={injury.id} />
                      <div className="space-y-2">
                        <label
                          htmlFor={`endDate-${injury.id}`}
                          className="text-sm font-medium"
                        >
                          Fecha de cierre (vacío = abierta)
                        </label>
                        <input
                          id={`endDate-${injury.id}`}
                          name="endDate"
                          type="date"
                          defaultValue={endIso}
                          className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                        />
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
              );
            })}
          </section>
        ) : null}

        {painAlerts.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-text-secondary">
              Avisos de dolor (jugador)
            </h2>
            {painAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {alert.player.name}: {alert.title}
                  </CardTitle>
                  <p className="text-sm text-text-secondary">
                    {new Date(alert.reportedAt).toLocaleString("es-ES")} ·{" "}
                    {alert.bodyPart ?? "Sin localización"} · {alert.severity}
                  </p>
                </CardHeader>
                {alert.description ? (
                  <CardContent>
                    <p className="text-sm text-text-secondary">
                      {alert.description}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
};

export default InjuriesPage;
