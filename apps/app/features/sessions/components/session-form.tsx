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
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useActionState, useEffect, useId, useState } from "react";
import { attachExercises, createSession } from "../actions/session-actions";
import { FieldLabel, FormSection } from "./form-section";
import { ExerciseLibraryPanel } from "./exercise-library-panel";
import { RecurrencePicker } from "./recurrence-picker";
import {
  BUILDER_DROPPABLE_ID,
  SessionBuilder,
} from "./session-builder";
import type { ExerciseLibraryItem, SessionBuilderItem } from "./types";
import { useRouter } from "next/navigation";

type SessionFormProps = {
  readonly defaultStartsAt: string;
  readonly defaultEndsAt: string;
  readonly preReminderMinutes: number | null;
  readonly postReminderMinutes: number | null;
  readonly exercises: ReadonlyArray<ExerciseLibraryItem>;
  readonly locations: ReadonlyArray<string>;
};

const SESSION_TYPES = [
  { value: "TRAINING", label: "Entrenamiento" },
  { value: "MATCH", label: "Partido" },
  { value: "RECOVERY", label: "Recuperación" },
  { value: "OTHER", label: "Otro" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "TEAM_PRIVATE", label: "Privada del equipo" },
  { value: "CLUB_SHARED", label: "Compartida del club" },
] as const;

export function SessionForm({
  defaultStartsAt,
  defaultEndsAt,
  preReminderMinutes,
  postReminderMinutes,
  exercises,
  locations,
}: SessionFormProps) {
  const router = useRouter();
  const formId = useId();
  const [state, action, isPending] = useActionState(createSession, {
    success: false,
  });
  const [type, setType] = useState<(typeof SESSION_TYPES)[number]["value"]>(
    "TRAINING"
  );
  const [visibility, setVisibility] = useState<
    (typeof VISIBILITY_OPTIONS)[number]["value"]
  >("TEAM_PRIVATE");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [builderItems, setBuilderItems] = useState<SessionBuilderItem[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [redirectTarget, setRedirectTarget] = useState<"session" | "new-exercise">("session");

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (state.success && state.sessionId) {
      if (builderItems.length > 0) {
        void attachExercises({
          sessionId: state.sessionId,
          items: builderItems.map((item, index) => ({
            exerciseId: item.exerciseId,
            order: index,
            durationMinutesOverride: item.durationOverride,
            notes: item.notes ? item.notes : null,
          })),
        }).then((result) => {
          if (!result.success && result.error) {
            toast.error(result.error);
          }
          router.push(redirectTarget === "new-exercise" ? "/exercises/new" : `/sessions/${state.sessionId}`);
        });
      } else {
        router.push(redirectTarget === "new-exercise" ? "/exercises/new" : `/sessions/${state.sessionId}`);
      }
    }
  }, [state, builderItems, router, redirectTarget]);

  function addExercise(exercise: ExerciseLibraryItem): void {
    setBuilderItems((prev) => [
      ...prev,
      {
        uid: `${exercise.id}-${Date.now()}`,
        exerciseId: exercise.id,
        name: exercise.name,
        durationMinutes: exercise.durationMinutes,
        durationOverride: null,
        notes: "",
      },
    ]);
  }

  function updateBuilderItem(
    uid: string,
    patch: Partial<SessionBuilderItem>
  ): void {
    setBuilderItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item))
    );
  }

  function removeBuilderItem(uid: string): void {
    setBuilderItems((prev) => prev.filter((item) => item.uid !== uid));
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over) return;

    const activeIdString = String(active.id);
    const overIdString = String(over.id);

    if (activeIdString.startsWith("library-")) {
      const exercise = active.data.current?.exercise as
        | ExerciseLibraryItem
        | undefined;
      if (
        exercise &&
        (overIdString === BUILDER_DROPPABLE_ID ||
          builderItems.some((item) => item.uid === overIdString))
      ) {
        addExercise(exercise);
      }
      return;
    }

    if (activeIdString !== overIdString) {
      setBuilderItems((items) => {
        const oldIndex = items.findIndex((entry) => entry.uid === activeIdString);
        const newIndex = items.findIndex((entry) => entry.uid === overIdString);
        if (oldIndex < 0 || newIndex < 0) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form
          action={action}
          className="space-y-6"
          id={formId}
        >
          <FormSection
            description="Información principal de la sesión."
            title="Detalles"
          >
            <div className="space-y-2">
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                autoFocus
                id="title"
                name="title"
                placeholder="Entrenamiento MD-1"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="type">Tipo</FieldLabel>
                <Select
                  name="type"
                  onValueChange={(value) =>
                    setType(value as (typeof SESSION_TYPES)[number]["value"])
                  }
                  value={type}
                >
                  <SelectTrigger className="w-full" id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="visibility">Visibilidad</FieldLabel>
                <Select
                  name="visibility"
                  onValueChange={(value) =>
                    setVisibility(
                      value as (typeof VISIBILITY_OPTIONS)[number]["value"]
                    )
                  }
                  value={visibility}
                >
                  <SelectTrigger className="w-full" id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="location">Ubicación</FieldLabel>
              <Input
                id="location"
                list="locations-list"
                name="location"
                placeholder="Campo principal, Polideportivo..."
              />
              {locations.length > 0 ? (
                <datalist id="locations-list">
                  {locations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              ) : null}
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="notes">Notas</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Indicaciones generales..."
                rows={3}
              />
            </div>
          </FormSection>

          <FormSection
            description="Cuándo empieza y termina la sesión."
            title="Programación"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="startsAt">Empieza</FieldLabel>
                <Input
                  id="startsAt"
                  name="startsAt"
                  onChange={(event) => setStartsAt(event.target.value)}
                  required
                  type="datetime-local"
                  value={startsAt}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="endsAt">Termina</FieldLabel>
                <Input
                  defaultValue={defaultEndsAt}
                  id="endsAt"
                  name="endsAt"
                  required
                  type="datetime-local"
                />
              </div>
            </div>
            <RecurrencePicker startsAt={startsAt} />
          </FormSection>

          <FormSection
            description="Avisos automáticos a los jugadores."
            title="Recordatorios"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="preReminderMinutes">
                  Pre (min)
                </FieldLabel>
                <Input
                  defaultValue={
                    preReminderMinutes !== null ? String(preReminderMinutes) : ""
                  }
                  id="preReminderMinutes"
                  max={1440}
                  min={0}
                  name="preReminderMinutes"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="postReminderMinutes">
                  Post (min)
                </FieldLabel>
                <Input
                  defaultValue={
                    postReminderMinutes !== null
                      ? String(postReminderMinutes)
                      : ""
                  }
                  id="postReminderMinutes"
                  max={1440}
                  min={0}
                  name="postReminderMinutes"
                  type="number"
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            description="Arrastra ejercicios desde la biblioteca lateral."
            title="Ejercicios"
          >
            <SessionBuilder
              items={builderItems}
              onRemove={removeBuilderItem}
              onUpdate={updateBuilderItem}
            />
          </FormSection>

          <div className="flex justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={() => setRedirectTarget("new-exercise")}
              type="submit"
              variant="outline"
            >
              {isPending ? "Guardando..." : "Guardar y crear ejercicio"}
            </Button>
            <Button
              disabled={isPending}
              onClick={() => setRedirectTarget("session")}
              type="submit"
            >
              {isPending ? "Guardando..." : "Guardar sesión"}
            </Button>
          </div>
        </form>

        <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
          <ExerciseLibraryPanel exercises={exercises} onAdd={addExercise} />
        </div>
      </div>
    </DndContext>
  );
}
