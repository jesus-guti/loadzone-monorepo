"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ListIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr";
import type { SessionBuilderItem } from "./types";

type SessionBuilderProps = {
  readonly items: SessionBuilderItem[];
  readonly onUpdate: (uid: string, patch: Partial<SessionBuilderItem>) => void;
  readonly onRemove: (uid: string) => void;
};

export const BUILDER_DROPPABLE_ID = "session-builder-drop";

export function SessionBuilder({
  items,
  onUpdate,
  onRemove,
}: SessionBuilderProps) {
  const { isOver, setNodeRef } = useDroppable({ id: BUILDER_DROPPABLE_ID });

  return (
    <SortableContext items={items.map((item) => item.uid)}>
      <div
        className={cn(
          "min-h-[240px] rounded-md border border-dashed p-3 transition-colors",
          isOver
            ? "border-brand bg-brand/5"
            : "border-border-secondary bg-bg-secondary/30"
        )}
        ref={setNodeRef}
      >
        {items.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-1 text-center text-sm text-text-tertiary">
            <p>Arrastra ejercicios aquí</p>
            <p className="text-xs">o pulsa el + en la biblioteca</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <SortableExerciseRow
                index={index}
                item={item}
                key={item.uid}
                onRemove={() => onRemove(item.uid)}
                onUpdate={(patch) => onUpdate(item.uid, patch)}
              />
            ))}
          </ul>
        )}
      </div>
    </SortableContext>
  );
}

type SortableExerciseRowProps = {
  readonly item: SessionBuilderItem;
  readonly index: number;
  readonly onUpdate: (patch: Partial<SessionBuilderItem>) => void;
  readonly onRemove: () => void;
};

function SortableExerciseRow({
  item,
  index,
  onUpdate,
  onRemove,
}: SortableExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.uid });

  return (
    <li
      className={cn(
        "rounded-md border border-border-secondary bg-bg-primary p-3 transition-shadow",
        isDragging && "shadow-lg"
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label="Reordenar"
          className="mt-1 cursor-grab text-text-tertiary active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <ListIcon className="size-4" />
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-text-primary">
              {index + 1}. {item.name}
            </p>
            <Button
              aria-label="Quitar ejercicio"
              onClick={onRemove}
              size="icon"
              type="button"
              variant="ghost"
            >
              <TrashIcon className="size-4 text-text-tertiary" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
            <div className="space-y-1">
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary"
                htmlFor={`duration-${item.uid}`}
              >
                Duración (min)
              </label>
              <Input
                id={`duration-${item.uid}`}
                min={1}
                onChange={(event) =>
                  onUpdate({
                    durationOverride: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
                placeholder={`${item.durationMinutes}`}
                type="number"
                value={item.durationOverride ?? ""}
              />
            </div>
            <div className="space-y-1">
              <label
                className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary"
                htmlFor={`notes-${item.uid}`}
              >
                Notas
              </label>
              <Textarea
                className="min-h-[40px]"
                id={`notes-${item.uid}`}
                onChange={(event) => onUpdate({ notes: event.target.value })}
                placeholder="Indicaciones específicas para esta sesión..."
                rows={2}
                value={item.notes}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
