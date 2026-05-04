"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/ui/button";
import { Separator } from "@repo/design-system/components/ui/separator";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EXERCISE_LIBRARY_FILTER_NONE,
  buildExerciseLibraryFilter,
  filterExerciseLibraryItems,
  getExerciseLibraryFilterValueOptions,
  sortExerciseLibraryItems,
} from "../exercise-library-sort-filter";
import type {
  ExerciseLibraryListItem,
  ExerciseLibraryPayload,
  ExerciseLibrarySortKey,
} from "../types";
import { ExerciseLibraryGroup } from "./exercise-library-item";
import { ExerciseLibraryListToolbar } from "./exercise-library-list-toolbar";

function filterByQuery(
  items: readonly ExerciseLibraryListItem[],
  query: string
): ExerciseLibraryListItem[] {
  const q = query.trim().toLowerCase();
  if (q === "") {
    return [...items];
  }
  return items.filter((item) => item.name.toLowerCase().includes(q));
}

type ExerciseLibraryListProps = {
  readonly data: ExerciseLibraryPayload;
  readonly membershipId: string;
  readonly clubId: string;
};

export function ExerciseLibraryList({
  data,
  membershipId,
  clubId,
}: ExerciseLibraryListProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] =
    useState<ExerciseLibrarySortKey>("updated_desc");
  const [filterDimension, setFilterDimension] = useState<string>(
    EXERCISE_LIBRARY_FILTER_NONE
  );
  const [filterValue, setFilterValue] = useState("");

  const activeFilter = useMemo(
    () => buildExerciseLibraryFilter(filterDimension, filterValue),
    [filterDimension, filterValue]
  );

  const filterValueOptions = useMemo(
    () => getExerciseLibraryFilterValueOptions(filterDimension),
    [filterDimension]
  );

  const hasActiveFilter = activeFilter.kind !== "none";

  const favorites = useMemo(() => {
    const searched = filterByQuery(data.favorites, search);
    const filtered = filterExerciseLibraryItems(searched, activeFilter);
    return sortExerciseLibraryItems(filtered, sortKey);
  }, [data.favorites, search, activeFilter, sortKey]);

  const rest = useMemo(() => {
    const searched = filterByQuery(data.rest, search);
    const filtered = filterExerciseLibraryItems(searched, activeFilter);
    return sortExerciseLibraryItems(filtered, sortKey);
  }, [data.rest, search, activeFilter, sortKey]);

  const total = data.favorites.length + data.rest.length;
  const visibleCount = favorites.length + rest.length;

  function clearFilter(): void {
    setFilterDimension(EXERCISE_LIBRARY_FILTER_NONE);
    setFilterValue("");
  }

  if (total === 0) {
    return (
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
    );
  }

  const trimmedSearch = search.trim();

  return (
    <div className="space-y-6">
      <ExerciseLibraryListToolbar
        filterDimension={filterDimension}
        filterValue={filterValue}
        filterValueOptions={filterValueOptions}
        hasActiveFilter={hasActiveFilter}
        onClearFilter={clearFilter}
        onFilterDimensionChange={setFilterDimension}
        onFilterValueChange={setFilterValue}
        onSearchChange={setSearch}
        onSortKeyChange={setSortKey}
        search={search}
        sortKey={sortKey}
      />

      {visibleCount === 0 ? (
        <p className="text-sm text-text-secondary">
          {trimmedSearch !== ""
            ? `No hay ejercicios que coincidan con «${trimmedSearch}».`
            : "No hay ejercicios que coincidan con el filtro actual."}
          {hasActiveFilter === true ? (
            <>
              {" "}
              <button
                className="font-medium text-text-brand underline"
                onClick={clearFilter}
                type="button"
              >
                Quitar filtro
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <>
          <ExerciseLibraryGroup
            clubId={clubId}
            items={favorites}
            membershipId={membershipId}
            title="Favoritos"
          />

          {favorites.length > 0 && rest.length > 0 ? (
            <Separator className="bg-border-secondary" />
          ) : null}

          <ExerciseLibraryGroup
            clubId={clubId}
            items={rest}
            membershipId={membershipId}
            title="Más ejercicios"
          />

          <p className="text-xs text-text-secondary">
            {visibleCount === total
              ? `${total} ${total === 1 ? "ejercicio" : "ejercicios"}`
              : `${visibleCount} de ${total} ejercicios`}
          </p>
        </>
      )}
    </div>
  );
}
