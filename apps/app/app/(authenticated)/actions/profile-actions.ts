"use server";

import { currentUser } from "@repo/auth/server";
import { database } from "@repo/database";
import { buildObjectKey, uploadImage } from "@repo/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ProfileActionResult = {
  success: boolean;
  error?: string;
  image?: string | null;
  name?: string | null;
};

const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
});

export async function updateCurrentUserProfile(
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const authenticatedUser = await currentUser();
    if (!authenticatedUser) {
      return { success: false, error: "No autorizado." };
    }

    const parsed = profileSchema.safeParse({
      name: formData.get("name"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const file = formData.get("file");
    const clubId = authenticatedUser.memberships[0]?.clubId;

    const currentDatabaseUser = await database.user.findUnique({
      where: { id: authenticatedUser.id },
      select: {
        id: true,
        image: true,
      },
    });

    if (!currentDatabaseUser) {
      return { success: false, error: "Usuario no encontrado." };
    }

    let nextImage = currentDatabaseUser.image;

    if (file instanceof File && file.size > 0) {
      const imageUpload = await uploadImage({
        file,
        objectKey: buildObjectKey({
          target: "user",
          clubId,
          entityId: authenticatedUser.id,
          fileName: file.name || `${parsed.data.name}.webp`,
        }),
        previousUrl: currentDatabaseUser.image,
      });

      nextImage = imageUpload.pathname;
    }

    const updatedUser = await database.user.update({
      where: { id: authenticatedUser.id },
      data: {
        image: nextImage,
        name: parsed.data.name,
      },
      select: {
        image: true,
        name: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");

    return {
      success: true,
      image: updatedUser.image,
      name: updatedUser.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el perfil.",
    };
  }
}
