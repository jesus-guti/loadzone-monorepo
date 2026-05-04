"use client";

import {
  DownloadSimpleIcon,
  ArrowsClockwiseIcon,
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
  GearSixIcon,
  CursorClickIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/design-system/components/ui/sheet";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import {
  useCompactBoardLayout,
  useIsMobile,
} from "@repo/design-system/hooks/use-mobile";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import {
  type BoardTool,
  type PitchView,
  useBoardStore,
} from "./use-board-store";

type ToolbarProps = {
  readonly className?: string;
  readonly onExportPng: () => void;
};

type ToolDefinition = {
  readonly tool: BoardTool;
  readonly label: string;
  readonly shortcut: string;
  readonly icon: ReactNode;
};

const toolbarBaseClassName = [
  "absolute",
  "bottom-4",
  "left-1/2",
  "z-40",
  "flex flex-col-reverse",
  "max-w-[calc(100vw-1rem)]",
  "-translate-x-1/2",
  "items-center",
  "gap-1",
  "overflow-x-auto",
  "p-2",
  "backdrop-blur",
  "md:-bottom-2",
  "md:max-w-none",
  "md:-translate-y-1/2",
  "md:flex-row",
  "md:rounded-2xl",
].join(" ");

const toolbarLandscapeClassName = [
  "max-md:landscape:top-1/2",
  "max-md:landscape:bottom-auto",
  "max-md:landscape:left-3",
  "max-md:landscape:-translate-y-1/2",
  "max-md:landscape:translate-x-0",
  "max-md:landscape:flex-col",
  "max-md:landscape:rounded-2xl",
].join(" ");

const tools: readonly ToolDefinition[] = [
  {
    tool: "select",
    label: "Seleccionar",
    shortcut: "V",
    icon: <CursorClickIcon className="size-4" />,
  },
  {
    tool: "home-player",
    label: "Jugador local",
    shortcut: "1",
    icon: (
      <span
        className="flex size-4 items-center justify-center rounded-full text-[9px] text-white"
        style={{ backgroundColor: "#2563eb" }}
      >
        1
      </span>
    ),
  },
  {
    tool: "away-player",
    label: "Jugador visitante",
    shortcut: "2",
    icon: (
      <span
        className="flex size-4 items-center justify-center rounded-full text-[9px] text-white"
        style={{ backgroundColor: "#dc2626" }}
      >
        1
      </span>
    ),
  },
  {
    tool: "ball",
    label: "Balon",
    shortcut: "3",
    icon: (
      <span className="size-4 rounded-full border-2 border-text-primary bg-bg-primary" />
    ),
  },
  {
    tool: "cone",
    label: "Cono",
    shortcut: "4",
    icon: (
      <span
        className="size-0 border-x-[7px] border-x-transparent"
        style={{ borderBottomColor: "#f97316", borderBottomWidth: 14 }}
      />
    ),
  },
  {
    tool: "pole",
    label: "Pica",
    shortcut: "5",
    icon: (
      <span
        className="h-4 w-1 rounded-full"
        style={{ backgroundColor: "#f59e0b" }}
      />
    ),
  },
  {
    tool: "mini-goal",
    label: "Porteria",
    shortcut: "6",
    icon: (
      <span className="h-3 w-5 rounded-t border-2 border-text-primary border-b-0" />
    ),
  },
  {
    tool: "free-draw",
    label: "Dibujo libre",
    shortcut: "7",
    icon: <PencilSimpleIcon className="size-4" />,
  },
  {
    tool: "pass-arrow",
    label: "Pase",
    shortcut: "8",
    icon: <DashedArrowIcon />,
  },
  {
    tool: "run-arrow",
    label: "Carrera",
    shortcut: "9",
    icon: <SolidArrowIcon />,
  },
  {
    tool: "eraser",
    label: "Borrador",
    shortcut: "0",
    icon: <TrashIcon className="size-4" />,
  },
];

const pitchViews: readonly { label: string; value: PitchView }[] = [
  { label: "Campo entero", value: "full" },
  { label: "Medio campo", value: "half" },
  { label: "Area de penalti", value: "penalty" },
];

function subscribeLandscapeOrientation(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {
      return;
    };
  }

  const mq = window.matchMedia("(orientation: landscape)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getLandscapeOrientationSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(orientation: landscape)").matches;
}

function ToolbarButton({
  active = false,
  ariaLabel,
  children,
  className,
  disabled = false,
  onClick,
  shortcut,
  title,
  variant = "ghost",
}: {
  readonly active?: boolean;
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly shortcut?: string;
  readonly title: string;
  readonly variant?: "default" | "ghost";
}) {
  return (
    <Button
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "relative h-11 w-11 shrink-0 rounded-2xl border border-transparent sm:h-10 sm:w-10",
        active
          ? "border-brand/20 bg-brand/15 text-brand hover:bg-brand/20"
          : "",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      size="icon"
      title={title}
      type="button"
      variant={variant}
    >
      {children}
      {shortcut ? <span className="sr-only">{shortcut}</span> : null}
      <span className="sr-only">{title}</span>
    </Button>
  );
}

function ToolbarSettingsSheet({
  children,
  clearFrame,
  compactBoardLayout,
  keepToolActive,
  notes,
  pitchView,
  setKeepToolActive,
  setNotes,
  setPitchView,
  setSnapToGrid,
  setTeamColor,
  snapToGrid,
  teamColors,
}: {
  readonly children: ReactNode;
  readonly clearFrame: () => void;
  readonly compactBoardLayout: boolean;
  readonly keepToolActive: boolean;
  readonly notes: string;
  readonly pitchView: PitchView;
  readonly setKeepToolActive: (value: boolean) => void;
  readonly setNotes: (value: string) => void;
  readonly setPitchView: (value: PitchView) => void;
  readonly setSnapToGrid: (value: boolean) => void;
  readonly setTeamColor: (team: "home" | "away", value: string) => void;
  readonly snapToGrid: boolean;
  readonly teamColors: { readonly home: string; readonly away: string };
}) {
  const sheetContentClassName = cn(
    "mx-auto flex h-auto w-full max-w-[1080px] flex-col",
    compactBoardLayout
      ? "h-dvh max-h-none rounded-none border-0 pb-[env(safe-area-inset-bottom)]"
      : "max-h-[85vh] rounded-t-3xl md:max-h-none md:rounded-none"
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className={sheetContentClassName} side="bottom">
        <SheetHeader>
          <SheetTitle>Pizarra tactica</SheetTitle>
          <SheetDescription>
            Ajustes rapidos del campo, alineacion y frames.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-4 pb-6">
            <div className="space-y-2">
              <p className="font-medium text-sm text-text-primary">Vista</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {pitchViews.map((view) => (
                  <Button
                    key={view.value}
                    onClick={() => setPitchView(view.value)}
                    type="button"
                    variant={pitchView === view.value ? "default" : "outline"}
                  >
                    {view.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border-primary bg-bg-secondary p-3">
              <span>
                <span className="block font-medium text-sm text-text-primary">
                  Rejilla magnetica
                </span>
                <span className="text-text-secondary text-xs">
                  Alinea jugadores y material al soltar.
                </span>
              </span>
              <Switch
                aria-label="Activar rejilla magnetica"
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border-primary bg-bg-secondary p-3">
              <span>
                <span className="block font-medium text-sm text-text-primary">
                  Mantener herramienta activa
                </span>
                <span className="text-text-secondary text-xs">
                  Al colocar una pieza, no vuelve al puntero.
                </span>
              </span>
              <Switch
                aria-label="Mantener herramienta activa"
                checked={keepToolActive}
                onCheckedChange={setKeepToolActive}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Local"
                onChange={(color) => setTeamColor("home", color)}
                value={teamColors.home}
              />
              <ColorField
                label="Visitante"
                onChange={(color) => setTeamColor("away", color)}
                value={teamColors.away}
              />
            </div>

            <div className="space-y-2">
              <label
                className="font-medium text-text-secondary text-xs"
                htmlFor="board-notes"
              >
                Notas del ejercicio
              </label>
              <Textarea
                className="min-h-24 resize-none bg-bg-secondary"
                id="board-notes"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Consignas, tiempos, variantes..."
                value={notes}
              />
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={clearFrame}
              type="button"
              variant="destructive"
            >
              Limpiar frame
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Toolbar({ className, onExportPng }: ToolbarProps) {
  const compactBoardLayout = useCompactBoardLayout();
  const activeTool = useBoardStore((state) => state.activeTool);
  const pitchView = useBoardStore((state) => state.pitchView);
  const snapToGrid = useBoardStore((state) => state.snapToGrid);
  const keepToolActive = useBoardStore((state) => state.keepToolActive);
  const selectedCount = useBoardStore(
    (state) => state.selectedElementIds.length
  );
  const teamColors = useBoardStore((state) => state.teamColors);
  const notes = useBoardStore((state) => state.notes);
  const canUndo = useBoardStore((state) => state.past.length > 0);
  const canRedo = useBoardStore((state) => state.future.length > 0);
  const setActiveTool = useBoardStore((state) => state.setActiveTool);
  const setPitchView = useBoardStore((state) => state.setPitchView);
  const setSnapToGrid = useBoardStore((state) => state.setSnapToGrid);
  const setKeepToolActive = useBoardStore((state) => state.setKeepToolActive);
  const setTeamColor = useBoardStore((state) => state.setTeamColor);
  const setNotes = useBoardStore((state) => state.setNotes);
  const rotateSelectedElements = useBoardStore(
    (state) => state.rotateSelectedElements
  );
  const removeSelectedElements = useBoardStore(
    (state) => state.removeSelectedElements
  );
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);
  const clearFrame = useBoardStore((state) => state.clearFrame);

  const isMobile = useIsMobile();
  const isLandscape = useSyncExternalStore(
    subscribeLandscapeOrientation,
    getLandscapeOrientationSnapshot,
    () => false
  );
  const isMobileLandscape = isMobile && isLandscape;
  const isMobilePortrait = isMobile && !isLandscape;

  const shellClassName = cn(
    toolbarBaseClassName,
    toolbarLandscapeClassName,
    isMobilePortrait &&
      "w-[min(calc(100vw-1rem),47rem)] max-w-[calc(100vw-1rem)] justify-center gap-3 overflow-visible rounded-[26px] px-4 py-3",
    isMobileLandscape && "top-1/2",
    isMobileLandscape && "left-3",
    isMobileLandscape && "bottom-auto",
    isMobileLandscape && "-translate-y-1/2 translate-x-0",
    isMobileLandscape && "max-h-[calc(100dvh-1.5rem)] flex-col",
    isMobileLandscape && "gap-2 overflow-visible rounded-[24px] px-2 py-3",
    className
  );

  const toolRailClassName = cn(
    "flex items-center gap-1",
    isMobilePortrait &&
      "max-w-full flex-1 overflow-x-auto rounded-[22px] border border-border-primary bg-bg-primary px-2 py-2 shadow-floating",
    isMobileLandscape && "flex-col"
  );

  const actionsRailClassName = cn(
    "flex items-center gap-1",
    isMobilePortrait && "shrink-0 text-text-tertiary",
    isMobileLandscape && "mt-1 flex-col border-border-primary border-t pt-2"
  );

  return (
    <div className={shellClassName}>
      <div className={toolRailClassName}>
        {tools.map((item) => (
          <ToolbarButton
            active={activeTool === item.tool}
            ariaLabel={item.label}
            key={item.tool}
            onClick={() => setActiveTool(item.tool)}
            title={item.label}
            variant={activeTool === item.tool ? "default" : "ghost"}
          >
            {item.icon}
          </ToolbarButton>
        ))}
      </div>

      <div className={actionsRailClassName}>
        <ToolbarButton
          ariaLabel="Deshacer"
          disabled={!canUndo}
          onClick={undo}
          title="Deshacer"
        >
          <ArrowArcLeftIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Rehacer"
          disabled={!canRedo}
          onClick={redo}
          title="Rehacer"
        >
          <ArrowArcRightIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Rotar selección 90 grados"
          disabled={selectedCount === 0}
          onClick={rotateSelectedElements}
          title="Rotar selección 90 grados (R)"
        >
          <ArrowsClockwiseIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Borrar selección"
          disabled={selectedCount === 0}
          onClick={removeSelectedElements}
          title="Borrar selección"
        >
          <TrashIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Exportar PNG"
          onClick={onExportPng}
          title="Exportar PNG"
        >
          <DownloadSimpleIcon className="size-4" />
        </ToolbarButton>

        <ToolbarSettingsSheet
          clearFrame={clearFrame}
          compactBoardLayout={compactBoardLayout}
          keepToolActive={keepToolActive}
          notes={notes}
          pitchView={pitchView}
          setKeepToolActive={setKeepToolActive}
          setNotes={setNotes}
          setPitchView={setPitchView}
          setSnapToGrid={setSnapToGrid}
          setTeamColor={setTeamColor}
          snapToGrid={snapToGrid}
          teamColors={teamColors}
        >
          <ToolbarButton ariaLabel="Configuracion" title="Configuracion">
            <GearSixIcon className="size-4" />
          </ToolbarButton>
        </ToolbarSettingsSheet>
      </div>
    </div>
  );
}

function DashedArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 16c4-8 10-10 16-8"
        stroke="currentColor"
        strokeDasharray="3 3"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="m16 5 4 3-5 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SolidArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 16c4-8 10-10 16-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="m16 5 4 3-5 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function ColorField({
  label,
  onChange,
  value,
}: {
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}) {
  return (
    <label className="space-y-2">
      <span className="font-medium text-text-secondary text-xs">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-border-primary bg-bg-secondary p-1"
        onChange={(event) => onChange(event.target.value)}
        type="color"
        value={value}
      />
    </label>
  );
}
