"use server";

import { auth } from "@repo/auth/server";
import { database, ensureBaseFormTemplates } from "@repo/database";
import { redirect } from "next/navigation";
import { z } from "zod";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const createTeamSchema = z.object({
  clubName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
  teamName: z
    .string()
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(100),
  teamCategory: z.string().max(100).optional(),
});

export async function createTeam(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const sessionUser = session?.user as
    | {
        id: string;
      }
    | undefined;

  if (!sessionUser?.id) {
    return { success: false, error: "No autorizado" };
  }

  const existing = await database.membership.findFirst({
    where: { userId: sessionUser.id },
    select: { id: true },
  });
  if (existing) {
    redirect("/");
  }

  const parsed = createTeamSchema.safeParse({
    clubName: formData.get("clubName"),
    teamName: formData.get("teamName"),
    teamCategory: formData.get("teamCategory") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await ensureBaseFormTemplates();

    const baseSlug = slugify(parsed.data.clubName);
    const existingSlugs = await database.club.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });

    const slug =
      existingSlugs.length === 0
        ? baseSlug
        : `${baseSlug}-${existingSlugs.length + 1}`;

    const [preTemplate, postTemplate] = await Promise.all([
      database.formTemplate.findUnique({
        where: { code: "system-wellness-pre" },
        select: { id: true },
      }),
      database.formTemplate.findUnique({
        where: { code: "system-rpe-post" },
        select: { id: true },
      }),
    ]);

    const defaultAssignments = [
      preTemplate
        ? {
            template: {
              connect: { id: preTemplate.id },
            },
            fillMoment: "PRE_SESSION" as const,
          }
        : null,
      postTemplate
        ? {
            template: {
              connect: { id: postTemplate.id },
            },
            fillMoment: "POST_SESSION" as const,
          }
        : null,
    ].filter((assignment) => assignment !== null);

    await database.club.create({
      data: {
        name: parsed.data.clubName,
        slug,
        memberships: {
          create: {
            userId: sessionUser.id,
            role: "COORDINATOR",
            hasAllTeams: true,
          },
        },
        teams: {
          create: {
            name: parsed.data.teamName,
            category:
              parsed.data.teamCategory && parsed.data.teamCategory.length > 0
                ? parsed.data.teamCategory
                : null,
            forms: {
              create: defaultAssignments,
            },
          },
        },
      },
    });
  } catch {
    return { success: false, error: "Error al crear el club." };
  }

  redirect("/");
}
