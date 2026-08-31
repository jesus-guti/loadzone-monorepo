"use client";

import { CameraIcon } from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import { validateImageFile } from "@repo/storage/image-validation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearClubBrandingLogo, updateClubBranding } from "../actions/team-settings";
import { PrimerosPasosReopenSection } from "./primeros-pasos-reopen-section";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type ClubSettingsFormProps = {
  readonly userId: string;
  readonly clubId: string;
  readonly canEdit: boolean;
  readonly clubName: string;
  readonly clubLogoUrl: string | null;
};

const WHITESPACE_PATTERN = /\s+/;

function getInitials(value: string): string {
  return value
    .trim()
    .split(WHITESPACE_PATTERN)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClubSettingsForm({
  userId,
  clubId,
  canEdit,
  clubName,
  clubLogoUrl,
}: ClubSettingsFormProps) {
  const inputReference = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    clubLogoUrl
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentLogoUrl(clubLogoUrl);
  }, [clubLogoUrl]);

  useEffect(() => {
    const urlToRevoke = previewUrl;
    return () => {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [previewUrl]);

  const handleFileSelection = (file: File | null | undefined): void => {
    if (!file || !canEdit) {
      return;
    }

    startTransition(async () => {
      try {
        await validateImageFile(file);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Imagen no válida.");
        return;
      }

      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        return nextPreviewUrl;
      });

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
    });
  };

  const handleClearLogo = (): void => {
    if (!canEdit) {
      return;
    }
    startTransition(async () => {
      const result = await clearClubBrandingLogo();
      if (!result.success) {
        toast.error(result.error ?? "No se pudo quitar el logo del club.");
        return;
      }
      setCurrentLogoUrl(null);
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        return null;
      });
    });
  };

  return (
    <div>
      <SettingsSection title="Marca">
        <SettingsRow label="Logo">
          <div className="flex items-center justify-end gap-3">
            <button
              className="group relative rounded-2xl"
              disabled={!canEdit || isPending}
              onClick={() => inputReference.current?.click()}
              type="button"
            >
              <Avatar className="size-12 rounded-2xl border border-border-secondary">
                {previewUrl !== null || currentLogoUrl !== null ? (
                  <AvatarImage
                    alt={clubName}
                    className="object-contain p-1"
                    src={previewUrl ?? currentLogoUrl ?? undefined}
                  />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-bg-secondary font-semibold text-sm text-text-primary">
                  {getInitials(clubName)}
                </AvatarFallback>
              </Avatar>
              {canEdit ? (
                <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-border-secondary bg-bg-primary text-text-secondary">
                  <CameraIcon className="size-3" />
                </span>
              ) : null}
            </button>
            {canEdit ? (
              <div className="flex flex-col gap-1">
                <Button
                  disabled={isPending}
                  onClick={() => inputReference.current?.click()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isPending ? "Subiendo..." : "Cambiar"}
                </Button>
                {Boolean(currentLogoUrl) || Boolean(previewUrl) ? (
                  <Button
                    disabled={isPending}
                    onClick={handleClearLogo}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Quitar
                  </Button>
                ) : null}
              </div>
            ) : null}
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
          </div>
        </SettingsRow>
        <SettingsRow label="Nombre del club">
          <p className="truncate text-right text-sm text-text-primary">
            {clubName}
          </p>
        </SettingsRow>
        {!canEdit ? (
          <p className="pt-2 text-xs text-text-secondary">
            Solo los coordinadores pueden actualizar el logo del club.
          </p>
        ) : null}
      </SettingsSection>

      <PrimerosPasosReopenSection clubId={clubId} userId={userId} />
    </div>
  );
}
