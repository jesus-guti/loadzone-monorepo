"use client";

import { create } from "zustand";

export type BoardTool =
  | "select"
  | "home-player"
  | "away-player"
  | "ball"
  | "cone"
  | "pole"
  | "mini-goal"
  | "free-draw"
  | "pass-arrow"
  | "run-arrow"
  | "eraser";

export type PitchView = "full" | "half" | "penalty";

export type BoardPoint = {
  readonly x: number;
  readonly y: number;
};

type BoardElementBase = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly rotation?: number;
  readonly locked?: boolean;
};

export type PlayerElement = BoardElementBase & {
  readonly type: "player";
  readonly team: "home" | "away";
  readonly number: number;
};

export type BallElement = BoardElementBase & {
  readonly type: "ball";
};

export type EquipmentElement = BoardElementBase & {
  readonly type: "equipment";
  readonly kind: "cone" | "pole" | "mini-goal";
};

export type DrawingElement = BoardElementBase & {
  readonly type: "drawing";
  readonly points: readonly number[];
  readonly stroke: string;
  readonly strokeWidth: number;
};

export type ArrowElement = BoardElementBase & {
  readonly type: "arrow";
  readonly points: readonly number[];
  readonly variant: "pass" | "run";
};

export type BoardElement =
  | PlayerElement
  | BallElement
  | EquipmentElement
  | DrawingElement
  | ArrowElement;

export type BoardFrame = {
  readonly id: string;
  readonly name: string;
  readonly elements: readonly BoardElement[];
};

type TeamColors = {
  readonly home: string;
  readonly away: string;
};

export type BoardModel = {
  readonly version: 1;
  readonly pitchView: PitchView;
  readonly teamColors: TeamColors;
  readonly notes: string;
  readonly frames: readonly BoardFrame[];
};

type MutationOptions = {
  readonly recordHistory?: boolean;
};

type AddElementInput = Omit<BoardElement, "id"> & {
  readonly id?: string;
};

type BoardState = {
  readonly activeTool: BoardTool;
  readonly pitchView: PitchView;
  readonly selectedElementId: string | null;
  readonly selectedElementIds: readonly string[];
  readonly keepToolActive: boolean;
  readonly snapToGrid: boolean;
  readonly gridSize: number;
  readonly teamColors: TeamColors;
  readonly notes: string;
  readonly currentFrameId: string;
  readonly frames: readonly BoardFrame[];
  readonly past: readonly (readonly BoardFrame[])[];
  readonly future: readonly (readonly BoardFrame[])[];
  readonly setActiveTool: (tool: BoardTool) => void;
  readonly setPitchView: (view: PitchView) => void;
  readonly setSelectedElementId: (id: string | null) => void;
  readonly setSelectedElementIds: (ids: readonly string[]) => void;
  readonly setKeepToolActive: (enabled: boolean) => void;
  readonly setSnapToGrid: (enabled: boolean) => void;
  readonly setGridSize: (gridSize: number) => void;
  readonly setTeamColor: (team: keyof TeamColors, color: string) => void;
  readonly setNotes: (notes: string) => void;
  readonly addElement: (element: AddElementInput) => string;
  readonly updateElement: (
    id: string,
    patch: Partial<BoardElement>,
    options?: MutationOptions
  ) => void;
  readonly updateElementPosition: (
    id: string,
    point: BoardPoint,
    options?: MutationOptions
  ) => void;
  readonly removeElement: (id: string) => void;
  readonly removeSelectedElements: () => void;
  readonly rotateSelectedElements: () => void;
  readonly clearFrame: () => void;
  readonly duplicateCurrentFrame: () => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly loadBoard: (model: BoardModel) => void;
};

const initialFrameId = "frame-1";

const initialFrames: readonly BoardFrame[] = [
  {
    id: initialFrameId,
    name: "Frame 1",
    elements: [],
  },
];

const cloneFrames = (
  frames: readonly BoardFrame[]
): readonly BoardFrame[] =>
  frames.map((frame) => ({
    ...frame,
    elements: frame.elements.map((element) => ({ ...element })),
  }));

const createId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const snapCoordinate = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

const applySnap = (
  point: BoardPoint,
  snapToGrid: boolean,
  gridSize: number
): BoardPoint => {
  if (!snapToGrid) {
    return point;
  }

  return {
    x: snapCoordinate(point.x, gridSize),
    y: snapCoordinate(point.y, gridSize),
  };
};

const mutateActiveFrame = (
  frames: readonly BoardFrame[],
  currentFrameId: string,
  mutateElements: (elements: readonly BoardElement[]) => readonly BoardElement[]
): readonly BoardFrame[] =>
  frames.map((frame) =>
    frame.id === currentFrameId
      ? { ...frame, elements: mutateElements(frame.elements) }
      : frame
  );

const withHistory = (
  state: BoardState,
  options?: MutationOptions
): Pick<BoardState, "past" | "future"> => {
  if (options?.recordHistory === false) {
    return {
      past: state.past,
      future: state.future,
    };
  }

  return {
    past: [...state.past, cloneFrames(state.frames)],
    future: [],
  };
};

export const useBoardStore = create<BoardState>((set, get) => ({
  activeTool: "select",
  pitchView: "full",
  selectedElementId: null,
  selectedElementIds: [],
  keepToolActive: false,
  snapToGrid: true,
  gridSize: 24,
  teamColors: {
    home: "#2563eb",
    away: "#dc2626",
  },
  notes: "",
  currentFrameId: initialFrameId,
  frames: initialFrames,
  past: [],
  future: [],
  setActiveTool: (activeTool) => {
    set({
      activeTool,
      selectedElementId: activeTool === "select" ? get().selectedElementId : null,
      selectedElementIds: activeTool === "select" ? get().selectedElementIds : [],
    });
  },
  setPitchView: (pitchView) => {
    set({ pitchView });
  },
  setSelectedElementId: (selectedElementId) => {
    set({
      selectedElementId,
      selectedElementIds: selectedElementId ? [selectedElementId] : [],
    });
  },
  setSelectedElementIds: (selectedElementIds) => {
    set({
      selectedElementId: selectedElementIds[0] ?? null,
      selectedElementIds,
    });
  },
  setKeepToolActive: (keepToolActive) => {
    set({ keepToolActive });
  },
  setSnapToGrid: (snapToGrid) => {
    set({ snapToGrid });
  },
  setGridSize: (gridSize) => {
    set({ gridSize });
  },
  setTeamColor: (team, color) => {
    set((state) => ({
      teamColors: {
        ...state.teamColors,
        [team]: color,
      },
    }));
  },
  setNotes: (notes) => {
    set({ notes });
  },
  addElement: (element) => {
    const id = element.id ?? createId(element.type);
    const elementWithId = { ...element, id } as BoardElement;

    set((state) => ({
      ...withHistory(state),
      frames: mutateActiveFrame(
        state.frames,
        state.currentFrameId,
        (elements) => [...elements, elementWithId]
      ),
      selectedElementId: id,
      selectedElementIds: [id],
      activeTool: state.keepToolActive ? state.activeTool : "select",
    }));

    return id;
  },
  updateElement: (id, patch, options) => {
    set((state) => ({
      ...withHistory(state, options),
      frames: mutateActiveFrame(
        state.frames,
        state.currentFrameId,
        (elements) =>
          elements.map((element) =>
            element.id === id ? ({ ...element, ...patch } as BoardElement) : element
          )
      ),
    }));
  },
  updateElementPosition: (id, point, options) => {
    set((state) => {
      const nextPoint = applySnap(point, state.snapToGrid, state.gridSize);

      return {
        ...withHistory(state, options),
        frames: mutateActiveFrame(
          state.frames,
          state.currentFrameId,
          (elements) =>
            elements.map((element) =>
              element.id === id
                ? ({ ...element, x: nextPoint.x, y: nextPoint.y } as BoardElement)
                : element
            )
        ),
      };
    });
  },
  removeElement: (id) => {
    set((state) => ({
      ...withHistory(state),
      frames: mutateActiveFrame(
        state.frames,
        state.currentFrameId,
        (elements) => elements.filter((element) => element.id !== id)
      ),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
      selectedElementIds: state.selectedElementIds.filter(
        (selectedId) => selectedId !== id
      ),
    }));
  },
  removeSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) {
        return state;
      }

      return {
        ...withHistory(state),
        frames: mutateActiveFrame(
          state.frames,
          state.currentFrameId,
          (elements) =>
            elements.filter(
              (element) => !state.selectedElementIds.includes(element.id)
            )
        ),
        selectedElementId: null,
        selectedElementIds: [],
      };
    });
  },
  rotateSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) {
        return state;
      }

      return {
        ...withHistory(state),
        frames: mutateActiveFrame(
          state.frames,
          state.currentFrameId,
          (elements) =>
            elements.map((element) =>
              state.selectedElementIds.includes(element.id)
                ? {
                    ...element,
                    rotation: ((element.rotation ?? 0) + 90) % 360,
                  }
                : element
            )
        ),
      };
    });
  },
  clearFrame: () => {
    set((state) => ({
      ...withHistory(state),
      frames: mutateActiveFrame(state.frames, state.currentFrameId, () => []),
      selectedElementId: null,
      selectedElementIds: [],
    }));
  },
  duplicateCurrentFrame: () => {
    set((state) => {
      const currentFrame = state.frames.find(
        (frame) => frame.id === state.currentFrameId
      );

      if (!currentFrame) {
        return state;
      }

      const frameId = createId("frame");

      return {
        ...withHistory(state),
        frames: [
          ...state.frames,
          {
            id: frameId,
            name: `Frame ${state.frames.length + 1}`,
            elements: currentFrame.elements.map((element) => ({
              ...element,
              id: createId(element.type),
            })),
          },
        ],
        currentFrameId: frameId,
        selectedElementId: null,
        selectedElementIds: [],
      };
    });
  },
  undo: () => {
    set((state) => {
      const previous = state.past.at(-1);

      if (!previous) {
        return state;
      }

      return {
        frames: cloneFrames(previous),
        past: state.past.slice(0, -1),
        future: [cloneFrames(state.frames), ...state.future],
        selectedElementId: null,
        selectedElementIds: [],
      };
    });
  },
  redo: () => {
    set((state) => {
      const next = state.future[0];

      if (!next) {
        return state;
      }

      return {
        frames: cloneFrames(next),
        past: [...state.past, cloneFrames(state.frames)],
        future: state.future.slice(1),
        selectedElementId: null,
        selectedElementIds: [],
      };
    });
  },
  loadBoard: (model) => {
    set({
      pitchView: model.pitchView,
      teamColors: model.teamColors,
      notes: model.notes,
      frames: model.frames.length > 0 ? model.frames : initialFrames,
      currentFrameId: model.frames.length > 0 && model.frames[0] ? model.frames[0].id : initialFrameId,
      past: [],
      future: [],
      selectedElementId: null,
      selectedElementIds: [],
    });
  },
}));

export const getActiveFrame = (state: BoardState): BoardFrame =>
  state.frames.find((frame) => frame.id === state.currentFrameId) ??
  state.frames[0];
