"use client";

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
import { cn } from "@repo/design-system/lib/utils";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Cog6ToothIcon,
  CursorArrowRaysIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { useIsMobile } from "@repo/design-system/hooks/use-mobile";
import type { ReactNode } from "react";
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

const toolbarMobileClassName = [
  "absolute",
  "bottom-2",
  "left-1/2",
  "z-40",
  "grid",
  "w-[calc(100vw-1rem)]",
  "-translate-x-1/2",
  "grid-cols-7",
  "gap-1",
  "rounded-2xl",
  "border",
  "border-border-primary",
  "bg-bg-primary/90",
  "p-2",
  "shadow-floating",
  "backdrop-blur",
].join(" ");

const toolbarBaseClassName = [
  "absolute",
  "bottom-4",
  "left-1/2",
  "z-40",
  "flex",
  "max-w-[calc(100vw-1rem)]",
  "-translate-x-1/2",
  "items-center",
  "gap-1",
  "overflow-x-auto",
  "rounded-full",
  "border",
  "border-border-primary",
  "bg-bg-primary/90",
  "p-2",
  "shadow-floating",
  "backdrop-blur",
  "md:top-1/2",
  "md:bottom-auto",
  "md:left-4",
  "md:max-w-none",
  "md:-translate-y-1/2",
  "md:translate-x-0",
  "md:flex-col",
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
    icon: <CursorArrowRaysIcon className="size-4" />,
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
    icon: <span className="size-4 rounded-full border-2 border-text-primary bg-bg-primary" />,
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
    icon: <span className="h-3 w-5 rounded-t border-2 border-text-primary border-b-0" />,
  },
  {
    tool: "free-draw",
    label: "Dibujo libre",
    shortcut: "7",
    icon: <PencilIcon className="size-4" />,
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

const sheetContentClassName = [
  "mx-auto",
  "w-full",
  "max-w-[1080px]",
  "max-h-[85vh]",
  "rounded-t-3xl",
  "md:max-h-none",
  "md:rounded-none",
].join(" ");

export function Toolbar({ className, onExportPng }: ToolbarProps) {
  const isMobile = useIsMobile();
  const activeTool = useBoardStore((state) => state.activeTool);
  const pitchView = useBoardStore((state) => state.pitchView);
  const snapToGrid = useBoardStore((state) => state.snapToGrid);
  const keepToolActive = useBoardStore((state) => state.keepToolActive);
  const selectedCount = useBoardStore((state) => state.selectedElementIds.length);
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

  return (
    <div
      className={cn(
        toolbarBaseClassName,
        toolbarLandscapeClassName,
        className
      )}
    >
      {tools.map((item) => (
        <Button
          aria-label={item.label}
          aria-pressed={activeTool === item.tool}
          className={cn(
            "relative size-11 shrink-0 rounded-full md:size-10",
            activeTool === item.tool &&
              "bg-brand text-brand-foreground hover:bg-brand/90"
          )}
          key={item.tool}
          onClick={() => setActiveTool(item.tool)}
          size="icon"
          title={item.label}
          type="button"
          variant={activeTool === item.tool ? "default" : "ghost"}
        >
          {item.icon}
          <span
            className={cn(
              "-right-0.5 -top-0.5 absolute flex size-4 items-center justify-center font-semibold text-[9px] text-text-tertiary",
              activeTool === item.tool &&
                "rounded-full border border-border-primary bg-bg-secondary"
            )}
          >
            {item.shortcut}
          </span>
          <span className="sr-only">{item.label}</span>
        </Button>
      ))}

      <div className="mx-1 h-8 w-px shrink-0 bg-border-primary md:mx-0 md:h-px md:w-8" />

      <Button
        aria-label="Deshacer"
        className="size-11 shrink-0 rounded-full md:size-10"
        disabled={!canUndo}
        onClick={undo}
        size="icon"
        title="Deshacer"
        type="button"
        variant="ghost"
      >
        <ArrowUturnLeftIcon className="size-4" />
      </Button>
      <Button
        aria-label="Rehacer"
        className="size-11 shrink-0 rounded-full md:size-10"
        disabled={!canRedo}
        onClick={redo}
        size="icon"
        title="Rehacer"
        type="button"
        variant="ghost"
      >
        <ArrowUturnRightIcon className="size-4" />
      </Button>
      <Button
        aria-label="Rotar selección 90 grados"
        className="size-11 shrink-0 rounded-full md:size-10"
        disabled={selectedCount === 0}
        onClick={rotateSelectedElements}
        size="icon"
        title="Rotar selección 90 grados (R)"
        type="button"
        variant="ghost"
      >
        <ArrowPathIcon className="size-4" />
      </Button>
      <Button
        aria-label="Borrar selección"
        className="size-11 shrink-0 rounded-full md:size-10"
        disabled={selectedCount === 0}
        onClick={removeSelectedElements}
        size="icon"
        title="Borrar selección"
        type="button"
        variant="ghost"
      >
        <TrashIcon className="size-4" />
      </Button>
      <Button
        aria-label="Exportar PNG"
        className="size-11 shrink-0 rounded-full md:size-10"
        onClick={onExportPng}
        size="icon"
        title="Exportar PNG"
        type="button"
        variant="ghost"
      >
        <ArrowDownTrayIcon className="size-4" />
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            aria-label="Configuracion"
            className="size-11 shrink-0 rounded-full md:size-10"
            size="icon"
            title="Configuracion"
            type="button"
            variant="ghost"
          >
            <Cog6ToothIcon className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className={sheetContentClassName} side="bottom">
          <SheetHeader>
            <SheetTitle>Pizarra tactica</SheetTitle>
            <SheetDescription>
              Ajustes rapidos del campo, alineacion y frames.
            </SheetDescription>
          </SheetHeader>

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
              <label className="font-medium text-text-secondary text-xs" htmlFor="board-notes">
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

            <Button className="w-full sm:w-auto" onClick={clearFrame} type="button" variant="destructive">
              Limpiar frame
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DashedArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
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
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
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
