"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useMemo, useState } from "react";
import type { ExerciseLibraryItem } from "./types";

type ExerciseLibraryPanelProps = {
  readonly exercises: ReadonlyArray<ExerciseLibraryItem>;
  readonly onAdd: (exercise: ExerciseLibraryItem) => void;
};

const COMPLEXITY_LABEL: Record<ExerciseLibraryItem["complexity"], string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  VERY_HIGH: "Muy alta",
};

export function ExerciseLibraryPanel({
  exercises,
  onAdd,
}: ExerciseLibraryPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return exercises;
    return exercises.filter((entry) =>
      entry.name.toLowerCase().includes(normalized)
    );
  }, [exercises, query]);

  return (
    <aside className="flex h-full flex-col gap-3 rounded-lg border border-border-secondary bg-bg-primary p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary">
          Biblioteca de ejercicios
        </h3>
        <p className="text-xs text-text-secondary">
          Arrastra al builder o pulsa el +.
        </p>
      </div>
      <Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar ejercicio..."
        value={query}
      />
      <div className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1">
        {filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-text-tertiary">
            No hay ejercicios.
          </p>
        ) : (
          filtered.map((exercise) => (
            <DraggableExerciseCard
              exercise={exercise}
              key={exercise.id}
              onAdd={() => onAdd(exercise)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

type DraggableExerciseCardProps = {
  readonly exercise: ExerciseLibraryItem;
  readonly onAdd: () => void;
};

function DraggableExerciseCard({
  exercise,
  onAdd,
}: DraggableExerciseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `library-${exercise.id}`,
      data: { exercise },
    });

  return (
    <div
      className={cn(
        "rounded-md border border-border-secondary bg-bg-secondary/40 p-3 transition-shadow",
        isDragging && "opacity-50"
      )}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <div
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <p className="text-sm font-medium text-text-primary">{exercise.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
          <Badge variant="secondary">{exercise.durationMinutes} min</Badge>
          <Badge variant="outline">
            {COMPLEXITY_LABEL[exercise.complexity]}
          </Badge>
        </div>
      </div>
      <Button
        className="mt-2 w-full"
        onClick={onAdd}
        size="sm"
        type="button"
        variant="ghost"
      >
        <PlusIcon className="mr-1 size-4" />
        Añadir
      </Button>
    </div>
  );
}
