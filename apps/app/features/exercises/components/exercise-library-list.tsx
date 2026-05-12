"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@repo/design-system/components/ui/button";
import { Separator } from "@repo/design-system/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EXERCISE_LIBRARY_FILTER_NONE,
  buildExerciseLibraryFilter,
  filterExerciseLibraryItems,
  isExerciseInLibraryScope,
  sortExerciseLibraryItems,
  type ExerciseLibraryFilter,
  type ExerciseLibraryScope,
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

type ExerciseLibraryTabPanelProps = {
  readonly scope: ExerciseLibraryScope;
  readonly data: ExerciseLibraryPayload;
  readonly membershipId: string;
  readonly clubId: string;
  readonly search: string;
  readonly sortKey: ExerciseLibrarySortKey;
  readonly activeFilter: ExerciseLibraryFilter;
  readonly trimmedSearch: string;
  readonly hasActiveFilter: boolean;
  readonly onClearFilter: () => void;
};

function ExerciseLibraryTabPanel({
  scope,
  data,
  membershipId,
  clubId,
  search,
  sortKey,
  activeFilter,
  trimmedSearch,
  hasActiveFilter,
  onClearFilter,
}: ExerciseLibraryTabPanelProps) {
  const allItems = useMemo(
    () => [...data.favorites, ...data.rest],
    [data.favorites, data.rest]
  );

  const itemsForScope = useMemo(
    () =>
      allItems.filter((item) =>
        isExerciseInLibraryScope(item, membershipId, scope)
      ),
    [allItems, membershipId, scope]
  );

  const tabTotal = itemsForScope.length;

  const { favorites, rest, visibleCount } = useMemo(() => {
    const fav = itemsForScope.filter((item) => item.isFavorite);
    const nonFav = itemsForScope.filter((item) => !item.isFavorite);
    const favoritesProcessed = sortExerciseLibraryItems(
      filterExerciseLibraryItems(filterByQuery(fav, search), activeFilter),
      sortKey
    );
    const restProcessed = sortExerciseLibraryItems(
      filterExerciseLibraryItems(filterByQuery(nonFav, search), activeFilter),
      sortKey
    );
    return {
      favorites: favoritesProcessed,
      rest: restProcessed,
      visibleCount: favoritesProcessed.length + restProcessed.length,
    };
  }, [itemsForScope, search, activeFilter, sortKey]);

  if (tabTotal === 0) {
    if (scope === "mine") {
      return (
        <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-10 text-center">
          <h3 className="text-base font-semibold text-text-primary">
            Aún no has creado ejercicios
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Los ejercicios que añadas aparecerán aquí. El catálogo del club
            sigue en la pestaña Club.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/exercises/new">
              <PlusIcon className="mr-1 size-4" />
              Añadir ejercicio
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <p className="text-sm text-text-secondary">
        No hay ejercicios en esta vista del club.
      </p>
    );
  }

  if (visibleCount === 0) {
    return (
      <p className="text-sm text-text-secondary">
        {trimmedSearch !== ""
          ? `No hay ejercicios que coincidan con «${trimmedSearch}».`
          : "No hay ejercicios que coincidan con el filtro actual."}
        {hasActiveFilter === true ? (
          <>
            {" "}
            <button
              className="font-medium text-text-brand underline"
              onClick={onClearFilter}
              type="button"
            >
              Mostrar todas las estrategias
            </button>
          </>
        ) : null}
      </p>
    );
  }

  return (
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
        title={favorites.length > 0 ? "Más ejercicios" : "Ejercicios"}
      />

      <p className="text-xs text-text-secondary">
        {visibleCount === tabTotal
          ? `${tabTotal} ${tabTotal === 1 ? "ejercicio" : "ejercicios"}`
          : `${visibleCount} de ${tabTotal} ejercicios`}
      </p>
    </>
  );
}

export function ExerciseLibraryList({
  data,
  membershipId,
  clubId,
}: ExerciseLibraryListProps) {
  const [scope, setScope] = useState<ExerciseLibraryScope>("mine");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] =
    useState<ExerciseLibrarySortKey>("updated_desc");
  const [strategyFilter, setStrategyFilter] = useState<string>(
    EXERCISE_LIBRARY_FILTER_NONE
  );

  const activeFilter = useMemo(
    () =>
      buildExerciseLibraryFilter(
        "strategy",
        strategyFilter === EXERCISE_LIBRARY_FILTER_NONE ? "" : strategyFilter
      ),
    [strategyFilter]
  );

  const hasActiveFilter = activeFilter.kind !== "none";

  const total = data.favorites.length + data.rest.length;

  function clearStrategyFilter(): void {
    setStrategyFilter(EXERCISE_LIBRARY_FILTER_NONE);
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
            Añadir ejercicio
          </Link>
        </Button>
      </div>
    );
  }

  const trimmedSearch = search.trim();

  const panelProps = {
    clubId,
    data,
    hasActiveFilter,
    membershipId,
    onClearFilter: clearStrategyFilter,
    search,
    sortKey,
    activeFilter,
    trimmedSearch,
  };

  return (
    <Tabs
      className="gap-4"
      onValueChange={(v) => {
        setScope(v as ExerciseLibraryScope);
      }}
      value={scope}
    >
      <TabsList aria-label="Ámbito de la biblioteca de ejercicios">
        <TabsTrigger type="button" value="mine">
          Mis ejercicios
        </TabsTrigger>
        <TabsTrigger type="button" value="club">
          Club
        </TabsTrigger>
      </TabsList>

      <ExerciseLibraryListToolbar
        onClearStrategyFilter={clearStrategyFilter}
        onSearchChange={setSearch}
        onSortKeyChange={setSortKey}
        onStrategyFilterChange={setStrategyFilter}
        search={search}
        sortKey={sortKey}
        strategyFilter={strategyFilter}
      />

      <TabsContent className="mt-0 space-y-6 outline-none" value="mine">
        <ExerciseLibraryTabPanel {...panelProps} scope="mine" />
      </TabsContent>
      <TabsContent className="mt-0 space-y-6 outline-none" value="club">
        <ExerciseLibraryTabPanel {...panelProps} scope="club" />
      </TabsContent>
    </Tabs>
  );
}
