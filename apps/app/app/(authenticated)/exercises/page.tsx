import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { PlusIcon } from "@heroicons/react/20/solid";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../components/header";

export const metadata: Metadata = {
  title: "Ejercicios | LoadZone",
};

const COMPLEXITY_LABEL: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  VERY_HIGH: "Muy alta",
};

const ExercisesPage = async (): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    notFound();
  }

  const exercises = await database.exercise.findMany({
    where: {
      OR: [
        { clubId: staffContext.club.id, isArchived: false },
        { isSystem: true, isArchived: false },
      ],
    },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      complexity: true,
      strategy: true,
      dynamicType: true,
      tacticalIntention: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header page="Ejercicios" pages={["LoadZone"]}>
        <Button asChild size="sm">
          <Link href="/exercises/new">
            <PlusIcon className="mr-1 size-4" />
            Añadir ejercicio
          </Link>
        </Button>
      </Header>

      <div className="p-4 md:p-6">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-secondary bg-bg-secondary/30 p-12 text-center">
            <h3 className="text-lg font-semibold text-text-primary">
              No hay ejercicios
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Crea tu primer ejercicio para empezar a montar sesiones.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/exercises/new">
                <PlusIcon className="mr-1 size-4" />
                Crear ejercicio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-secondary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Nombre</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Complejidad</TableHead>
                  <TableHead>Estrategia</TableHead>
                  <TableHead className="text-right pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="pl-4">
                      <Link
                        className="font-medium text-text-primary hover:underline"
                        href={`/exercises/${exercise.id}`}
                      >
                        {exercise.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {exercise.durationMinutes} min
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {COMPLEXITY_LABEL[exercise.complexity] ?? exercise.complexity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {exercise.strategy.replaceAll("_", " ").toLowerCase()}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/exercises/${exercise.id}`}>Editar</Link>
                      </Button>
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

export default ExercisesPage;
