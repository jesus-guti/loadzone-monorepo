"use client";

import { toast } from "@repo/design-system/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { useIsMobile } from "@repo/design-system/hooks/use-mobile";
import { cn } from "@repo/design-system/lib/utils";
import { XMarkIcon } from "@heroicons/react/20/solid";
import type Konva from "konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Arrow,
  Circle,
  Group,
  Layer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Text,
} from "react-konva";
import { TACTICS_HELP_HINT_TIMEOUT_MS } from "@/lib/durations";
import { Toolbar } from "./toolbar";
import {
  type ArrowElement,
  type BallElement,
  type BoardElement,
  type BoardPoint,
  type BoardTool,
  type DrawingElement,
  type EquipmentElement,
  getActiveFrame,
  type PitchView,
  type PlayerElement,
  useBoardStore,
} from "./use-board-store";

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 780;
const FIELD_PADDING = 48;
const MIN_SCALE = 0.45;
const MAX_SCALE = 3.5;
const PLAYER_RADIUS = 22;
const FINGER_OFFSET = 64;

type Viewport = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

type BoardSize = {
  readonly width: number;
  readonly height: number;
};

type DraftShape =
  | {
      readonly kind: "free-draw";
      readonly points: readonly number[];
    }
  | {
      readonly kind: "pass-arrow" | "run-arrow";
      readonly points: readonly number[];
    };

type PinchState = {
  readonly distance: number;
  readonly center: BoardPoint;
  readonly viewport: Viewport;
};

type SelectionBox = {
  readonly start: BoardPoint;
  readonly current: BoardPoint;
};

type ElementBounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

type BoardKeyboardActions = {
  readonly setActiveTool: (tool: BoardTool) => void;
  readonly setIsSpacePressed: (isPressed: boolean) => void;
  readonly rotateSelectedElements: () => void;
  readonly removeSelectedElements: () => void;
  readonly clearSelection: () => void;
};

const shortcutToolMap: Record<string, BoardTool> = {
  v: "select",
  "1": "home-player",
  "2": "away-player",
  "3": "ball",
  "4": "cone",
  "5": "pole",
  "6": "mini-goal",
  "7": "free-draw",
  "8": "pass-arrow",
  "9": "run-arrow",
  "0": "eraser",
};

const helpHintClassName = [
  "pointer-events-none",
  "absolute",
  "top-4",
  "left-1/2",
  "z-30",
  "max-w-[calc(100%-2rem)]",
  "-translate-x-1/2",
  "rounded-full",
  "border",
  "border-border-primary",
  "bg-bg-primary/90",
  "px-4",
  "py-2",
  "text-center",
  "text-xs",
  "text-text-secondary",
  "shadow-floating",
  "backdrop-blur",
  "transition-opacity",
].join(" ");

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
};

const getSelectionBounds = (selectionBox: SelectionBox): ElementBounds => ({
  minX: Math.min(selectionBox.start.x, selectionBox.current.x),
  minY: Math.min(selectionBox.start.y, selectionBox.current.y),
  maxX: Math.max(selectionBox.start.x, selectionBox.current.x),
  maxY: Math.max(selectionBox.start.y, selectionBox.current.y),
});

const getElementBounds = (element: BoardElement): ElementBounds => {
  if (element.type === "drawing" || element.type === "arrow") {
    const xs = element.points.filter((_, index) => index % 2 === 0);
    const ys = element.points.filter((_, index) => index % 2 === 1);

    return {
      minX: Math.min(...xs) + element.x,
      minY: Math.min(...ys) + element.y,
      maxX: Math.max(...xs) + element.x,
      maxY: Math.max(...ys) + element.y,
    };
  }

  const radius = element.type === "player" ? 32 : 28;

  return {
    minX: element.x - radius,
    minY: element.y - radius,
    maxX: element.x + radius,
    maxY: element.y + radius,
  };
};

const boundsIntersect = (
  first: ElementBounds,
  second: ElementBounds
): boolean =>
  first.minX <= second.maxX &&
  first.maxX >= second.minX &&
  first.minY <= second.maxY &&
  first.maxY >= second.minY;

const handleBoardShortcut = (
  event: KeyboardEvent,
  actions: BoardKeyboardActions
): void => {
  if (isEditableTarget(event.target)) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    actions.setIsSpacePressed(true);
    return;
  }

  const tool = shortcutToolMap[event.key.toLowerCase()];

  if (tool) {
    event.preventDefault();
    actions.setActiveTool(tool);
    return;
  }

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    actions.rotateSelectedElements();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    actions.removeSelectedElements();
    return;
  }

  if (event.key === "Escape") {
    actions.clearSelection();
  }
};

const getTouchDistance = (touches: TouchList): number => {
  if (touches.length < 2) {
    return 0;
  }

  const first = touches[0];
  const second = touches[1];

  return Math.hypot(
    first.clientX - second.clientX,
    first.clientY - second.clientY
  );
};

const getTouchCenter = (touches: TouchList): BoardPoint => {
  if (touches.length < 2) {
    return { x: 0, y: 0 };
  }

  const first = touches[0];
  const second = touches[1];

  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
};

const createPlayerElement = (
  team: PlayerElement["team"],
  point: BoardPoint,
  number: number
): Omit<PlayerElement, "id"> => ({
  type: "player",
  team,
  number,
  x: point.x,
  y: point.y,
});

const createBallElement = (point: BoardPoint): Omit<BallElement, "id"> => ({
  type: "ball",
  x: point.x,
  y: point.y,
});

const createEquipmentElement = (
  kind: EquipmentElement["kind"],
  point: BoardPoint
): Omit<EquipmentElement, "id"> => ({
  type: "equipment",
  kind,
  x: point.x,
  y: point.y,
});

const createDrawingElement = (
  points: readonly number[]
): Omit<DrawingElement, "id"> => ({
  type: "drawing",
  x: 0,
  y: 0,
  points,
  stroke: "#f8fafc",
  strokeWidth: 5,
});

const createArrowElement = (
  variant: ArrowElement["variant"],
  points: readonly number[]
): Omit<ArrowElement, "id"> => ({
  type: "arrow",
  x: 0,
  y: 0,
  points,
  variant,
});

type TacticsBoardProps = {
  readonly initialData?: string;
  readonly onClose?: () => void;
  readonly onSave?: (data: string) => void;
};

function buildBoardModel() {
  const state = useBoardStore.getState();

  return {
    version: 1 as const,
    pitchView: state.pitchView,
    teamColors: state.teamColors,
    notes: state.notes,
    frames: state.frames,
  };
}

function serializeBoardModel(model: ReturnType<typeof buildBoardModel>): string {
  return JSON.stringify(model);
}

export function TacticsBoard({
  initialData,
  onClose,
  onSave,
}: TacticsBoardProps = {}) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const panRef = useRef<BoardPoint | null>(null);
  const lastTouchAtRef = useRef(0);
  const [size, setSize] = useState<BoardSize>({ width: 0, height: 0 });
  const [viewport, setViewport] = useState<Viewport>({
    x: FIELD_PADDING,
    y: FIELD_PADDING,
    scale: 1,
  });
  const [draft, setDraft] = useState<DraftShape | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [showHelpHint, setShowHelpHint] = useState(true);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [touchDrag, setTouchDrag] = useState<{
    readonly id: string;
    readonly point: BoardPoint;
  } | null>(null);

  const activeTool = useBoardStore((state) => state.activeTool);
  const pitchView = useBoardStore((state) => state.pitchView);
  const selectedElementIds = useBoardStore((state) => state.selectedElementIds);
  const frame = useBoardStore(getActiveFrame);
  const teamColors = useBoardStore((state) => state.teamColors);
  const addElement = useBoardStore((state) => state.addElement);
  const updateElement = useBoardStore((state) => state.updateElement);
  const updateElementPosition = useBoardStore(
    (state) => state.updateElementPosition
  );
  const removeElement = useBoardStore((state) => state.removeElement);
  const removeSelectedElements = useBoardStore(
    (state) => state.removeSelectedElements
  );
  const rotateSelectedElements = useBoardStore(
    (state) => state.rotateSelectedElements
  );
  const setActiveTool = useBoardStore((state) => state.setActiveTool);
  const setSelectedElementIds = useBoardStore(
    (state) => state.setSelectedElementIds
  );
  const loadBoard = useBoardStore((state) => state.loadBoard);

  const normalizedInitialData = useMemo(() => {
    if (!initialData) {
      return serializeBoardModel(buildBoardModel());
    }

    try {
      return JSON.stringify(JSON.parse(initialData));
    } catch {
      return initialData;
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      return;
    }

    try {
      const parsed = JSON.parse(initialData);
      loadBoard(parsed);
    } catch (error) {
      console.error("Failed to load initial board data", error);
    }
  }, [initialData, loadBoard]);

  const handleSave = useCallback(() => {
    if (!onSave) {
      return;
    }

    onSave(serializeBoardModel(buildBoardModel()));
  }, [onSave]);

  const currentBoardData = serializeBoardModel(buildBoardModel());
  const hasUnsavedChanges = currentBoardData !== normalizedInitialData;

  const handleRequestClose = useCallback(() => {
    if (!onClose) {
      return;
    }

    if (hasUnsavedChanges) {
      setIsCloseDialogOpen(true);
      return;
    }

    onClose();
  }, [hasUnsavedChanges, onClose]);

  const handleConfirmSaveAndClose = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const nextHomeNumber = useMemo(
    () =>
      frame.elements.filter(
        (element) => element.type === "player" && element.team === "home"
      ).length + 1,
    [frame.elements]
  );

  const nextAwayNumber = useMemo(
    () =>
      frame.elements.filter(
        (element) => element.type === "player" && element.team === "away"
      ).length + 1,
    [frame.elements]
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const applyRect = (width: number, height: number): void => {
      setSize({ width, height });
    };

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      applyRect(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);

    const bounds = container.getBoundingClientRect();
    if (bounds.width > 0 && bounds.height > 0) {
      applyRect(bounds.width, bounds.height);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setShowHelpHint(false),
      TACTICS_HELP_HINT_TIMEOUT_MS
    );

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleBoardShortcut(event, {
        setActiveTool,
        setIsSpacePressed,
        rotateSelectedElements,
        removeSelectedElements,
        clearSelection: () => setSelectedElementIds([]),
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    removeSelectedElements,
    rotateSelectedElements,
    setActiveTool,
    setSelectedElementIds,
  ]);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) {
      return;
    }

    const fitScale = Math.min(
      (size.width - FIELD_PADDING * 2) / FIELD_WIDTH,
      (size.height - FIELD_PADDING * 2) / FIELD_HEIGHT
    );
    const nextScale = clamp(fitScale, MIN_SCALE, MAX_SCALE);

    setViewport({
      scale: nextScale,
      x: (size.width - FIELD_WIDTH * nextScale) / 2,
      y: (size.height - FIELD_HEIGHT * nextScale) / 2,
    });
  }, [size.height, size.width]);

  const getBoardPoint = useCallback((): BoardPoint | null => {
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();

    if (!pointer) {
      return null;
    }

    return {
      x: (pointer.x - viewport.x) / viewport.scale,
      y: (pointer.y - viewport.y) / viewport.scale,
    };
  }, [viewport.scale, viewport.x, viewport.y]);

  const getLiftedTouchPoint = useCallback((): BoardPoint | null => {
    const point = getBoardPoint();

    if (!point) {
      return null;
    }

    return {
      x: point.x,
      y: point.y - FINGER_OFFSET / viewport.scale,
    };
  }, [getBoardPoint, viewport.scale]);

  const zoomAtPoint = useCallback(
    (screenPoint: BoardPoint, nextScale: number) => {
      setViewport((current) => {
        const boardPoint = {
          x: (screenPoint.x - current.x) / current.scale,
          y: (screenPoint.y - current.y) / current.scale,
        };

        return {
          scale: nextScale,
          x: screenPoint.x - boardPoint.x * nextScale,
          y: screenPoint.y - boardPoint.y * nextScale,
        };
      });
    },
    []
  );

  const addToolElement = useCallback(
    (tool: BoardTool, point: BoardPoint) => {
      if (tool === "home-player") {
        addElement(createPlayerElement("home", point, nextHomeNumber));
        return;
      }

      if (tool === "away-player") {
        addElement(createPlayerElement("away", point, nextAwayNumber));
        return;
      }

      if (tool === "ball") {
        addElement(createBallElement(point));
        return;
      }

      if (tool === "cone" || tool === "pole" || tool === "mini-goal") {
        addElement(createEquipmentElement(tool, point));
      }
    },
    [addElement, nextAwayNumber, nextHomeNumber]
  );

  const beginPinch = useCallback(
    (nativeEvent: TouchEvent): boolean => {
      lastTouchAtRef.current = Date.now();

      if (nativeEvent.touches.length !== 2) {
        return false;
      }

      nativeEvent.preventDefault();
      pinchRef.current = {
        distance: getTouchDistance(nativeEvent.touches),
        center: getTouchCenter(nativeEvent.touches),
        viewport,
      };

      return true;
    },
    [viewport]
  );

  const beginBoardAction = useCallback(
    (nativeEvent: MouseEvent | TouchEvent, point: BoardPoint) => {
      if (activeTool === "select") {
        if (nativeEvent instanceof MouseEvent && isSpacePressed) {
          panRef.current = { x: nativeEvent.clientX, y: nativeEvent.clientY };
          return;
        }

        setSelectionBox({ start: point, current: point });
        setSelectedElementIds([]);
        return;
      }

      if (activeTool === "free-draw") {
        setDraft({ kind: "free-draw", points: [point.x, point.y] });
        return;
      }

      if (activeTool === "pass-arrow" || activeTool === "run-arrow") {
        setDraft({
          kind: activeTool,
          points: [point.x, point.y, point.x, point.y],
        });
        return;
      }

      if (activeTool !== "eraser") {
        addToolElement(activeTool, point);
      }
    },
    [activeTool, addToolElement, isSpacePressed, setSelectedElementIds]
  );

  const beginInteraction = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const nativeEvent = event.evt;

      const isTouchPinch =
        nativeEvent instanceof TouchEvent && beginPinch(nativeEvent);

      if (isTouchPinch) {
        return;
      }

      const isSyntheticMouse =
        nativeEvent instanceof MouseEvent &&
        Date.now() - lastTouchAtRef.current < 450;

      if (isSyntheticMouse) {
        return;
      }

      const point = getBoardPoint();

      if (point) {
        beginBoardAction(nativeEvent, point);
      }
    },
    [beginBoardAction, beginPinch, getBoardPoint]
  );

  const movePinch = useCallback((nativeEvent: TouchEvent): boolean => {
    if (nativeEvent.touches.length !== 2) {
      return false;
    }

    const pinch = pinchRef.current;

    if (!pinch) {
      return true;
    }

    nativeEvent.preventDefault();
    const nextDistance = getTouchDistance(nativeEvent.touches);
    const scale = clamp(
      (pinch.viewport.scale * nextDistance) / pinch.distance,
      MIN_SCALE,
      MAX_SCALE
    );
    const center = getTouchCenter(nativeEvent.touches);
    const boardPoint = {
      x: (pinch.center.x - pinch.viewport.x) / pinch.viewport.scale,
      y: (pinch.center.y - pinch.viewport.y) / pinch.viewport.scale,
    };

    setViewport({
      scale,
      x: center.x - boardPoint.x * scale,
      y: center.y - boardPoint.y * scale,
    });

    return true;
  }, []);

  const moveMousePan = useCallback((nativeEvent: MouseEvent): boolean => {
    if (!panRef.current) {
      return false;
    }

    const delta = {
      x: nativeEvent.clientX - panRef.current.x,
      y: nativeEvent.clientY - panRef.current.y,
    };

    panRef.current = { x: nativeEvent.clientX, y: nativeEvent.clientY };
    setViewport((current) => ({
      ...current,
      x: current.x + delta.x,
      y: current.y + delta.y,
    }));

    return true;
  }, []);

  const moveDraft = useCallback(() => {
    if (!draft) {
      return;
    }

    const point = getBoardPoint();

    if (!point) {
      return;
    }

    if (draft.kind === "free-draw") {
      setDraft({
        kind: draft.kind,
        points: [...draft.points, point.x, point.y],
      });
      return;
    }

    setDraft({
      kind: draft.kind,
      points: [
        draft.points[0] ?? point.x,
        draft.points[1] ?? point.y,
        point.x,
        point.y,
      ],
    });
  }, [draft, getBoardPoint]);

  const moveSelectionBox = useCallback((): boolean => {
    if (!selectionBox) {
      return false;
    }

    const point = getBoardPoint();

    if (!point) {
      return true;
    }

    setSelectionBox({ ...selectionBox, current: point });

    return true;
  }, [getBoardPoint, selectionBox]);

  const moveInteraction = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const nativeEvent = event.evt;

      if (nativeEvent instanceof TouchEvent && movePinch(nativeEvent)) {
        return;
      }

      if (nativeEvent instanceof MouseEvent && moveMousePan(nativeEvent)) {
        return;
      }

      if (moveSelectionBox()) {
        return;
      }

      moveDraft();
    },
    [moveDraft, moveMousePan, movePinch, moveSelectionBox]
  );

  const finishInteraction = useCallback(() => {
    pinchRef.current = null;
    panRef.current = null;

    if (selectionBox) {
      const selectionBounds = getSelectionBounds(selectionBox);
      const selectedIds = frame.elements
        .filter((element) =>
          boundsIntersect(getElementBounds(element), selectionBounds)
        )
        .map((element) => element.id);

      setSelectedElementIds(selectedIds);
      setSelectionBox(null);
      return;
    }

    if (!draft) {
      return;
    }

    if (draft.kind === "free-draw" && draft.points.length > 4) {
      addElement(createDrawingElement(draft.points));
    }

    if (
      (draft.kind === "pass-arrow" || draft.kind === "run-arrow") &&
      draft.points.length === 4
    ) {
      addElement(
        createArrowElement(
          draft.kind === "pass-arrow" ? "pass" : "run",
          draft.points
        )
      );
    }

    setDraft(null);
  }, [addElement, draft, frame.elements, selectionBox, setSelectedElementIds]);

  const handleWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();

      if (!pointer) {
        return;
      }

      const direction = event.evt.deltaY > 0 ? -1 : 1;
      const nextScale = clamp(
        viewport.scale * (direction > 0 ? 1.08 : 0.92),
        MIN_SCALE,
        MAX_SCALE
      );

      zoomAtPoint(pointer, nextScale);
    },
    [viewport.scale, zoomAtPoint]
  );

  const handleElementSelect = useCallback(
    (id: string) => {
      if (activeTool === "eraser") {
        removeElement(id);
        return;
      }

      setSelectedElementIds([id]);
    },
    [activeTool, removeElement, setSelectedElementIds]
  );

  const handleElementDragMove = useCallback(
    (id: string, event: Konva.KonvaEventObject<DragEvent>) => {
      const nativeEvent = event.evt;
      const isTouchDrag = nativeEvent instanceof TouchEvent;
      const point = isTouchDrag
        ? getLiftedTouchPoint()
        : { x: event.target.x(), y: event.target.y() };

      if (!point) {
        return;
      }

      if (isTouchDrag) {
        event.target.position(point);
        setTouchDrag({ id, point });
      }

      updateElement(id, point, { recordHistory: false });
    },
    [getLiftedTouchPoint, updateElement]
  );

  const handleElementDragEnd = useCallback(
    (id: string, event: Konva.KonvaEventObject<DragEvent>) => {
      const nativeEvent = event.evt;
      const point =
        nativeEvent instanceof TouchEvent
          ? getLiftedTouchPoint()
          : { x: event.target.x(), y: event.target.y() };

      if (!point) {
        setTouchDrag(null);
        return;
      }

      updateElementPosition(id, point);
      setTouchDrag(null);
    },
    [getLiftedTouchPoint, updateElementPosition]
  );

  const exportPng = useCallback(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const w = stage.width();
    const h = stage.height();
    if (w < 1 || h < 1) {
      toast.error(
        "La pizarra aún no tiene tamaño. Espera un momento e inténtalo de nuevo."
      );
      return;
    }

    try {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `pizarra-tactica-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch {
      toast.error(
        "No se pudo exportar la imagen. Prueba de nuevo cuando la pizarra sea visible."
      );
    }
  }, []);

  return (
    <section className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-primary bg-bg-primary max-md:rounded-none max-md:border-0">
      <div
        className="relative flex min-h-0 flex-1 touch-none bg-bg-quaternary"
        ref={containerRef}
      >
        {size.width > 0 && size.height > 0 ? (
          <Stage
            height={size.height}
            onMouseDown={beginInteraction}
            onMouseMove={moveInteraction}
            onMouseUp={finishInteraction}
            onTouchEnd={finishInteraction}
            onTouchMove={moveInteraction}
            onTouchStart={beginInteraction}
            onWheel={handleWheel}
            ref={stageRef}
            width={size.width}
          >
            <Layer>
              <Group
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                x={viewport.x}
                y={viewport.y}
              >
                <PitchBackground pitchView={pitchView} />
              </Group>
            </Layer>

            <Layer>
              <Group
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                x={viewport.x}
                y={viewport.y}
              >
                {frame.elements.map((element) => (
                  <BoardElementNode
                    activeTool={activeTool}
                    element={element}
                    isSelected={selectedElementIds.includes(element.id)}
                    key={element.id}
                    onDragEnd={handleElementDragEnd}
                    onDragMove={handleElementDragMove}
                    onSelect={handleElementSelect}
                    teamColors={teamColors}
                  />
                ))}

                {draft ? <DraftNode draft={draft} /> : null}
                {selectionBox ? (
                  <SelectionBoxNode selectionBox={selectionBox} />
                ) : null}
              </Group>
            </Layer>
          </Stage>
        ) : null}

        <Toolbar onExportPng={exportPng} />

        {onSave ? (
          <div className="absolute top-4 right-4 z-40 flex items-start gap-2">
            <Button
              className={cn(
                "rounded-full px-5 py-2 font-medium text-sm shadow-floating",
                isMobile ? "pr-4" : ""
              )}
              onClick={handleSave}
              type="button"
            >
              Guardar pizarra
            </Button>
            {onClose ? (
              <Button
                aria-label="Cerrar pizarra"
                className="rounded-full border border-border-primary bg-bg-primary/92 text-text-secondary shadow-floating hover:bg-bg-primary"
                onClick={handleRequestClose}
                size="icon"
                type="button"
                variant="outline"
              >
                <XMarkIcon className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}

        {isMobile ? null : (
          <div
            className={`${helpHintClassName} ${
              showHelpHint ? "opacity-100" : "opacity-0"
            }`}
          >
            V para puntero · 1-9/0 para herramientas · R rota 90º · arrastra
            para seleccionar · espacio + arrastrar mueve el tablero
          </div>
        )}

        {touchDrag ? (
          <div className="pointer-events-none absolute top-20 right-4 z-30 rounded-2xl border border-border-primary bg-bg-primary/90 p-3 shadow-floating backdrop-blur">
            <p className="font-medium text-text-secondary text-xs">
              Precision touch
            </p>
            <p className="font-semibold text-sm text-text-primary">
              x {Math.round(touchDrag.point.x)} · y{" "}
              {Math.round(touchDrag.point.y)}
            </p>
          </div>
        ) : null}

        <AlertDialog
          onOpenChange={setIsCloseDialogOpen}
          open={isCloseDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hay cambios sin guardar</AlertDialogTitle>
              <AlertDialogDescription>
                Si cierras ahora, perderás la pizarra que no has guardado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Seguir editando</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger text-danger-foreground hover:bg-danger/90"
                onClick={onClose}
              >
                Cerrar sin guardar
              </AlertDialogAction>
              <AlertDialogAction onClick={handleConfirmSaveAndClose}>
                Guardar y cerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

function PitchBackground({ pitchView }: { readonly pitchView: PitchView }) {
  const showFull = pitchView === "full";
  const showHalf = pitchView === "half";
  const showPenalty = pitchView === "penalty";

  return (
    <Group listening={false}>
      <Rect
        cornerRadius={24}
        fill="#17633a"
        height={FIELD_HEIGHT}
        shadowBlur={18}
        shadowColor="rgba(0,0,0,0.18)"
        width={FIELD_WIDTH}
      />
      <Rect
        cornerRadius={20}
        height={FIELD_HEIGHT - 48}
        stroke="rgba(255,255,255,0.86)"
        strokeWidth={5}
        width={FIELD_WIDTH - 48}
        x={24}
        y={24}
      />

      {showFull || showHalf ? (
        <>
          <Line
            points={[FIELD_WIDTH / 2, 24, FIELD_WIDTH / 2, FIELD_HEIGHT - 24]}
            stroke="rgba(255,255,255,0.78)"
            strokeWidth={4}
          />
          <Circle
            radius={92}
            stroke="rgba(255,255,255,0.78)"
            strokeWidth={4}
            x={FIELD_WIDTH / 2}
            y={FIELD_HEIGHT / 2}
          />
          <Circle
            fill="rgba(255,255,255,0.86)"
            radius={7}
            x={FIELD_WIDTH / 2}
            y={FIELD_HEIGHT / 2}
          />
        </>
      ) : null}

      {showFull ? (
        <>
          <PenaltyArea side="left" />
          <PenaltyArea side="right" />
        </>
      ) : null}

      {showHalf ? (
        <>
          <Rect
            fill="rgba(255,255,255,0.08)"
            height={FIELD_HEIGHT - 48}
            width={FIELD_WIDTH / 2 - 24}
            x={FIELD_WIDTH / 2}
            y={24}
          />
          <PenaltyArea side="right" />
        </>
      ) : null}

      {showPenalty ? (
        <Group>
          <Rect
            height={520}
            stroke="rgba(255,255,255,0.86)"
            strokeWidth={5}
            width={420}
            x={FIELD_WIDTH - 444}
            y={(FIELD_HEIGHT - 520) / 2}
          />
          <Rect
            height={240}
            stroke="rgba(255,255,255,0.86)"
            strokeWidth={5}
            width={140}
            x={FIELD_WIDTH - 164}
            y={(FIELD_HEIGHT - 240) / 2}
          />
          <Circle
            fill="rgba(255,255,255,0.86)"
            radius={7}
            x={FIELD_WIDTH - 332}
            y={FIELD_HEIGHT / 2}
          />
        </Group>
      ) : null}
    </Group>
  );
}

function PenaltyArea({ side }: { readonly side: "left" | "right" }) {
  const isLeft = side === "left";
  const x = isLeft ? 24 : FIELD_WIDTH - 244;
  const goalX = isLeft ? 24 : FIELD_WIDTH - 84;
  const spotX = isLeft ? 132 : FIELD_WIDTH - 132;

  return (
    <Group>
      <Rect
        height={360}
        stroke="rgba(255,255,255,0.82)"
        strokeWidth={4}
        width={220}
        x={x}
        y={(FIELD_HEIGHT - 360) / 2}
      />
      <Rect
        height={160}
        stroke="rgba(255,255,255,0.82)"
        strokeWidth={4}
        width={60}
        x={goalX}
        y={(FIELD_HEIGHT - 160) / 2}
      />
      <Circle
        fill="rgba(255,255,255,0.86)"
        radius={6}
        x={spotX}
        y={FIELD_HEIGHT / 2}
      />
    </Group>
  );
}

function BoardElementNode({
  activeTool,
  element,
  isSelected,
  onDragEnd,
  onDragMove,
  onSelect,
  teamColors,
}: {
  readonly activeTool: BoardTool;
  readonly element: BoardElement;
  readonly isSelected: boolean;
  readonly onDragEnd: (
    id: string,
    event: Konva.KonvaEventObject<DragEvent>
  ) => void;
  readonly onDragMove: (
    id: string,
    event: Konva.KonvaEventObject<DragEvent>
  ) => void;
  readonly onSelect: (id: string) => void;
  readonly teamColors: { readonly home: string; readonly away: string };
}) {
  const isDraggable = activeTool === "select" && !element.locked;

  return (
    <Group
      draggable={isDraggable}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(element.id);
      }}
      onDragEnd={(event) => onDragEnd(element.id, event)}
      onDragMove={(event) => onDragMove(element.id, event)}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(element.id);
      }}
      rotation={element.rotation ?? 0}
      x={element.x}
      y={element.y}
    >
      {element.type === "player" ? (
        <PlayerNode
          element={element}
          isSelected={isSelected}
          teamColors={teamColors}
        />
      ) : null}
      {element.type === "ball" ? <BallNode isSelected={isSelected} /> : null}
      {element.type === "equipment" ? (
        <EquipmentNode element={element} isSelected={isSelected} />
      ) : null}
      {element.type === "drawing" ? <DrawingNode element={element} /> : null}
      {element.type === "arrow" ? <ArrowNode element={element} /> : null}
    </Group>
  );
}

function PlayerNode({
  element,
  isSelected,
  teamColors,
}: {
  readonly element: PlayerElement;
  readonly isSelected: boolean;
  readonly teamColors: { readonly home: string; readonly away: string };
}) {
  return (
    <Group>
      {isSelected ? (
        <Circle radius={PLAYER_RADIUS + 7} stroke="#f8fafc" strokeWidth={3} />
      ) : null}
      <Circle
        fill={teamColors[element.team]}
        radius={PLAYER_RADIUS}
        shadowBlur={8}
        shadowColor="rgba(0,0,0,0.2)"
        stroke="#f8fafc"
        strokeWidth={3}
      />
      <Text
        align="center"
        fill="#ffffff"
        fontSize={18}
        fontStyle="700"
        height={PLAYER_RADIUS * 2}
        offsetX={PLAYER_RADIUS}
        offsetY={PLAYER_RADIUS - 10}
        text={String(element.number)}
        verticalAlign="middle"
        width={PLAYER_RADIUS * 2}
      />
    </Group>
  );
}

function BallNode({ isSelected }: { readonly isSelected: boolean }) {
  return (
    <Group>
      {isSelected ? (
        <Circle radius={20} stroke="#f8fafc" strokeWidth={3} />
      ) : null}
      <Circle fill="#f8fafc" radius={14} stroke="#111827" strokeWidth={3} />
      <Line points={[-10, 0, 10, 0]} stroke="#111827" strokeWidth={2} />
      <Line points={[0, -10, 0, 10]} stroke="#111827" strokeWidth={2} />
    </Group>
  );
}

function EquipmentNode({
  element,
  isSelected,
}: {
  readonly element: EquipmentElement;
  readonly isSelected: boolean;
}) {
  if (element.kind === "cone") {
    return (
      <Group>
        {isSelected ? (
          <Circle radius={22} stroke="#f8fafc" strokeWidth={3} />
        ) : null}
        <RegularPolygon
          fill="#f97316"
          radius={18}
          rotation={180}
          sides={3}
          stroke="#fed7aa"
          strokeWidth={2}
        />
      </Group>
    );
  }

  if (element.kind === "pole") {
    return (
      <Group>
        {isSelected ? (
          <Circle radius={20} stroke="#f8fafc" strokeWidth={3} />
        ) : null}
        <Rect
          fill="#f59e0b"
          height={44}
          offsetX={3}
          offsetY={22}
          radius={3}
          width={6}
        />
      </Group>
    );
  }

  return (
    <Group>
      {isSelected ? (
        <Rect
          height={42}
          offsetX={30}
          offsetY={21}
          stroke="#f8fafc"
          strokeWidth={3}
          width={60}
        />
      ) : null}
      <Rect
        height={34}
        offsetX={26}
        offsetY={17}
        stroke="#f8fafc"
        strokeWidth={5}
        width={52}
      />
      <Line points={[-26, 17, 26, 17]} stroke="#17633a" strokeWidth={6} />
    </Group>
  );
}

function DrawingNode({ element }: { readonly element: DrawingElement }) {
  return (
    <Line
      globalCompositeOperation="source-over"
      lineCap="round"
      lineJoin="round"
      points={[...element.points]}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      tension={0.4}
    />
  );
}

function ArrowNode({ element }: { readonly element: ArrowElement }) {
  const dash = element.variant === "pass" ? [18, 12] : [];

  return (
    <Arrow
      dash={dash}
      fill="#f8fafc"
      lineCap="round"
      lineJoin="round"
      pointerLength={18}
      pointerWidth={18}
      points={[...element.points]}
      stroke="#f8fafc"
      strokeWidth={element.variant === "pass" ? 4 : 5}
      tension={element.variant === "run" ? 0.35 : 0}
    />
  );
}

function DraftNode({ draft }: { readonly draft: DraftShape }) {
  if (draft.kind === "free-draw") {
    return (
      <Line
        lineCap="round"
        lineJoin="round"
        opacity={0.82}
        points={[...draft.points]}
        stroke="#f8fafc"
        strokeWidth={5}
        tension={0.4}
      />
    );
  }

  const dash = draft.kind === "pass-arrow" ? [18, 12] : [];

  return (
    <Arrow
      dash={dash}
      fill="#f8fafc"
      opacity={0.82}
      pointerLength={18}
      pointerWidth={18}
      points={[...draft.points]}
      stroke="#f8fafc"
      strokeWidth={draft.kind === "pass-arrow" ? 4 : 5}
    />
  );
}

function SelectionBoxNode({
  selectionBox,
}: {
  readonly selectionBox: SelectionBox;
}) {
  const bounds = getSelectionBounds(selectionBox);

  return (
    <Rect
      dash={[12, 8]}
      fill="rgba(37, 99, 235, 0.16)"
      height={bounds.maxY - bounds.minY}
      listening={false}
      stroke="#bfdbfe"
      strokeWidth={2}
      width={bounds.maxX - bounds.minX}
      x={bounds.minX}
      y={bounds.minY}
    />
  );
}
