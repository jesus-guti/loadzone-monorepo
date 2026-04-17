"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useActionState, useEffect } from "react";
import {
  createExercise,
  updateExercise,
} from "../actions/exercise-actions";
import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
} from "./exercise-enums";
import { DiagramPlaceholder } from "./diagram-placeholder";
import { FieldLabel, FormSection } from "../../sessions/components/form-section";

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
};

type ExerciseFormProps = {
  readonly mode: "create" | "edit";
  readonly defaults?: ExerciseDefaults;
};

export function ExerciseForm({
  mode,
  defaults = {},
}: ExerciseFormProps) {
  const action = mode === "create" ? createExercise : updateExercise;
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && defaults.id ? (
        <input name="id" type="hidden" value={defaults.id} />
      ) : null}

      <FormSection
        description="Información principal del ejercicio."
        title="Detalles"
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            autoFocus
            defaultValue={defaults.name}
            id="name"
            name="name"
            placeholder="Rondo 4v2 con apoyos"
            required
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="objectivesText">Objetivos</FieldLabel>
          <Textarea
            defaultValue={defaults.objectivesText}
            id="objectivesText"
            name="objectivesText"
            placeholder="Mejorar la circulación rápida del balón..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="explanationText">Explicación</FieldLabel>
          <Textarea
            defaultValue={defaults.explanationText}
            id="explanationText"
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
            <FieldLabel htmlFor="minPlayers">Mín. jugadores</FieldLabel>
            <Input
              defaultValue={defaults.minPlayers ?? 4}
              id="minPlayers"
              max={50}
              min={1}
              name="minPlayers"
              required
              type="number"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="maxPlayers">Máx. jugadores</FieldLabel>
            <Input
              defaultValue={defaults.maxPlayers ?? 12}
              id="maxPlayers"
              max={60}
              min={1}
              name="maxPlayers"
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
        </div>
      </FormSection>

      <FormSection
        description="Espacio reservado para diseñar el croquis del ejercicio."
        title="Pizarra"
      >
        <DiagramPlaceholder />
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button disabled={isPending} type="submit">
          {isPending
            ? "Guardando..."
            : mode === "create"
              ? "Crear ejercicio"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

type EnumSelectProps = {
  readonly name: string;
  readonly label: string;
  readonly defaultValue: string;
  readonly options: ReadonlyArray<{ value: string; label: string }>;
};

function EnumSelect({
  name,
  label,
  defaultValue,
  options,
}: EnumSelectProps) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select defaultValue={defaultValue} name={name}>
        <SelectTrigger className="w-full" id={name}>
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
