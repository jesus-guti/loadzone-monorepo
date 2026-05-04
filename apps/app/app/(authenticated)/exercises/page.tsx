import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { Header } from "@/components/layouts/header";
import { ExerciseLibraryShell } from "@/features/exercises/components/exercise-library-shell";
import { getExerciseLibraryPayload } from "@/features/exercises/queries/get-exercise-library";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Ejercicios | LoadZone",
};

const ExercisesPage = async (): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    notFound();
  }

  const initialPayload = await getExerciseLibraryPayload({
    clubId: staffContext.club.id,
    membershipId: staffContext.membershipId,
  });

  const total =
    initialPayload.favorites.length + initialPayload.rest.length;

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
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-12 text-center">
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
          <ExerciseLibraryShell
            clubId={staffContext.club.id}
            initialData={initialPayload}
            membershipId={staffContext.membershipId}
          />
        )}
      </div>
    </>
  );
};

export default ExercisesPage;
