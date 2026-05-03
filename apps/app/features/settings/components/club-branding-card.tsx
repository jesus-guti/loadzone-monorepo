"use client";

import { CameraIcon } from "@heroicons/react/20/solid";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateClubBranding } from "../actions/team-settings";

type ClubBrandingCardProperties = {
  readonly canEdit: boolean;
  readonly clubLogoUrl: string | null;
  readonly clubName: string;
};

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClubBrandingCard({
  canEdit,
  clubLogoUrl,
  clubName,
}: ClubBrandingCardProperties) {
  const inputReference = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(clubLogoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentLogoUrl(clubLogoUrl);
  }, [clubLogoUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelection = (file: File | null | undefined): void => {
    if (!file || !canEdit) {
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
      formData.set("file", file);

      const result = await updateClubBranding(formData);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo actualizar el logo del club.");
        setPreviewUrl((currentPreviewUrl) => {
          if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl);
          }

          return null;
        });
        return;
      }

      setCurrentLogoUrl(result.logoUrl ?? null);
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }

        return null;
      });
      toast.success("Logo del club actualizado.");
    });
  };

  return (
    <Card className="rounded-xl border-border-secondary">
      <CardHeader>
        <CardTitle className="text-base text-text-primary">
          Branding del club
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            className="group relative rounded-2xl"
            disabled={!canEdit || isPending}
            onClick={() => inputReference.current?.click()}
            type="button"
          >
            <Avatar className="size-16 rounded-2xl border border-border-secondary">
              {previewUrl || currentLogoUrl ? (
                <AvatarImage
                  alt={clubName}
                  className="object-contain p-1"
                  src={previewUrl ?? currentLogoUrl ?? undefined}
                />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-bg-secondary text-sm font-semibold text-text-primary">
                {getInitials(clubName)}
              </AvatarFallback>
            </Avatar>
            {canEdit ? (
              <span className="absolute -right-1 -bottom-1 rounded-full border border-border-secondary bg-bg-primary p-1.5 text-text-secondary shadow-sm transition-colors group-hover:text-text-primary">
                <CameraIcon className="size-4" />
              </span>
            ) : null}
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {clubName}
            </p>
            <p className="text-sm text-text-secondary">
              Icono principal del shell y branding básico.
            </p>
          </div>
        </div>
        {canEdit ? (
          <Button
            disabled={isPending}
            onClick={() => inputReference.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            {isPending ? "Subiendo..." : "Cambiar logo"}
          </Button>
        ) : (
          <p className="text-sm text-text-secondary">
            Solo los coordinadores pueden actualizar el logo del club.
          </p>
        )}
        <input
          accept="image/avif,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            handleFileSelection(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
          ref={inputReference}
          type="file"
        />
      </CardContent>
    </Card>
  );
}
