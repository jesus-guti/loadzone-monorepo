import { database } from "@repo/database";
import { resolveStorageUrl } from "@repo/storage/shared";
import { FireIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import {
  ArchiveButton,
  CopyTokenButton,
  PlayerPhotoCell,
} from "@/features/players";

export const metadata: Metadata = {
  title: "Jugadores | LoadZone",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  MODIFIED_TRAINING: "Modificado",
  INJURED: "Lesionado",
  ILL: "Enfermo",
  UNAVAILABLE: "No disponible",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  AVAILABLE: "default",
  MODIFIED_TRAINING: "secondary",
  INJURED: "destructive",
  ILL: "destructive",
  UNAVAILABLE: "outline",
};

const PlayersPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) notFound();

  const players = await database.player.findMany({
    where: { teamId: staffContext.activeTeam.id, isArchived: false },
    select: {
      id: true,
      imageUrl: true,
      name: true,
      token: true,
      status: true,
      currentStreak: true,
      entries: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
    orderBy: { name: "asc" },
  });
  const playersWithResolvedImages = players.map((player) => ({
    ...player,
    imageUrl: resolveStorageUrl(player.imageUrl),
  }));

  return (
    <>
      <Header page="Jugadores" pages={["LoadZone"]}>
        <div className="px-4">
          <Button asChild size="sm">
            <Link href="/players/new">
              <PlusIcon className="mr-1 h-4 w-4" />
              Añadir jugador
            </Link>
          </Button>
        </div>
      </Header>

      <div className="p-4 pt-0">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No hay jugadores</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Añade tu primer jugador para comenzar.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/players/new">
                <PlusIcon className="mr-1 h-4 w-4" />
                Añadir jugador
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Racha</TableHead>
                  <TableHead>Último registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersWithResolvedImages.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="pl-4">
                      <PlayerPhotoCell
                        imageUrl={player.imageUrl}
                        playerId={player.id}
                        playerName={player.name}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/players/${player.id}`}
                        className="font-medium hover:underline"
                      >
                        {player.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[player.status]}>
                        {STATUS_LABELS[player.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {player.currentStreak > 0 && (
                        <span className="flex items-center gap-1 text-sm">
                          <FireIcon className="size-3 text-premium" />
                          {player.currentStreak}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {player.entries[0]
                        ? new Date(
                            player.entries[0].date
                          ).toLocaleDateString("es-ES")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CopyTokenButton token={player.token} />
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/players/${player.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                        <ArchiveButton
                          playerId={player.id}
                          playerName={player.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default PlayersPage;
