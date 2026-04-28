"use client";

import "tldraw/tldraw.css";

import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  Tldraw,
  type Editor,
  type TLComponents,
  type TLEditorSnapshot,
} from "tldraw";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { TacticalAssetDock } from "./tactical-asset-dock";
import { TacticalAssetLibrary } from "./tactical-asset-library";
import {
  getTacticalAssetById,
  insertImageAssetAtPoint,
  insertOrReplaceFieldShape,
} from "./tactical-assets";
import {
  DEFAULT_BACKGROUND_ID,
  type BackgroundId,
} from "./tactical-board-types";
import {
  DEFAULT_FAVORITE_IDS,
  loadFavoriteIds,
  saveFavoriteIds,
} from "./tactical-favorites";

const normalizeBackgroundId = (raw: string | undefined): BackgroundId => {
  const legacy: Record<string, BackgroundId> = {
    "full-field": "bg-full-field",
    "half-field": "bg-half-field",
    "penalty-area": "bg-penalty-area",
    "futsal-court": "bg-futsal-court",
  };

  if (!raw) {
    return DEFAULT_BACKGROUND_ID;
  }

  if (raw in legacy) {
    return legacy[raw];
  }

  if (
    raw === "bg-full-field" ||
    raw === "bg-half-field" ||
    raw === "bg-penalty-area" ||
    raw === "bg-futsal-court"
  ) {
    return raw;
  }

  return DEFAULT_BACKGROUND_ID;
}

type TacticalBoardProps = {
  readonly defaultBackground?: BackgroundId | string;
  readonly className?: string;
  readonly name?: string;
  readonly defaultValue?: string;
};

export function TacticalBoard({
  defaultBackground,
  className,
  name,
  defaultValue,
}: TacticalBoardProps): React.JSX.Element {
  const normalizedDefault = normalizeBackgroundId(
    defaultBackground === undefined ? undefined : String(defaultBackground)
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<TLEditorSnapshot | null>(
    defaultValue ? JSON.parse(defaultValue) : null
  );

  const handleOpenBoard = useCallback((): void => {
    setEditor(null);
    setSessionKey((currentSessionKey) => currentSessionKey + 1);
    setIsOpen(true);
  }, []);

  const handleCloseBoard = useCallback((): void => {
    setIsOpen(false);
    setEditor(null);
  }, []);

  const handleSaveBoard = useCallback((): void => {
    if (!editor) {
      return;
    }

    setSavedSnapshot(editor.getSnapshot());
    setIsOpen(false);
    setEditor(null);
  }, [editor]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {name && (
        <input
          name={name}
          type="hidden"
          value={savedSnapshot ? JSON.stringify(savedSnapshot) : ""}
        />
      )}
      <div
        className={cn(
          "rounded-md border border-border-secondary bg-bg-primary p-4",
          className
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <PencilSquareIcon className="size-4 text-text-secondary" />
              <span>Pizarra táctica</span>
            </div>
            <p className="text-sm text-text-secondary">
              Abre la pizarra en pantalla completa para editar el croquis.
            </p>
            <p className="text-xs text-text-tertiary">
              {savedSnapshot
                ? "Croquis guardado en este formulario."
                : "Todavía no hay un croquis guardado."}
            </p>
          </div>

          <Button onClick={handleOpenBoard} type="button">
            {savedSnapshot ? "Editar pizarra" : "Abrir pizarra"}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-70 bg-bg-secondary">
          <div className="flex h-dvh w-screen flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-end gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <Button
                className="pointer-events-auto shadow-floating"
                onClick={handleCloseBoard}
                size="sm"
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                className="pointer-events-auto shadow-floating"
                disabled={!editor}
                onClick={handleSaveBoard}
                size="sm"
                type="button"
              >
                Guardar croquis
              </Button>
            </div>

            <div className="min-h-0 flex-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <TacticalBoardCanvas
                key={sessionKey}
                className="h-full border-none rounded-none"
                defaultBackground={normalizedDefault}
                onMount={setEditor}
                snapshot={savedSnapshot}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type TacticalBoardCanvasProps = {
  readonly defaultBackground: BackgroundId;
  readonly className?: string;
  readonly snapshot: TLEditorSnapshot | null;
  readonly onMount: (editor: Editor | null) => void;
};

function TacticalBoardCanvas({
  defaultBackground,
  className,
  snapshot,
  onMount,
}: TacticalBoardCanvasProps): React.JSX.Element {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [backgroundId, setBackgroundId] =
    useState<BackgroundId>(defaultBackground);
  const [libraryOpen, setLibraryOpen] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => [
    ...DEFAULT_FAVORITE_IDS,
  ]);
  const [favoritesHydrated, setFavoritesHydrated] = useState<boolean>(false);

  useEffect(() => {
    setFavoriteIds(loadFavoriteIds());
    setFavoritesHydrated(true);
  }, []);

  useEffect(() => {
    if (!favoritesHydrated) {
      return;
    }

    saveFavoriteIds(favoriteIds);
  }, [favoriteIds, favoritesHydrated]);

  useEffect(() => {
    setBackgroundId(defaultBackground);
  }, [defaultBackground]);

  useEffect(() => {
    return () => {
      onMount(null);
    };
  }, [onMount]);

  const components = useMemo<TLComponents>(
    () => ({
      MainMenu: null,
      PageMenu: null,
      NavigationPanel: null,
    }),
    []
  );

  const handleMount = useCallback(
    (nextEditor: Editor): void => {
      setEditor(nextEditor);

      if (!snapshot) {
        insertOrReplaceFieldShape(nextEditor, defaultBackground);
      }

      onMount(nextEditor);
    },
    [defaultBackground, onMount, snapshot]
  );

  const handleFavoriteIdsChange = useCallback((ids: readonly string[]): void => {
    setFavoriteIds([...ids]);
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      if (!editor) {
        return;
      }

      if (event.dataTransfer.types.includes("application/x-loadzone-asset")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    },
    [editor]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      if (!editor) {
        return;
      }

      const assetId = event.dataTransfer.getData("application/x-loadzone-asset");
      const asset = getTacticalAssetById(assetId);

      if (!asset) {
        return;
      }

      event.preventDefault();
      void insertImageAssetAtPoint(
        editor,
        asset,
        editor.screenToPage({ x: event.clientX, y: event.clientY })
      );
    },
    [editor]
  );

  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden rounded-md border border-border-primary bg-bg-secondary",
        className
      )}
    >
      <div
        className="relative min-h-0 flex-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Tldraw
          autoFocus={false}
          components={components}
          onMount={handleMount}
          options={{ maxPages: 1 }}
          snapshot={snapshot ?? undefined}
        />
      </div>

      <TacticalAssetDock
        editor={editor}
        favoriteIds={favoriteIds}
        onOpenLibrary={() => setLibraryOpen(true)}
      />

      <TacticalAssetLibrary
        editor={editor}
        favoriteIds={favoriteIds}
        onFavoriteIdsChange={handleFavoriteIdsChange}
        onOpenChange={setLibraryOpen}
        open={libraryOpen}
      />
    </div>
  );
}
