"use client";

import {
  ArrowUpTrayIcon,
  PhotoIcon,
} from "@heroicons/react/20/solid";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { toast } from "@repo/design-system/components/ui/sonner";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useRef, useState, useTransition } from "react";
import { updatePlayerPhoto } from "../actions/player-actions";

type PlayerPhotoCellProperties = {
  readonly imageUrl: string | null;
  readonly playerId: string;
  readonly playerName: string;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerPhotoCell({
  imageUrl,
  playerId,
  playerName,
}: PlayerPhotoCellProperties) {
  const inputReference = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(imageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileUpload = (file: File | null | undefined): void => {
    if (!file) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });

    startTransition(async () => {
      const formData = new FormData();
      formData.set("playerId", playerId);
      formData.set("file", file);

      const result = await updatePlayerPhoto(formData);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo subir la imagen.");
        setPreviewUrl((currentPreviewUrl) => {
          if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl);
          }

          return null;
        });
        return;
      }

      setCurrentImageUrl(result.imageUrl ?? null);
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }

        return null;
      });
      toast.success(`Foto actualizada para ${playerName}.`);
    });
  };

  return (
    <div className="flex items-center">
      <button
        className={cn(
          "group relative rounded-xl transition-opacity",
          isPending && "pointer-events-none opacity-70"
        )}
        onClick={() => inputReference.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFileUpload(event.dataTransfer.files?.[0] ?? null);
        }}
        type="button"
      >
        <Avatar className="size-10 rounded-xl border border-border-secondary">
          {previewUrl || currentImageUrl ? (
            <AvatarImage
              alt={playerName}
              className="object-cover"
              src={previewUrl ?? currentImageUrl ?? undefined}
            />
          ) : null}
          <AvatarFallback className="rounded-xl bg-bg-secondary text-xs font-semibold text-text-primary">
            {getInitials(playerName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-1 -bottom-1 rounded-full border border-border-secondary bg-bg-primary p-1 text-text-secondary shadow-sm transition-colors group-hover:text-text-primary">
          {currentImageUrl || previewUrl ? (
            <ArrowUpTrayIcon className="size-3" />
          ) : (
            <PhotoIcon className="size-3" />
          )}
        </span>
      </button>
      <input
        accept="image/avif,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          handleFileUpload(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
        ref={inputReference}
        type="file"
      />
    </div>
  );
}
