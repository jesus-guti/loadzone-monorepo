import { database } from "@repo/database";
import { CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";

export const metadata: Metadata = {
  title: "Temporadas | LoadZone",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isActive(season: { startDate: Date; endDate: Date }): boolean {
  const now = new Date();
  return new Date(season.startDate) <= now && new Date(season.endDate) >= now;
}

const SeasonsPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) notFound();

  const seasons = await database.season.findMany({
    where: { teamId: staffContext.activeTeam.id },
    include: {
      _count: { select: { entries: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <>
      <Header page="Temporadas" pages={["LoadZone"]}>
        <div className="px-4">
          <Button asChild size="sm">
            <Link href="/seasons/new">
              <PlusIcon className="mr-1 h-4 w-4" />
              Nueva temporada
            </Link>
          </Button>
        </div>
      </Header>

      <div className="p-4 pt-0">
        {seasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center  bg-muted/50 p-12 text-center">
            <CalendarBlankIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No hay temporadas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera temporada para empezar a registrar datos.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/seasons/new">
                <PlusIcon className="mr-1 h-4 w-4" />
                Nueva temporada
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {seasons.map((season) => (
              <Card key={season.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{season.name}</CardTitle>
                  {isActive(season) && <Badge>Activa</Badge>}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {formatDate(season.startDate)} —{" "}
                    {formatDate(season.endDate)}
                  </p>
                  {season.preSeasonEnd && (
                    <p>
                      Pre-temporada hasta:{" "}
                      {formatDate(season.preSeasonEnd)}
                    </p>
                  )}
                  <p>{season._count.entries} registros</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SeasonsPage;
