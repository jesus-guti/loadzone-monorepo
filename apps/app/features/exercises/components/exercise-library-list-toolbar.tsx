"use client";

import { MagnifyingGlassIcon, SortAscendingIcon } from "@phosphor-icons/react";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import type { ReactElement } from "react";
import {
  EXERCISE_LIBRARY_FILTER_NONE,
  EXERCISE_LIBRARY_GENERAL_SORT_OPTIONS,
  getExerciseLibraryFilterValueOptions,
} from "../exercise-library-sort-filter";
import type { ExerciseLibrarySortKey } from "../types";

type ExerciseLibraryListToolbarProps = {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly strategyFilter: string;
  readonly onStrategyFilterChange: (value: string) => void;
  readonly onClearStrategyFilter: () => void;
  readonly sortKey: ExerciseLibrarySortKey;
  readonly onSortKeyChange: (value: ExerciseLibrarySortKey) => void;
};

const STRATEGY_OPTIONS = getExerciseLibraryFilterValueOptions("strategy");

export function ExerciseLibraryListToolbar({
  search,
  onSearchChange,
  strategyFilter,
  onStrategyFilterChange,
  onClearStrategyFilter,
  sortKey,
  onSortKeyChange,
}: ExerciseLibraryListToolbarProps): ReactElement {
  const strategyValueForSelect =
    strategyFilter === "" || strategyFilter === EXERCISE_LIBRARY_FILTER_NONE
      ? EXERCISE_LIBRARY_FILTER_NONE
      : strategyFilter;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
      <div className="relative min-w-0 flex-1 lg:max-w-xl border-b">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
          weight="regular"
        />
        <Input
          aria-label="Buscar ejercicios"
          className=" pl-10 shadow-none"
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          placeholder="Buscar por nombre, p. ej. rondo 4x4"
          type="search"
          value={search}
        />
      </div>

      <div className="ml-auto mr-0 flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end lg:min-w-0">
        <Select
          onValueChange={(next) => {
            if (next === EXERCISE_LIBRARY_FILTER_NONE) {
              onClearStrategyFilter();
              return;
            }
            onStrategyFilterChange(next);
          }}
          value={strategyValueForSelect}
        >
          <SelectTrigger
            aria-label="Filtrar por estrategia"
            className="min-w-36 max-w-[min(100vw-2rem,14rem)] border-border-secondary font-medium text-text-primary shadow-none"
            size="sm"
          >
            <SelectValue placeholder="Estrategia" />
          </SelectTrigger>
          <SelectContent align="end" className="max-h-72">
            <SelectItem value={EXERCISE_LIBRARY_FILTER_NONE}>
              Todas las estrategias
            </SelectItem>
            {STRATEGY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => {
            onSortKeyChange(v as ExerciseLibrarySortKey);
          }}
          value={sortKey}
        >
          <SelectTrigger
            aria-label="Ordenar lista de ejercicios"
            className="min-w-30 max-w-48 truncate border-border-secondary font-medium text-text-primary shadow-none sm:min-w-32"
            size="sm"
          >
            <SortAscendingIcon
              aria-hidden
              className="size-4 shrink-0 text-text-secondary"
              weight="regular"
            />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent align="end" className="max-h-72">
            {EXERCISE_LIBRARY_GENERAL_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
