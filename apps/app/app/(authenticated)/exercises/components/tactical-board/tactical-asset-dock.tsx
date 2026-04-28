"use client";

import { Squares2X2Icon } from "@heroicons/react/20/solid";
import type { Editor } from "tldraw";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";

import {
  getTacticalAssetById,
  insertImageAssetCenterViewport,
  type TacticalAsset,
} from "./tactical-assets";

type TacticalAssetDockProps = {
  readonly editor: Editor | null;
  readonly favoriteIds: readonly string[];
  readonly onOpenLibrary: () => void;
  readonly className?: string;
};

export function TacticalAssetDock({
  editor,
  favoriteIds,
  onOpenLibrary,
  className,
}: TacticalAssetDockProps): React.JSX.Element {
  const handleFavoriteTap = async (asset: TacticalAsset): Promise<void> => {
    if (!editor) {
      return;
    }

    await insertImageAssetCenterViewport(editor, asset);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    asset: TacticalAsset
  ): void => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-loadzone-asset", asset.id);
    event.dataTransfer.setData("text/plain", asset.id);
  };

  return (
    <div
      className={cn(
        "glass-surface shadow-floating flex shrink-0 items-center gap-2 border-t border-border-primary bg-bg-primary/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 touch-pan-x gap-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        {favoriteIds.map((assetId) => {
          const asset = getTacticalAssetById(assetId);

          if (!asset) {
            return null;
          }

          return (
            <Button
              aria-label={`Insertar ${asset.label}`}
              className="size-12 shrink-0 touch-manipulation"
              draggable
              key={asset.id}
              onClick={() => void handleFavoriteTap(asset)}
              onDragStart={(event) => handleDragStart(event, asset)}
              size="icon"
              type="button"
              variant="outline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- public SVG previews */}
              <img
                alt=""
                className="size-8 select-none object-contain"
                draggable={false}
                height={Math.min(asset.height, 32)}
                src={asset.previewSrc}
                width={Math.min(asset.width, 32)}
              />
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Abrir biblioteca táctica"
        className="size-12 shrink-0 touch-manipulation"
        onClick={onOpenLibrary}
        size="icon"
        type="button"
        variant="secondary"
      >
        <Squares2X2Icon className="size-6" />
      </Button>
    </div>
  );
}
