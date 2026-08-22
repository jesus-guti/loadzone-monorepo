"use client";

import { XIcon } from "@phosphor-icons/react";
import {
  BODY_MAP_PUBLIC_ASSET_PATHS,
  type BodyMapView,
  bodyRegionById,
  bodyRegionCatalog,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import { cn } from "@repo/design-system/lib/utils";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import {
  type InjuryActionResult,
  reopenInjury,
} from "../actions/injury-actions";
import {
  countRegionsByYear,
  filterHistoryList,
  formatInjuryDateRangeEs,
  type HistoryInjuryEpisode,
  listInjuryYears,
  type YearFilter,
} from "../lib/injury-history-filters";
import type { InjuryListItem } from "../types";
import { CloseInjuryDialog } from "./close-injury-dialog";
import { DeleteInjuryButton } from "./delete-injury-button";
import { InjuryLogForm } from "./injury-log-form";

type PanelMode =
  | { kind: "profile" }
  | { kind: "create" }
  | { kind: "edit"; injury: InjuryListItem };

type PlayerInjuriesPanelProperties = {
  readonly playerId: string;
  readonly todayCivil: string;
  readonly openInjuries: readonly InjuryListItem[];
  readonly closedInjuries: readonly InjuryListItem[];
  readonly allInjuries: readonly InjuryListItem[];
};

const emptyResult: InjuryActionResult = { success: false };

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

function SectionTitle({
  children,
  action,
}: {
  readonly children: React.ReactNode;
  readonly action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-border-secondary/60 border-b pb-2">
      <h3 className="font-semibold text-base text-text-primary">{children}</h3>
      {action}
    </div>
  );
}

function ReopenButton({
  injuryId,
}: {
  readonly injuryId: string;
}): React.JSX.Element {
  const [state, formAction, pending] = useActionState(
    reopenInjury,
    emptyResult
  );

  useEffect(() => {
    if (state.success) toast.success("Lesión reabierta");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input name="injuryId" type="hidden" value={injuryId} />
      <Button disabled={pending} size="sm" type="submit" variant="ghost">
        {pending ? "Reabriendo…" : "Reabrir"}
      </Button>
    </form>
  );
}

function InjuryRow({
  injury,
  actions,
}: {
  readonly injury: InjuryListItem;
  readonly actions: React.ReactNode;
}): React.JSX.Element {
  return (
    <li className="flex flex-wrap items-center gap-3 border-border-secondary/50 border-b py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm text-text-primary">
          {injury.regionLabels.join(", ") || "Sin zona"}
        </p>
        <p className="truncate text-text-secondary text-xs">
          {injury.startDate}
          {injury.endDate ? ` → ${injury.endDate}` : ""} · {injury.cause}
          {injury.regionDetail ? ` · ${injury.regionDetail}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">{actions}</div>
    </li>
  );
}

export function PlayerInjuriesPanel({
  playerId,
  todayCivil,
  openInjuries,
  closedInjuries,
  allInjuries,
}: PlayerInjuriesPanelProperties): React.JSX.Element {
  const [mode, setMode] = useState<PanelMode>({ kind: "profile" });
  const [closing, setClosing] = useState<InjuryListItem | null>(null);
  const [view, setView] = useState<BodyMapView>("front");
  const [yearFilter, setYearFilter] = useState<YearFilter>("total");
  const [regionFilter, setRegionFilter] = useState<BodyRegionCatalogId | null>(
    null
  );

  if (mode.kind === "create" || mode.kind === "edit") {
    return (
      <InjuryLogForm
        initial={mode.kind === "edit" ? mode.injury : null}
        mode={mode.kind}
        onCancel={() => setMode({ kind: "profile" })}
        onSuccess={() => setMode({ kind: "profile" })}
        playerId={playerId}
        todayCivil={todayCivil}
      />
    );
  }

  const episodes = toHistoryEpisodes(allInjuries);
  const years = listInjuryYears(episodes);
  const regionCounts = countRegionsByYear(episodes, yearFilter);
  const historyItems = filterHistoryList(episodes, yearFilter, regionFilter);
  const viewRegions = bodyRegionCatalog.regions.filter(
    (region) => region.view === view
  );
  const assetSrc =
    view === "front"
      ? BODY_MAP_PUBLIC_ASSET_PATHS.front
      : BODY_MAP_PUBLIC_ASSET_PATHS.back;
  const activeRegionLabel =
    regionFilter === null
      ? null
      : (bodyRegionById.get(regionFilter)?.labelEs ?? regionFilter);

  const registerButton = (
    <Button onClick={() => setMode({ kind: "create" })} type="button">
      Registrar lesión
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="hidden items-center justify-between gap-3 md:flex">
        <p className="text-sm text-text-secondary">
          {openInjuries.length > 0
            ? `${openInjuries.length} lesión(es) abierta(s)`
            : "Sin lesiones abiertas"}
        </p>
        {registerButton}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-14">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div
            className="relative mx-auto w-full max-w-sm"
            style={{
              aspectRatio: `${bodyRegionCatalog.assets.width} / ${bodyRegionCatalog.assets.height}`,
            }}
          >
            <Image
              alt={
                view === "front"
                  ? "Mapa corporal frente"
                  : "Mapa corporal espalda"
              }
              className="pointer-events-none select-none object-contain [mask-image:radial-gradient(ellipse_78%_72%_at_50%_42%,#000_48%,transparent_78%)] [-webkit-mask-image:radial-gradient(ellipse_78%_72%_at_50%_42%,#000_48%,transparent_78%)]"
              draggable={false}
              fill
              sizes="(max-width: 384px) 100vw, 384px"
              src={assetSrc}
            />
            <div className="absolute inset-0">
              {viewRegions.map((region) => {
                const count = regionCounts.get(region.id) ?? 0;
                if (count === 0) return null;
                const active = regionFilter === region.id;
                return (
                  <button
                    aria-label={`${region.labelEs}: ${count}`}
                    aria-pressed={active}
                    className={cn(
                      "-translate-x-1/2 -translate-y-1/2 absolute rounded-full border-2 transition-colors",
                      active
                        ? "border-danger bg-danger/30"
                        : "border-danger/60 bg-danger/15 hover:bg-danger/25"
                    )}
                    key={region.id}
                    onClick={() =>
                      setRegionFilter((current) =>
                        current === region.id ? null : region.id
                      )
                    }
                    style={{
                      left: `${region.hotspot.cx}%`,
                      top: `${region.hotspot.cy}%`,
                      width: `${region.hotspot.r * 2}%`,
                      aspectRatio: "1",
                    }}
                    title={`${region.labelEs}: ${count}`}
                    type="button"
                  >
                    <span className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 flex min-w-5 items-center justify-center rounded-full bg-danger px-1 font-semibold text-[10px] text-white leading-4">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              aria-label="Vista del cuerpo"
              className="-translate-x-1/2 absolute bottom-2 left-1/2 inline-flex rounded-full bg-bg-primary/80 p-0.5 backdrop-blur"
              role="tablist"
            >
              {(
                [
                  ["front", "Frente"],
                  ["back", "Espalda"],
                ] as const
              ).map(([id, label]) => (
                <button
                  aria-selected={view === id}
                  className={cn(
                    "min-h-8 rounded-full px-4 font-medium text-sm transition-colors",
                    view === id
                      ? "bg-text-primary text-bg-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                  key={id}
                  onClick={() => setView(id)}
                  role="tab"
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeRegionLabel === null ? null : (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                Zona: {activeRegionLabel}
                <button
                  aria-label="Quitar filtro de zona"
                  className="text-text-tertiary hover:text-text-primary"
                  onClick={() => setRegionFilter(null)}
                  type="button"
                >
                  <XIcon className="size-3.5" weight="bold" />
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-12">
          <section className="space-y-1">
            <SectionTitle>Abiertas</SectionTitle>
            {openInjuries.length === 0 ? (
              <p className="py-3 text-sm text-text-tertiary">
                Sin lesiones abiertas
              </p>
            ) : (
              <ul>
                {openInjuries.map((injury) => (
                  <InjuryRow
                    actions={
                      <>
                        <Button
                          onClick={() => setMode({ kind: "edit", injury })}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => setClosing(injury)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Dar de alta
                        </Button>
                        <DeleteInjuryButton injury={injury} />
                      </>
                    }
                    injury={injury}
                    key={injury.id}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-1">
            <SectionTitle>Cerradas</SectionTitle>
            {closedInjuries.length === 0 ? (
              <p className="py-3 text-sm text-text-tertiary">
                Sin lesiones cerradas
              </p>
            ) : (
              <ul>
                {closedInjuries.map((injury) => (
                  <InjuryRow
                    actions={
                      <>
                        <Button
                          onClick={() => setMode({ kind: "edit", injury })}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Editar
                        </Button>
                        <ReopenButton injuryId={injury.id} />
                        <DeleteInjuryButton injury={injury} />
                      </>
                    }
                    injury={injury}
                    key={injury.id}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-1">
            <SectionTitle
              action={
                <div
                  aria-label="Periodo"
                  className="inline-flex flex-wrap gap-1"
                  role="tablist"
                >
                  {(["total", ...years] as YearFilter[]).map((option) => (
                    <button
                      aria-selected={yearFilter === option}
                      className={cn(
                        "min-h-8 rounded-full px-3 text-sm transition-colors",
                        yearFilter === option
                          ? "font-medium text-text-primary"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                      key={String(option)}
                      onClick={() => {
                        setYearFilter(option);
                        setRegionFilter(null);
                      }}
                      role="tab"
                      type="button"
                    >
                      {option === "total" ? "Total" : String(option)}
                    </button>
                  ))}
                </div>
              }
            >
              Historial
            </SectionTitle>
            {historyItems.length === 0 ? (
              <p className="py-3 text-sm text-text-tertiary">
                Sin lesiones en este periodo
              </p>
            ) : (
              <ul>
                {historyItems.map((injury) => (
                  <li
                    className="flex gap-3 border-border-secondary/50 border-b py-3 last:border-b-0"
                    key={injury.id}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-danger"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-medium text-sm text-text-primary">
                        {injury.cause}
                      </p>
                      <p className="text-text-secondary text-xs">
                        {formatInjuryDateRangeEs(
                          injury.startDate,
                          injury.endDate
                        )}
                      </p>
                      <p className="text-text-tertiary text-xs">
                        {injury.regionLabels.join(", ") || "Sin zona"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="fixed right-4 bottom-20 z-30 md:hidden">
        <Button
          className="rounded-full shadow-lg"
          onClick={() => setMode({ kind: "create" })}
          type="button"
        >
          Registrar lesión
        </Button>
      </div>

      <CloseInjuryDialog
        injury={closing}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setClosing(null);
        }}
        open={closing !== null}
        todayCivil={todayCivil}
      />
    </div>
  );
}
