"use client";

import {
  BODY_MAP_PUBLIC_ASSET_PATHS,
  bodyRegionById,
  bodyRegionCatalog,
  type BodyMapView,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@repo/design-system/lib/utils";
import { useState } from "react";
import {
  countRegionsByYear,
  filterHistoryList,
  formatInjuryDateRangeEs,
  listInjuryYears,
  type HistoryInjuryEpisode,
  type YearFilter,
} from "../lib/injury-history-filters";
import type { InjuryListItem } from "../types";

type InjuryHistoryMapProperties = {
  readonly injuries: readonly InjuryListItem[];
};

function toHistoryEpisodes(
  injuries: readonly InjuryListItem[]
): HistoryInjuryEpisode[] {
  return injuries.map((injury) => ({
    id: injury.id,
    startDate: injury.startDate,
    endDate: injury.endDate,
    cause: injury.cause,
    regionIds: injury.regionIds,
    regionLabels: injury.regionLabels,
  }));
}

export function InjuryHistoryMap({ injuries }: InjuryHistoryMapProperties) {
  const episodes = toHistoryEpisodes(injuries);
  const years = listInjuryYears(episodes);

  const [yearFilter, setYearFilter] = useState<YearFilter>("total");
  const [regionFilter, setRegionFilter] =
    useState<BodyRegionCatalogId | null>(null);
  const [view, setView] = useState<BodyMapView>("front");

  const regionCounts = countRegionsByYear(episodes, yearFilter);
  const listItems = filterHistoryList(episodes, yearFilter, regionFilter);

  const viewRegions = bodyRegionCatalog.regions.filter(
    (region) => region.view === view
  );
  const assetSrc =
    view === "front"
      ? BODY_MAP_PUBLIC_ASSET_PATHS.front
      : BODY_MAP_PUBLIC_ASSET_PATHS.back;

  const activeRegionLabel =
    regionFilter !== null
      ? (bodyRegionById.get(regionFilter)?.labelEs ?? regionFilter)
      : null;

  function selectYear(next: YearFilter): void {
    setYearFilter(next);
    setRegionFilter(null);
  }

  function toggleRegion(id: BodyRegionCatalogId): void {
    setRegionFilter((current) => (current === id ? null : id));
  }

  return (
    <section className="space-y-4" aria-labelledby="injury-history-heading">
      <h2
        id="injury-history-heading"
        className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary"
      >
        Historial de lesiones
      </h2>

      <div
        className="inline-flex flex-wrap gap-1 rounded-md border border-border-secondary p-0.5"
        role="tablist"
        aria-label="Periodo"
      >
        <YearTab
          label="Total"
          active={yearFilter === "total"}
          onSelect={() => selectYear("total")}
        />
        {years.map((year) => (
          <YearTab
            key={year}
            label={String(year)}
            active={yearFilter === year}
            onSelect={() => selectYear(year)}
          />
        ))}
      </div>

      <div
        className="inline-flex rounded-md border border-border-secondary p-0.5"
        role="tablist"
        aria-label="Vista del cuerpo"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "front"}
          className={cn(
            "min-h-9 rounded-sm px-3 text-sm font-medium transition-colors",
            view === "front"
              ? "bg-bg-secondary text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          )}
          onClick={() => setView("front")}
        >
          Frente
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "back"}
          className={cn(
            "min-h-9 rounded-sm px-3 text-sm font-medium transition-colors",
            view === "back"
              ? "bg-bg-secondary text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          )}
          onClick={() => setView("back")}
        >
          Espalda
        </button>
      </div>

      {activeRegionLabel !== null ? (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1 rounded-md border border-border-secondary bg-bg-secondary px-2 py-0.5 text-xs text-text-primary">
            Zona: {activeRegionLabel}
            <button
              type="button"
              aria-label="Quitar filtro de zona"
              className="rounded-sm text-text-secondary hover:text-text-primary"
              onClick={() => setRegionFilter(null)}
            >
              <XIcon className="size-3" weight="bold" />
            </button>
          </span>
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-md border border-border-secondary bg-bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element -- static public body-map asset */}
        <img
          src={assetSrc}
          alt={
            view === "front"
              ? "Mapa corporal frente"
              : "Mapa corporal espalda"
          }
          width={bodyRegionCatalog.assets.width}
          height={bodyRegionCatalog.assets.height}
          className="block h-auto w-full select-none"
          draggable={false}
        />
        <div className="absolute inset-0">
          {viewRegions.map((region) => {
            const count = regionCounts.get(region.id) ?? 0;
            if (count === 0) {
              return null;
            }
            const active = regionFilter === region.id;
            return (
              <button
                key={region.id}
                type="button"
                title={`${region.labelEs}: ${count}`}
                aria-label={`${region.labelEs}: ${count}`}
                aria-pressed={active}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors",
                  active
                    ? "border-danger bg-danger/30"
                    : "border-danger/60 bg-danger/15 hover:bg-danger/25"
                )}
                style={{
                  left: `${region.hotspot.cx}%`,
                  top: `${region.hotspot.cy}%`,
                  width: `${region.hotspot.r * 2}%`,
                  aspectRatio: "1",
                }}
                onClick={() => toggleRegion(region.id)}
              >
                <span className="absolute left-1/2 top-0 flex min-w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Histórico
        </h3>
        {listItems.length === 0 ? (
          <p className="px-1 text-sm text-text-tertiary">
            Sin lesiones en este periodo
          </p>
        ) : (
          <ul className="divide-y divide-border-secondary border-t border-border-secondary">
            {listItems.map((injury) => (
              <li key={injury.id} className="flex gap-3 py-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-danger"
                  aria-hidden="true"
                />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-text-primary">
                    {injury.cause}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatInjuryDateRangeEs(injury.startDate, injury.endDate)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {injury.regionLabels.join(", ") || "Sin zona"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function YearTab({
  label,
  active,
  onSelect,
}: {
  readonly label: string;
  readonly active: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "min-h-9 rounded-sm px-3 text-sm font-medium transition-colors",
        active
          ? "bg-bg-secondary text-text-primary"
          : "text-text-secondary hover:text-text-primary"
      )}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
