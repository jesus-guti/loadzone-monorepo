"use client";

import { CameraIcon } from "@phosphor-icons/react/ssr";
import { useSession } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { toast } from "@repo/design-system/components/sonner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { updateCurrentUserProfile } from "@/actions/profile-actions";
import { useSettingsAutosave } from "../hooks/use-settings-autosave";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

type CuentaSettingsFormProps = {
  readonly teamId: string;
  readonly email: string;
  readonly name: string | null;
  readonly imageUrl: string | null;
};

function getInitials(name: string | null, email: string): string {
  if (name && name.trim().length > 0) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export function CuentaSettingsForm({
  teamId,
  email,
  name,
  imageUrl,
}: CuentaSettingsFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const inputReference = useRef<HTMLInputElement | null>(null);
  const { saveDebounced, flushDebounced } = useSettingsAutosave({
    teamId,
    routeKey: "cuenta",
  });
  const [nameValue, setNameValue] = useState(name ?? "");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    imageUrl
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setNameValue(name ?? "");
  }, [name]);

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

  const saveName = async (nextName: string) => {
    const formData = new FormData();
    formData.set("name", nextName);
    const result = await updateCurrentUserProfile(formData);
    if (result.success) {
      await update();
      router.refresh();
    }
    return result;
  };

  const handleAvatarFile = (file: File | null): void => {
    if (!file) {
      return;
    }
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextPreview;
    });

    void (async () => {
      const formData = new FormData();
      formData.set("name", nameValue.trim().length >= 2 ? nameValue : email);
      formData.set("file", file);
      const result = await updateCurrentUserProfile(formData);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo actualizar la foto.");
        setPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return null;
        });
        return;
      }
      setCurrentImageUrl(result.image ?? null);
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      await update();
      router.refresh();
    })();
  };

  const displayImage = previewUrl ?? currentImageUrl;

  return (
    <div>
      <SettingsSection title="Perfil">
        <SettingsRow label="Avatar / foto">
          <div className="flex items-center justify-end gap-3">
            <button
              className="group relative rounded-full"
              onClick={() => inputReference.current?.click()}
              type="button"
            >
              <Avatar className="size-12 border border-border-secondary">
                {displayImage ? (
                  <AvatarImage
                    alt={nameValue || email}
                    className="object-cover"
                    src={displayImage}
                  />
                ) : null}
                <AvatarFallback className="bg-bg-secondary font-semibold text-sm text-text-primary">
                  {getInitials(nameValue || name, email)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -right-1 -bottom-1 rounded-full border border-border-secondary bg-bg-primary p-1 text-text-secondary">
                <CameraIcon className="size-3" />
              </span>
            </button>
            <Button
              onClick={() => inputReference.current?.click()}
              size="sm"
              type="button"
              variant="outline"
            >
              Cambiar
            </Button>
            <input
              accept="image/avif,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                handleAvatarFile(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
              ref={inputReference}
              type="file"
            />
          </div>
        </SettingsRow>
        <SettingsRow htmlFor="settings-profile-name" label="Nombre">
          <Input
            id="settings-profile-name"
            value={nameValue}
            onChange={(event) => {
              const next = event.target.value;
              setNameValue(next);
              if (next.trim().length < 2) {
                return;
              }
              saveDebounced("profile-name", () => saveName(next));
            }}
            onBlur={() => {
              if (nameValue.trim().length < 2) {
                return;
              }
              flushDebounced("profile-name", () => saveName(nameValue));
            }}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-profile-email" label="Email">
          <Input disabled id="settings-profile-email" value={email} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Apariencia">
        <SettingsRow label="Tema / modo">
          <div className="flex justify-end">
            <ModeToggle />
          </div>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
