"use client";

import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  SortAscendingIcon,
} from "@phosphor-icons/react";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import type { ReactElement } from "react";
import {
  EXERCISE_LIBRARY_FILTER_DIMENSIONS,
  EXERCISE_LIBRARY_FILTER_NONE,
  EXERCISE_LIBRARY_SORT_OPTIONS,
} from "../exercise-library-sort-filter";
import type { ExerciseLibrarySortKey } from "../types";

const SORT_GROUPS = ["General", "Por atributo"] as const;

type FilterValueOption = { readonly value: string; readonly label: string };

type ExerciseLibraryListToolbarProps = {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly filterDimension: string;
  readonly onFilterDimensionChange: (value: string) => void;
  readonly filterValue: string;
  readonly onFilterValueChange: (value: string) => void;
  readonly filterValueOptions: readonly FilterValueOption[];
  readonly hasActiveFilter: boolean;
  readonly onClearFilter: () => void;
  readonly sortKey: ExerciseLibrarySortKey;
  readonly onSortKeyChange: (value: ExerciseLibrarySortKey) => void;
};

export function ExerciseLibraryListToolbar({
  search,
  onSearchChange,
  filterDimension,
  onFilterDimensionChange,
  filterValue,
  onFilterValueChange,
  filterValueOptions,
  hasActiveFilter,
  onClearFilter,
  sortKey,
  onSortKeyChange,
}: ExerciseLibraryListToolbarProps): ReactElement {
  const valueSelectKey = filterDimension;
  const noValueOptions = filterValueOptions.length === 0;
  const valueDisabled =
    filterDimension === EXERCISE_LIBRARY_FILTER_NONE || noValueOptions;
  const filterValueForSelect = filterValue === "" ? undefined : filterValue;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
      <div className="relative min-w-0 flex-1 lg:max-w-xl">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
          weight="regular"
        />
        <Input
          aria-label="Buscar ejercicios"
          className="border-border-secondary bg-bg-secondary pl-10 shadow-none"
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          placeholder="Buscar por nombre, p. ej. rondo 4x4"
          type="search"
          value={search}
        />
      </div>

      <div className="ml-auto mr-0 flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end lg:min-w-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Filtrar por categoría y valor"
              className={hasActiveFilter ? "border-brand/50 bg-brand/5" : ""}
              size="sm"
              type="button"
              variant="ghost"
            >
              <FunnelSimpleIcon
                className="size-6 text-text-secondary"
                weight="regular"
              />
              <span className="hidden sm:inline">Filtrar por</span>
              {hasActiveFilter === true ? (
                <Badge
                  className="ml-0.5 h-5 min-w-5 justify-center px-1"
                  variant="secondary"
                >
                  1
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(100vw-2rem,22rem)] p-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-text-secondary">
                  Dimensión
                </p>
                <Select
                  onValueChange={(next) => {
                    onFilterDimensionChange(next);
                    onFilterValueChange("");
                  }}
                  value={filterDimension}
                >
                  <SelectTrigger
                    className="w-full border-border-secondary shadow-none"
                    size="sm"
                  >
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EXERCISE_LIBRARY_FILTER_NONE}>
                      Sin filtro
                    </SelectItem>
                    {EXERCISE_LIBRARY_FILTER_DIMENSIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-text-secondary">Valor</p>
                <Select
                  disabled={valueDisabled}
                  key={valueSelectKey}
                  onValueChange={onFilterValueChange}
                  value={filterValueForSelect}
                >
                  <SelectTrigger
                    className="w-full border-border-secondary shadow-none"
                    size="sm"
                  >
                    <SelectValue placeholder="Elige un valor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {filterValueOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilter === true ? (
                <Button
                  className="w-full"
                  onClick={onClearFilter}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Quitar filtro
                </Button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>

        <Select
          onValueChange={(v) => {
            onSortKeyChange(v as ExerciseLibrarySortKey);
          }}
          value={sortKey}
        >
          <SelectTrigger
            aria-label="Ordenar lista de ejercicios"
            className="min-w-30 max-w-48 truncate border-border-secondary shadow-none sm:min-w-32 text-text-primary font-medium"
            size="default"
          >
            <SortAscendingIcon
              aria-hidden
              className="size-6 shrink-0 text-text-secondary"
              weight="regular"
            />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent align="end" className="max-h-72">
            {SORT_GROUPS.map((group) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {EXERCISE_LIBRARY_SORT_OPTIONS.filter(
                  (o) => o.group === group
                ).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
