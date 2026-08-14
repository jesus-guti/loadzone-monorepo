"use client";

import {
  BODY_MAP_PUBLIC_ASSET_PATHS,
  bodyRegionCatalog,
  type BodyMapView,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import { cn } from "@repo/design-system/lib/utils";
import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
type BodyMapProperties = {
  readonly selectedIds: ReadonlySet<BodyRegionCatalogId>;
  readonly onToggle: (id: BodyRegionCatalogId) => void;
  readonly onRemove: (id: BodyRegionCatalogId) => void;
  readonly view: BodyMapView;
  readonly onViewChange: (view: BodyMapView) => void;
  readonly showError?: boolean;
};

export function BodyMap({
  selectedIds,
  onToggle,
  onRemove,
  view,
  onViewChange,
  showError = false,
}: BodyMapProperties) {
  const regions = bodyRegionCatalog.regions.filter(
    (region) => region.view === view
  );
  const assetSrc =
    view === "front"
      ? BODY_MAP_PUBLIC_ASSET_PATHS.front
      : BODY_MAP_PUBLIC_ASSET_PATHS.back;

  return (
    <div className="space-y-3">
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
          onClick={() => onViewChange("front")}
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
          onClick={() => onViewChange("back")}
        >
          Espalda
        </button>
      </div>

      <div
        className="relative mx-auto w-full max-w-sm self-start overflow-hidden rounded-md border border-border-secondary bg-bg-secondary"
        style={{
          aspectRatio: `${bodyRegionCatalog.assets.width} / ${bodyRegionCatalog.assets.height}`,
        }}
      >
        <Image
          src={assetSrc}
          alt={
            view === "front"
              ? "Mapa corporal frente"
              : "Mapa corporal espalda"
          }
          fill
          className="pointer-events-none select-none object-contain"
          draggable={false}
          sizes="(max-width: 384px) 100vw, 384px"
          priority
        />
        <div className="absolute inset-0">
          {regions.map((region) => {
            const selected = selectedIds.has(region.id);
            const diameter = region.hotspot.r * 2;
            return (
              <button
                key={region.id}
                type="button"
                title={region.labelEs}
                aria-label={region.labelEs}
                aria-pressed={selected}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors",
                  selected
                    ? "border-brand bg-brand/35"
                    : "border-transparent bg-brand/10 hover:bg-brand/20"
                )}
                style={{
                  left: `${region.hotspot.cx}%`,
                  top: `${region.hotspot.cy}%`,
                  width: `${diameter}%`,
                  aspectRatio: "1",
                }}
                onClick={() => onToggle(region.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-live="polite">
        {selectedIds.size === 0 ? (
          <span className="text-sm text-text-tertiary">
            Ninguna zona seleccionada
          </span>
        ) : (
          bodyRegionCatalog.regions
            .filter((region) => selectedIds.has(region.id))
            .map((region) => (
              <span
                key={region.id}
                className="inline-flex items-center gap-1 rounded-md border border-border-secondary bg-bg-secondary px-2 py-0.5 text-xs text-text-primary"
              >
                {region.labelEs}
                <button
                  type="button"
                  aria-label={`Quitar ${region.labelEs}`}
                  className="rounded-sm text-text-secondary hover:text-text-primary"
                  onClick={() => onRemove(region.id)}
                >
                  <XIcon className="size-3" weight="bold" />
                </button>
              </span>
            ))
        )}
      </div>

      {showError ? (
        <p className="text-sm text-danger" role="alert">
          Selecciona al menos una zona
        </p>
      ) : null}
    </div>
  );
}
