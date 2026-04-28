"use client";

import Fuse from "fuse.js";
import { HeartIcon } from "@heroicons/react/20/solid";
import type { Editor } from "tldraw";
import { useMemo, useState } from "react";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { cn } from "@repo/design-system/lib/utils";

import {
  ALL_PLACEABLE_ASSETS,
  BACKGROUNDS,
  getTacticalAssetById,
  insertImageAssetCenterViewport,
  insertOrReplaceFieldShape,
  type TacticalAsset,
} from "./tactical-assets";
import { toggleFavoriteId } from "./tactical-favorites";

type TacticalAssetLibraryProps = {
  readonly editor: Editor | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly favoriteIds: readonly string[];
  readonly onFavoriteIdsChange: (ids: readonly string[]) => void;
};

export function TacticalAssetLibrary({
  editor,
  open,
  onOpenChange,
  favoriteIds,
  onFavoriteIdsChange,
}: TacticalAssetLibraryProps): React.JSX.Element {
  const [query, setQuery] = useState<string>("");

  const fuse = useMemo(
    () =>
      new Fuse(ALL_PLACEABLE_ASSETS, {
        keys: ["label", "id"],
        threshold: 0.35,
      }),
    []
  );

  const filteredAssets = useMemo((): TacticalAsset[] => {
    const trimmed = query.trim();

    if (!trimmed) {
      return ALL_PLACEABLE_ASSETS;
    }

    return fuse.search(trimmed).map((result) => result.item);
  }, [fuse, query]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const handleToggleFavorite = (assetId: string): void => {
    onFavoriteIdsChange(toggleFavoriteId(favoriteIds, assetId));
  };

  const handleInsertAsset = async (asset: TacticalAsset): Promise<void> => {
    if (!editor) {
      return;
    }

    await insertImageAssetCenterViewport(editor, asset);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        side="bottom"
      >
        <SheetHeader className="border-b border-border-primary px-4 pb-3 pt-6 text-left">
          <SheetTitle>Biblioteca táctica</SheetTitle>
          <SheetDescription>
            Busca elementos, marca favoritos y elige el campo de fondo.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 pb-6 pt-3">
          <Input
            aria-label="Buscar en la biblioteca"
            className="shrink-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar…"
            type="search"
            value={query}
          />

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Campo
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BACKGROUNDS.map((bg) => (
                  <button
                    className="flex flex-col items-center gap-1 rounded-md border border-border-secondary p-2 text-center text-xs transition-colors hover:bg-bg-secondary"
                    key={bg.id}
                    onClick={() => {
                      if (editor) {
                        insertOrReplaceFieldShape(editor, bg.id);
                        onOpenChange(false);
                      }
                    }}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-12 w-full object-contain"
                      height={48}
                      src={bg.previewSrc}
                      width={64}
                    />
                    <span className="line-clamp-2 text-text-secondary">
                      {bg.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Jugadores y material
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredAssets.map((asset) => {
                  const isFavorite = favoriteSet.has(asset.id);

                  return (
                    <li key={asset.id}>
                      <div className="flex items-center gap-2 rounded-md border border-border-secondary bg-bg-secondary/60 p-2">
                        <button
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          onClick={() => void handleInsertAsset(asset)}
                          type="button"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            className="size-10 shrink-0 object-contain"
                            height={40}
                            src={asset.previewSrc}
                            width={40}
                          />
                          <span className="truncate text-sm text-text-primary">
                            {asset.label}
                          </span>
                        </button>

                        <Button
                          aria-label={
                            isFavorite
                              ? "Quitar de favoritos"
                              : "Añadir a favoritos"
                          }
                          className="size-9 shrink-0"
                          onClick={() => handleToggleFavorite(asset.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <HeartIcon
                            className={
                              isFavorite
                                ? "size-5 text-brand"
                                : "size-5 text-text-tertiary opacity-55"
                            }
                          />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {filteredAssets.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No hay resultados para esa búsqueda.
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
