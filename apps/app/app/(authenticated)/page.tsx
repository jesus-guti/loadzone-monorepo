import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { getTeamWellnessWorkspaceData } from "@/lib/team-wellness";
import { Header } from "@/components/layouts/header";

export const metadata: Metadata = {
  title: "Inicio | LoadZone",
  description: "Panel de control del equipo",
};

const Dashboard = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const data = await getTeamWellnessWorkspaceData(
    staffContext.activeTeam.id,
    staffContext.activeSeason?.id
  );
  if (!data) {
    notFound();
  }

  return (
    <>
      <Header page="Inicio" pages={["LoadZone"]} />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-2 md:px-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <Card className="rounded-xl border-border-secondary">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-text-primary">
                {data.team.name}
              </CardTitle>
              <p className="text-sm text-text-secondary">
                {data.activeSeason
                  ? `Temporada activa: ${data.activeSeason.name}`
                  : "Sin temporada activa configurada."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="max-w-2xl text-sm text-text-secondary">
                El shell ya opera sobre un único equipo activo. Usa `Wellness` como
                superficie principal del día para revisar estado, alertas y
                completitud.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/wellness">Abrir wellness</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sessions">Ver sesiones</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border-secondary">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-text-primary">
                Resumen de hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border-secondary bg-bg-secondary px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Pendientes
                </p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {data.summary.pendingCount}
                </p>
              </div>
              <div className="rounded-lg border border-border-secondary bg-bg-secondary px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Alertas
                </p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {data.summary.alertCount}
                </p>
              </div>
              <div className="rounded-lg border border-border-secondary bg-bg-secondary px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Pre completada
                </p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {data.summary.preCompletedCount}/{data.players.length}
                </p>
              </div>
              <div className="rounded-lg border border-border-secondary bg-bg-secondary px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Post completada
                </p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {data.summary.postCompletedCount}/{data.players.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
