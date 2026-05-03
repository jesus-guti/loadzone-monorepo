"use client";

import { CameraIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { useSession } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateCurrentUserProfile } from "@/actions/profile-actions";

type EditProfileDialogProperties = {
  readonly email: string;
  readonly imageUrl: string | null;
  readonly name: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
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

export function EditProfileDialog({
  email,
  imageUrl,
  name,
  open,
  onOpenChange,
}: EditProfileDialogProperties) {
  const inputReference = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [nameValue, setNameValue] = useState<string>(name ?? "");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const displayImage = previewUrl ?? currentImageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu foto y la información básica de tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-3">
            <button
              className="group relative rounded-2xl"
              onClick={() => inputReference.current?.click()}
              type="button"
            >
              <Avatar className="size-24 rounded-2xl border border-border-secondary">
                {displayImage ? (
                  <AvatarImage
                    alt={nameValue || email}
                    className="object-cover"
                    src={displayImage}
                  />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-bg-secondary text-lg font-semibold text-text-primary">
                  {getInitials(nameValue || name, email)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -right-1 -bottom-1 rounded-full border border-border-secondary bg-bg-primary p-1.5 text-text-secondary shadow-sm transition-colors group-hover:text-text-primary">
                <CameraIcon className="size-4" />
              </span>
            </button>
            <Button
              onClick={() => inputReference.current?.click()}
              size="sm"
              type="button"
              variant="outline"
            >
              <PencilSquareIcon className="size-4" />
              Cambiar foto
            </Button>
            <input
              accept="image/avif,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setPreviewUrl((currentPreviewUrl) => {
                  if (currentPreviewUrl) {
                    URL.revokeObjectURL(currentPreviewUrl);
                  }

                  return file ? URL.createObjectURL(file) : null;
                });
                event.currentTarget.value = "";
              }}
              ref={inputReference}
              type="file"
            />
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              startTransition(async () => {
                const formData = new FormData();
                formData.set("name", nameValue);
                if (selectedFile) {
                  formData.set("file", selectedFile);
                }

                const result = await updateCurrentUserProfile(formData);
                if (!result.success) {
                  toast.error(result.error ?? "No se pudo actualizar el perfil.");
                  return;
                }

                setCurrentImageUrl(result.image ?? null);
                setSelectedFile(null);
                setPreviewUrl((currentPreviewUrl) => {
                  if (currentPreviewUrl) {
                    URL.revokeObjectURL(currentPreviewUrl);
                  }

                  return null;
                });
                await update();
                router.refresh();
                toast.success("Perfil actualizado.");
                onOpenChange(false);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nombre</Label>
              <Input
                id="profile-name"
                onChange={(event) => setNameValue(event.target.value)}
                value={nameValue}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input disabled id="profile-email" value={email} />
            </div>
            <DialogFooter>
              <Button disabled={isPending} type="submit">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
