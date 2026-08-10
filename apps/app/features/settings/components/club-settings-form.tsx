"use client";

import type { AgeBandPolicy } from "@repo/database/age-band-policy";
import { CameraIcon } from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { validateImageFile } from "@repo/storage/image-validation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearClubBrandingLogo, updateClubBranding } from "../actions/team-settings";
import { updateClubAgeBandPolicyField } from "../actions/settings-field-actions";
import { useSettingsAutosave } from "../hooks/use-settings-autosave";
import { PrimerosPasosReopenSection } from "./primeros-pasos-reopen-section";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type ClubSettingsFormProps = {
  readonly teamId: string;
  readonly userId: string;
  readonly clubId: string;
  readonly canEdit: boolean;
  readonly clubName: string;
  readonly clubLogoUrl: string | null;
  readonly clubAgePolicy: AgeBandPolicy;
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
  teamId,
  userId,
  clubId,
  canEdit,
  clubName,
  clubLogoUrl,
  clubAgePolicy,
}: ClubSettingsFormProps) {
  const inputReference = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    clubLogoUrl
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { saveImmediate, saveDebounced, flushDebounced } = useSettingsAutosave({
    teamId,
    routeKey: "club",
  });

  const [assisted, setAssisted] = useState(
    String(clubAgePolicy.assistedMaxAgeExclusive)
  );
  const [guided, setGuided] = useState(
    String(clubAgePolicy.guidedMaxAgeExclusive)
  );
  const [majority, setMajority] = useState(
    String(clubAgePolicy.adultMajorityAge)
  );
  const [youthSupervision, setYouthSupervision] = useState(
    clubAgePolicy.independentYouthSupervisionEnabled
  );
  const [missReceive, setMissReceive] = useState(
    clubAgePolicy.guardianMissReceiveEnabled
  );
  const [careReceive, setCareReceive] = useState(
    clubAgePolicy.guardianCareAlertReceiveEnabled
  );

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

  const buildAgeFormData = (overrides?: {
    assisted?: string;
    guided?: string;
    majority?: string;
    youthSupervision?: boolean;
    missReceive?: boolean;
    careReceive?: boolean;
  }): FormData => {
    const formData = new FormData();
    formData.set(
      "age_assistedMaxAgeExclusive",
      overrides?.assisted ?? assisted
    );
    formData.set("age_guidedMaxAgeExclusive", overrides?.guided ?? guided);
    formData.set("age_adultMajorityAge", overrides?.majority ?? majority);
    const nextYouth =
      overrides?.youthSupervision !== undefined
        ? overrides.youthSupervision
        : youthSupervision;
    const nextMiss =
      overrides?.missReceive !== undefined
        ? overrides.missReceive
        : missReceive;
    const nextCare =
      overrides?.careReceive !== undefined
        ? overrides.careReceive
        : careReceive;
    if (nextYouth) {
      formData.set("age_independentYouthSupervisionEnabled", "on");
    }
    if (nextMiss) {
      formData.set("age_guardianMissReceiveEnabled", "on");
    }
    if (nextCare) {
      formData.set("age_guardianCareAlertReceiveEnabled", "on");
    }
    return formData;
  };

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

      <SettingsSection
        description="Los equipos sin override heredan estos valores."
        title="Política de edad del club"
      >
        {!canEdit ? (
          <p className="py-3 text-sm text-text-secondary">
            Solo lectura. Necesitas permisos de coordinación para editar la
            política del club.
          </p>
        ) : null}
        <SettingsRow htmlFor="club-age-assisted" label="Asistida hasta">
          <Input
            id="club-age-assisted"
            type="number"
            min={0}
            max={100}
            disabled={!canEdit}
            value={assisted}
            onChange={(event) => {
              const next = event.target.value;
              setAssisted(next);
              if (!canEdit) {
                return;
              }
              saveDebounced("club-assisted", () =>
                updateClubAgeBandPolicyField(
                  buildAgeFormData({ assisted: next })
                )
              );
            }}
            onBlur={() => {
              if (!canEdit) {
                return;
              }
              flushDebounced("club-assisted", () =>
                updateClubAgeBandPolicyField(buildAgeFormData())
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="club-age-guided" label="Guiada hasta">
          <Input
            id="club-age-guided"
            type="number"
            min={0}
            max={100}
            disabled={!canEdit}
            value={guided}
            onChange={(event) => {
              const next = event.target.value;
              setGuided(next);
              if (!canEdit) {
                return;
              }
              saveDebounced("club-guided", () =>
                updateClubAgeBandPolicyField(buildAgeFormData({ guided: next }))
              );
            }}
            onBlur={() => {
              if (!canEdit) {
                return;
              }
              flushDebounced("club-guided", () =>
                updateClubAgeBandPolicyField(buildAgeFormData())
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="club-age-majority" label="Mayoría desde">
          <Input
            id="club-age-majority"
            type="number"
            min={0}
            max={100}
            disabled={!canEdit}
            value={majority}
            onChange={(event) => {
              const next = event.target.value;
              setMajority(next);
              if (!canEdit) {
                return;
              }
              saveDebounced("club-majority", () =>
                updateClubAgeBandPolicyField(
                  buildAgeFormData({ majority: next })
                )
              );
            }}
            onBlur={() => {
              if (!canEdit) {
                return;
              }
              flushDebounced("club-majority", () =>
                updateClubAgeBandPolicyField(buildAgeFormData())
              );
            }}
          />
        </SettingsRow>
        <SettingsRow
          htmlFor="club-age-youth"
          label="Supervisión en independiente juvenil"
        >
          <input
            id="club-age-youth"
            type="checkbox"
            disabled={!canEdit}
            className="size-4 rounded border-border-secondary accent-brand"
            checked={youthSupervision}
            onChange={(event) => {
              const next = event.target.checked;
              setYouthSupervision(next);
              if (!canEdit) {
                return;
              }
              saveImmediate(() =>
                updateClubAgeBandPolicyField(
                  buildAgeFormData({ youthSupervision: next })
                )
              );
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="club-age-miss" label="Tutor recibe avisos de falta">
          <input
            id="club-age-miss"
            type="checkbox"
            disabled={!canEdit}
            className="size-4 rounded border-border-secondary accent-brand"
            checked={missReceive}
            onChange={(event) => {
              const next = event.target.checked;
              setMissReceive(next);
              if (!canEdit) {
                return;
              }
              saveImmediate(() =>
                updateClubAgeBandPolicyField(
                  buildAgeFormData({ missReceive: next })
                )
              );
            }}
          />
        </SettingsRow>
        <SettingsRow
          htmlFor="club-age-care"
          label="Tutor recibe alertas de cuidado"
        >
          <input
            id="club-age-care"
            type="checkbox"
            disabled={!canEdit}
            className="size-4 rounded border-border-secondary accent-brand"
            checked={careReceive}
            onChange={(event) => {
              const next = event.target.checked;
              setCareReceive(next);
              if (!canEdit) {
                return;
              }
              saveImmediate(() =>
                updateClubAgeBandPolicyField(
                  buildAgeFormData({ careReceive: next })
                )
              );
            }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
