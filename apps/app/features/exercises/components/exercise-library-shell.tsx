"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExerciseLibraryPayload } from "../types";
import { exerciseLibraryQueryKey } from "./exercise-library-keys";
import { ExerciseLibraryList } from "./exercise-library-list";

type ExerciseLibraryShellProps = {
  readonly initialData: ExerciseLibraryPayload;
  readonly membershipId: string;
  readonly clubId: string;
};

async function fetchLibrary(): Promise<ExerciseLibraryPayload> {
  const response = await fetch("/api/exercises/library");
  if (!response.ok) {
    throw new Error("No se pudo cargar la biblioteca.");
  }
  return response.json() as Promise<ExerciseLibraryPayload>;
}

export function ExerciseLibraryShell({
  initialData,
  membershipId,
  clubId,
}: ExerciseLibraryShellProps) {
  const query = useQuery({
    queryKey: exerciseLibraryQueryKey,
    queryFn: fetchLibrary,
    initialData,
  });

  if (query.isError) {
    return (
      <p className="text-sm text-text-secondary">
        No se pudo actualizar la lista.{" "}
        <button
          className="font-medium text-text-brand underline"
          onClick={() => {
            query.refetch().catch(() => {
              /* usuario puede reintentar */
            });
          }}
          type="button"
        >
          Reintentar
        </button>
      </p>
    );
  }

  const data = query.data ?? initialData;

  return (
    <ExerciseLibraryList
      clubId={clubId}
      data={data}
      membershipId={membershipId}
    />
  );
}
