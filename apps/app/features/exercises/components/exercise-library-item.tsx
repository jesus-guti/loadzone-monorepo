"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@repo/design-system/components/ui/item";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { ExerciseLibraryListItem } from "../types";
import { BoardPreview } from "./board-preview";
import { COMPLEXITY_OPTIONS, STRATEGY_OPTIONS } from "./exercise-enums";
import { ExerciseLibraryFavoriteButton } from "./exercise-library-favorite-button";
import { exerciseLibraryQueryKey } from "./exercise-library-keys";
import { ExerciseRowActions } from "./exercise-row-actions";

type ExerciseLibraryItemProps = {
  readonly item: ExerciseLibraryListItem;
  readonly membershipId: string;
  readonly clubId: string;
};

function getComplexityLabel(value: string): string {
  return COMPLEXITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function getStrategyLabel(value: string): string {
  return STRATEGY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function visibilityLabel(item: ExerciseLibraryListItem): string {
  if (item.isSystem) {
    return "Público";
  }
  if (item.visibility === "PRIVATE") {
    return "Privado";
  }
  return "Club";
}

function authorLabel(
  item: ExerciseLibraryListItem,
  membershipId: string
): string {
  if (item.isSystem) {
    return "LoadZone";
  }
  if (item.createdByMembershipId === membershipId) {
    return "Tú";
  }
  return item.createdByUserName ?? "Desconocido";
}

export function ExerciseLibraryItemRow({
  item,
  membershipId,
  clubId,
}: ExerciseLibraryItemProps) {
  const queryClient = useQueryClient();

  const invalidateLibrary = (): void => {
    queryClient
      .invalidateQueries({ queryKey: exerciseLibraryQueryKey })
      .catch(() => {
        /* refresco opcional; ignorar fallo silencioso */
      });
  };

  return (
    <Item
      className="w-full rounded-none border-0 border-border-secondary border-b bg-transparent px-3 py-3 last:border-b-0 hover:bg-bg-tertiary/40"
      size="sm"
      variant="default"
    >
      <div className="flex w-full min-w-0 flex-wrap items-center gap-3">
        {/* `variant="image"` fuerza `size-10` en el DS y deja la altura fija en 40px: con ancho grande el croquis queda "chato". */}
        <ItemMedia
          className="aspect-1200/780 w-[min(100%,13.5rem)] max-w-full shrink-0 self-start overflow-hidden rounded-sm bg-bg-secondary sm:w-56 [&_img]:size-full [&_img]:object-cover"
          variant="default"
        >
          <span className="relative block h-full w-full min-h-0">
            <BoardPreview
              className="absolute inset-0"
              data={item.diagramDataJson ?? undefined}
              density="compact"
            />
          </span>
        </ItemMedia>

        <ItemContent className="min-w-0 flex-1 gap-1">
          <ItemTitle className="min-w-0">
            <Link
              className="truncate font-medium text-text-primary hover:underline"
              href={`/exercises/${item.id}`}
            >
              {item.name}
            </Link>
          </ItemTitle>
          <ItemDescription className="line-clamp-2 text-xs">
            {getComplexityLabel(item.complexity)} ·{" "}
            {getStrategyLabel(item.strategy)} · {item.durationMinutes} min ·{" "}
            {authorLabel(item, membershipId)}
          </ItemDescription>
        </ItemContent>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Badge
            variant={item.visibility === "PRIVATE" ? "secondary" : "outline"}
          >
            {visibilityLabel(item)}
          </Badge>
          <span className="hidden font-mono text-xs font-medium text-text-primary sm:inline">
            {item.slug}
          </span>
          <ItemActions className="gap-0">
            <ExerciseLibraryFavoriteButton
              exerciseId={item.id}
              exerciseName={item.name}
              isFavorite={item.isFavorite}
            />
            <ExerciseRowActions
              canDelete={!item.isSystem && item.clubId === clubId}
              canToggleVisibility={
                !item.isSystem && item.createdByMembershipId === membershipId
              }
              exerciseId={item.id}
              exerciseName={item.name}
              isPrivate={item.visibility === "PRIVATE"}
              onAfterMutation={invalidateLibrary}
            />
          </ItemActions>
        </div>
      </div>
    </Item>
  );
}

type ExerciseLibraryGroupProps = {
  readonly title: string;
  readonly items: readonly ExerciseLibraryListItem[];
  readonly membershipId: string;
  readonly clubId: string;
};

export function ExerciseLibraryGroup({
  title,
  items,
  membershipId,
  clubId,
}: ExerciseLibraryGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-medium tracking-wide text-text-secondary uppercase">
        {title}
      </h2>
      <ItemGroup className="overflow-hidden border-0 border-border-secondary">
        {items.map((item) => (
          <ExerciseLibraryItemRow
            clubId={clubId}
            item={item}
            key={item.id}
            membershipId={membershipId}
          />
        ))}
      </ItemGroup>
    </section>
  );
}
