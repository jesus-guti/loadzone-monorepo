"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { toast } from "@repo/design-system/components/ui/sonner";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useCompactBoardLayout } from "@repo/design-system/hooks/use-mobile";
import { cn } from "@repo/design-system/lib/utils";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FieldLabel,
  FormSection,
} from "@/features/sessions/components/form-section";
import { createExercise, updateExercise } from "../actions/exercise-actions";
import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
  VISIBILITY_OPTIONS,
} from "./exercise-enums";
import { TacticsBoard } from "./tactics-board/tactics-board";
import type { BoardModel } from "./tactics-board/use-board-store";

type ExerciseDefaults = {
  id?: string;
  name?: string;
  objectivesText?: string;
  explanationText?: string;
  durationMinutes?: number;
  spaceWidthMeters?: number;
  spaceLengthMeters?: number;
  minPlayers?: number;
  maxPlayers?: number;
  complexity?: string;
  strategy?: string;
  coordinativeSkill?: string;
  tacticalIntention?: string;
  dynamicType?: string;
  gameSituation?: string;
  coordinationType?: string;
  visibility?: string;
  diagramData?: string;
};

type ExerciseFormProps = {
  readonly mode: "create" | "edit";
  readonly defaults?: ExerciseDefaults;
};

const boardPreviewButtonClassName = [
  "group",
  "relative",
  "flex",
  "aspect-video",
  "w-full",
  "overflow-hidden",
  "rounded-xl",
  "border",
  "border-border-primary",
  "bg-bg-secondary",
  "text-left",
  "transition-colors",
  "hover:bg-bg-tertiary",
  "focus-visible:border-ring",
  "focus-visible:ring-[3px]",
  "focus-visible:ring-ring/50",
  "focus-visible:outline-hidden",
].join(" ");

const previewHalfwayLineClassName = [
  "absolute",
  "top-5",
  "bottom-5",
  "left-1/2",
  "w-0.5",
  "-translate-x-1/2",
  "bg-white/65",
].join(" ");

const previewCenterCircleClassName = [
  "absolute",
  "top-1/2",
  "left-1/2",
  "size-20",
  "-translate-x-1/2",
  "-translate-y-1/2",
  "rounded-full",
  "border-2",
  "border-white/65",
].join(" ");

const previewPassLineClassName = [
  "absolute",
  "top-[37%]",
  "left-[42%]",
  "h-0.5",
  "w-28",
  "rotate-12",
  "border-t-2",
  "border-dashed",
  "border-white/80",
].join(" ");

const EXERCISE_FORM_DEFAULTS = {
  durationMinutes: "15",
  spaceWidthMeters: "20",
  spaceLengthMeters: "30",
  playersCount: "4",
  complexity: "MEDIUM",
  strategy: "POSITIONAL_PLAY",
  coordinativeSkill: "PASSING",
  tacticalIntention: "KEEP_POSSESSION",
  dynamicType: "INTENSIVE_INTERACTION",
  gameSituation: "SECTORAL",
  coordinationType: "TEAM_COORDINATION",
  visibility: "CLUB_SHARED",
} as const;

type ExerciseFormSnapshot = {
  readonly id: string;
  readonly name: string;
  readonly objectivesText: string;
  readonly explanationText: string;
  readonly durationMinutes: string;
  readonly spaceWidthMeters: string;
  readonly spaceLengthMeters: string;
  readonly playersCount: string;
  readonly complexity: string;
  readonly strategy: string;
  readonly coordinativeSkill: string;
  readonly tacticalIntention: string;
  readonly dynamicType: string;
  readonly gameSituation: string;
  readonly coordinationType: string;
  readonly visibility: string;
  readonly diagramData: string;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: form orchestration is clearer inline here
export function ExerciseForm({ mode, defaults = {} }: ExerciseFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createExercise : updateExercise;
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [diagramData, setDiagramData] = useState(defaults.diagramData ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [isInlineSubmitInView, setIsInlineSubmitInView] = useState(false);
  const submitLabel = getSubmitLabel(mode, isPending);
  const formId = mode === "create" ? "exercise-create-form" : "exercise-edit-form";

  const initialSnapshot = useMemo(
    () => buildExerciseFormSnapshot(defaults),
    [defaults]
  );

  const syncDirtyState = useCallback((): void => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    setIsDirty(readExerciseFormSnapshot(form) !== initialSnapshot);
  }, [initialSnapshot]);

  const inlineSubmitObserverRef = useRef<IntersectionObserver | null>(null);

  const setInlineSubmitEl = useCallback((el: HTMLDivElement | null) => {
    inlineSubmitObserverRef.current?.disconnect();
    inlineSubmitObserverRef.current = null;

    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInlineSubmitInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px 0px -8px 0px", threshold: 0.01 }
    );

    observer.observe(el);
    inlineSubmitObserverRef.current = observer;
  }, []);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    toast.success(mode === "create" ? "Ejercicio creado." : "Cambios guardados.");
    router.push("/exercises");
    router.refresh();
  }, [mode, router, state.success]);

  return (
    <form
      action={formAction}
      className="space-y-6 pb-24"
      id={formId}
      onChange={syncDirtyState}
      onInput={syncDirtyState}
      ref={formRef}
    >
      {mode === "edit" && defaults.id ? (
        <input name="id" type="hidden" value={defaults.id} />
      ) : null}

      <ExerciseBoardSection
        diagramData={diagramData}
        onChange={(nextDiagramData) => {
          setDiagramData(nextDiagramData);
          queueMicrotask(() => {
            syncDirtyState();
          });
        }}
      />

      <FormSection
        description="Información principal del ejercicio."
        title="Detalles"
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            autoFocus
            className="bg-bg-secondary"
            defaultValue={defaults.name}
            id="name"
            maxLength={120}
            minLength={2}
            name="name"
            placeholder="Rondo 4v2 con apoyos"
            required
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="objectivesText">Objetivos</FieldLabel>
          <Textarea
            className="bg-bg-secondary"
            defaultValue={defaults.objectivesText}
            id="objectivesText"
            maxLength={2000}
            minLength={2}
            name="objectivesText"
            placeholder="Mejorar la circulación rápida del balón..."
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="explanationText">
            Explicación{" "}
            <span className="font-normal text-text-tertiary">(opcional)</span>
          </FieldLabel>
          <Textarea
            className="bg-bg-secondary"
            defaultValue={defaults.explanationText}
            id="explanationText"
            maxLength={4000}
            name="explanationText"
            placeholder="Cómo se desarrolla el ejercicio paso a paso..."
            rows={5}
          />
        </div>
      </FormSection>

      <FormSection
        description="Espacio, jugadores y duración."
        title="Configuración"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel htmlFor="durationMinutes">Duración (min)</FieldLabel>
            <Input
              className="bg-bg-secondary"
              defaultValue={defaults.durationMinutes ?? 15}
              id="durationMinutes"
              max={600}
              min={1}
              name="durationMinutes"
              required
              type="number"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="spaceWidthMeters">Ancho (m)</FieldLabel>
            <Input
              className="bg-bg-secondary"
              defaultValue={defaults.spaceWidthMeters ?? 20}
              id="spaceWidthMeters"
              max={200}
              min={1}
              name="spaceWidthMeters"
              required
              step="0.5"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="spaceLengthMeters">Largo (m)</FieldLabel>
            <Input
              className="bg-bg-secondary"
              defaultValue={defaults.spaceLengthMeters ?? 30}
              id="spaceLengthMeters"
              max={200}
              min={1}
              name="spaceLengthMeters"
              required
              step="0.5"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="playersCount">Jugadores</FieldLabel>
            <Input
              className="bg-bg-secondary"
              defaultValue={defaults.minPlayers ?? 4}
              id="playersCount"
              max={60}
              min={1}
              name="playersCount"
              required
              type="number"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Categorización táctica del ejercicio."
        title="Clasificación"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <EnumSelect
            defaultValue={defaults.complexity ?? "MEDIUM"}
            label="Complejidad"
            name="complexity"
            options={COMPLEXITY_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.strategy ?? "POSITIONAL_PLAY"}
            label="Estrategia"
            name="strategy"
            options={STRATEGY_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.coordinativeSkill ?? "PASSING"}
            label="Capacidad coordinativa"
            name="coordinativeSkill"
            options={COORDINATIVE_SKILL_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.tacticalIntention ?? "KEEP_POSSESSION"}
            label="Intención táctica"
            name="tacticalIntention"
            options={TACTICAL_INTENTION_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.dynamicType ?? "INTENSIVE_INTERACTION"}
            label="Dinámica"
            name="dynamicType"
            options={DYNAMIC_TYPE_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.gameSituation ?? "SECTORAL"}
            label="Situación de juego"
            name="gameSituation"
            options={GAME_SITUATION_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.coordinationType ?? "TEAM_COORDINATION"}
            label="Tipo de coordinación"
            name="coordinationType"
            options={COORDINATION_TYPE_OPTIONS}
          />
          <EnumSelect
            defaultValue={defaults.visibility ?? "CLUB_SHARED"}
            label="Visibilidad"
            name="visibility"
            options={VISIBILITY_OPTIONS}
          />
        </div>
      </FormSection>

      {isDirty === true && !isInlineSubmitInView ? (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 flex justify-end md:bottom-6">
          <Button
            className="shadow-floating"
            disabled={isPending}
            form={formId}
            type="submit"
          >
            {submitLabel}
          </Button>
        </div>
      ) : null}

      <div className="flex justify-end gap-2" ref={setInlineSubmitEl}>
        <Button disabled={isPending} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function ExerciseBoardSection({
  diagramData,
  onChange,
}: {
  readonly diagramData?: string;
  readonly onChange: (data: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const compactBoardLayout = useCompactBoardLayout();

  return (
    <FormSection
      description="Diseña el croquis del ejercicio antes de completar los detalles."
      title="Pizarra"
    >
      {diagramData ? (
        <input name="diagramData" type="hidden" value={diagramData} />
      ) : null}
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <button className={boardPreviewButtonClassName} type="button">
            <BoardPreview data={diagramData} />
            <span
              className={cn(
                "absolute inset-x-4 bottom-4 rounded-xl border border-border-primary bg-bg-primary/92 p-3 backdrop-blur",
                compactBoardLayout
                  ? "space-y-3 shadow-floating"
                  : "flex items-center justify-between gap-3 shadow-floating"
              )}
            >
              <span className="block min-w-0">
                <span className="block font-medium text-sm text-text-primary">
                  Abrir pizarra
                </span>
                <span className="text-text-secondary text-xs">
                  Coloca jugadores, material, recorridos y notas.
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-brand font-medium text-brand-foreground text-xs transition-transform group-hover:scale-[1.02]",
                  compactBoardLayout ? "h-9 w-full px-4" : "px-3 py-1"
                )}
              >
                {diagramData ? "Editar pizarra" : "Crear pizarra"}
              </span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-bg-primary text-text-primary shadow-floating [&>button]:hidden",
            compactBoardLayout
              ? "inset-0 top-0 left-0 h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 sm:max-w-none"
              : "-translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] gap-3 rounded-lg border border-border-primary p-3 sm:max-w-[calc(100vw-2rem)]"
          )}
        >
          <DialogTitle className="sr-only">Pizarra táctica</DialogTitle>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TacticsBoard
              initialData={diagramData}
              onClose={() => setOpen(false)}
              onSave={(data) => {
                onChange(data);
                setOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </FormSection>
  );
}

function BoardPreview({ data }: { readonly data?: string }) {
  if (!data) {
    return <EmptyBoardPreview />;
  }

  try {
    const model = JSON.parse(data) as BoardModel;
    const elements = model.frames[0]?.elements ?? [];

    return (
      <span className="relative block h-full w-full overflow-hidden bg-[#17633a]">
        <span className="absolute inset-5 rounded-lg border-2 border-white/75" />
        <span className={previewHalfwayLineClassName} />
        <span className={previewCenterCircleClassName} />

        {elements.map((el) => {
          if (el.type === "player") {
            const isHome = el.team === "home";
            const color = isHome
              ? model.teamColors.home
              : model.teamColors.away;
            return (
              <span
                className="-translate-x-1/2 -translate-y-1/2 absolute size-4 rounded-full border-2 border-white"
                key={el.id}
                style={{
                  left: `${(el.x / 1200) * 100}%`,
                  top: `${(el.y / 780) * 100}%`,
                  backgroundColor: color,
                }}
              />
            );
          }
          if (el.type === "ball") {
            return (
              <span
                className="-translate-x-1/2 -translate-y-1/2 absolute size-3 rounded-full border border-text-primary bg-white"
                key={el.id}
                style={{
                  left: `${(el.x / 1200) * 100}%`,
                  top: `${(el.y / 780) * 100}%`,
                }}
              />
            );
          }
          if (el.type === "equipment") {
            return (
              <span
                className="-translate-x-1/2 -translate-y-1/2 absolute size-3 bg-orange-500"
                key={el.id}
                style={{
                  left: `${(el.x / 1200) * 100}%`,
                  top: `${(el.y / 780) * 100}%`,
                  borderRadius: el.kind === "cone" ? "50%" : "2px",
                }}
              />
            );
          }
          return null;
        })}
      </span>
    );
  } catch {
    return <EmptyBoardPreview />;
  }
}

function EmptyBoardPreview() {
  return (
    <span className="relative block h-full w-full bg-[#17633a]">
      <span className="absolute inset-5 rounded-lg border-2 border-white/75" />
      <span className={previewHalfwayLineClassName} />
      <span className={previewCenterCircleClassName} />
      <span className="absolute top-[28%] left-[22%] size-5 rounded-full border-2 border-white bg-[#2563eb]" />
      <span className="absolute top-[46%] left-[34%] size-5 rounded-full border-2 border-white bg-[#2563eb]" />
      <span className="absolute top-[62%] left-[24%] size-5 rounded-full border-2 border-white bg-[#2563eb]" />
      <span className="absolute top-[32%] right-[24%] size-5 rounded-full border-2 border-white bg-[#dc2626]" />
      <span className="absolute top-[56%] right-[34%] size-5 rounded-full border-2 border-white bg-[#dc2626]" />
      <span className="absolute top-[48%] right-[20%] size-4 rounded-full border-2 border-text-primary bg-white" />
      <span className={previewPassLineClassName} />
    </span>
  );
}

function getSubmitLabel(
  mode: ExerciseFormProps["mode"],
  isPending: boolean
): string {
  if (isPending) {
    return "Guardando...";
  }

  if (mode === "create") {
    return "Crear ejercicio";
  }

  return "Guardar cambios";
}

function buildExerciseFormSnapshot(defaults: ExerciseDefaults): string {
  return JSON.stringify(createExerciseFormSnapshotFromDefaults(defaults));
}

function readExerciseFormSnapshot(form: HTMLFormElement): string {
  const formData = new FormData(form);
  return JSON.stringify(createExerciseFormSnapshotFromFormData(formData));
}

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: snapshot builder enumerates persisted fields explicitly
function createExerciseFormSnapshotFromDefaults(
  defaults: ExerciseDefaults
): ExerciseFormSnapshot {
  return {
    id: defaults.id ?? "",
    name: defaults.name ?? "",
    objectivesText: defaults.objectivesText ?? "",
    explanationText: defaults.explanationText ?? "",
    durationMinutes: String(
      defaults.durationMinutes ?? EXERCISE_FORM_DEFAULTS.durationMinutes
    ),
    spaceWidthMeters: String(
      defaults.spaceWidthMeters ?? EXERCISE_FORM_DEFAULTS.spaceWidthMeters
    ),
    spaceLengthMeters: String(
      defaults.spaceLengthMeters ?? EXERCISE_FORM_DEFAULTS.spaceLengthMeters
    ),
    playersCount: String(
      defaults.minPlayers ?? EXERCISE_FORM_DEFAULTS.playersCount
    ),
    complexity: defaults.complexity ?? EXERCISE_FORM_DEFAULTS.complexity,
    strategy: defaults.strategy ?? EXERCISE_FORM_DEFAULTS.strategy,
    coordinativeSkill:
      defaults.coordinativeSkill ?? EXERCISE_FORM_DEFAULTS.coordinativeSkill,
    tacticalIntention:
      defaults.tacticalIntention ?? EXERCISE_FORM_DEFAULTS.tacticalIntention,
    dynamicType: defaults.dynamicType ?? EXERCISE_FORM_DEFAULTS.dynamicType,
    gameSituation: defaults.gameSituation ?? EXERCISE_FORM_DEFAULTS.gameSituation,
    coordinationType:
      defaults.coordinationType ?? EXERCISE_FORM_DEFAULTS.coordinationType,
    visibility: defaults.visibility ?? EXERCISE_FORM_DEFAULTS.visibility,
    diagramData: defaults.diagramData ?? "",
  };
}

function createExerciseFormSnapshotFromFormData(
  formData: FormData
): ExerciseFormSnapshot {
  return {
    id: readFormValue(formData, "id"),
    name: readFormValue(formData, "name"),
    objectivesText: readFormValue(formData, "objectivesText"),
    explanationText: readFormValue(formData, "explanationText"),
    durationMinutes: readFormValue(formData, "durationMinutes"),
    spaceWidthMeters: readFormValue(formData, "spaceWidthMeters"),
    spaceLengthMeters: readFormValue(formData, "spaceLengthMeters"),
    playersCount: readFormValue(formData, "playersCount"),
    complexity: readFormValue(formData, "complexity"),
    strategy: readFormValue(formData, "strategy"),
    coordinativeSkill: readFormValue(formData, "coordinativeSkill"),
    tacticalIntention: readFormValue(formData, "tacticalIntention"),
    dynamicType: readFormValue(formData, "dynamicType"),
    gameSituation: readFormValue(formData, "gameSituation"),
    coordinationType: readFormValue(formData, "coordinationType"),
    visibility: readFormValue(formData, "visibility"),
    diagramData: readFormValue(formData, "diagramData"),
  };
}

type EnumSelectProps = {
  readonly name: string;
  readonly label: string;
  readonly defaultValue: string;
  readonly options: ReadonlyArray<{ value: string; label: string }>;
};

function EnumSelect({ name, label, defaultValue, options }: EnumSelectProps) {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input name={name} type="hidden" value={value} />
      <Select onValueChange={setValue} value={value}>
        <SelectTrigger className="w-full bg-bg-secondary" id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
