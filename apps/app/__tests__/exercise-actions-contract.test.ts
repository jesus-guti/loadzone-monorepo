import { describe, expect, it, vi, beforeEach } from "vitest";
import type { StaffContext } from "@/lib/auth-context";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  exerciseFindFirst: vi.fn(),
  exerciseCreate: vi.fn(),
  exerciseUpdate: vi.fn(),
  favoriteFindUnique: vi.fn(),
  favoriteCreate: vi.fn(),
  favoriteDelete: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
}));

vi.mock("@repo/database", () => ({
  database: {
    exercise: {
      findFirst: stubs.exerciseFindFirst,
      create: stubs.exerciseCreate,
      update: stubs.exerciseUpdate,
      updateMany: vi.fn(),
    },
    membershipExerciseFavorite: {
      findUnique: stubs.favoriteFindUnique,
      create: stubs.favoriteCreate,
      delete: stubs.favoriteDelete,
    },
  },
}));

import {
  createExercise,
  duplicateExercise,
  toggleExerciseFavorite,
  updateExercise,
} from "@/features/exercises/actions/exercise-actions";
import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
} from "@/features/exercises/exercise-attribute-vocabulary";

/** Primer argumento de useActionState; la acción lo ignora en estos tests */
const noopPrevState = {
  success: false,
} as const satisfies { success: boolean; error?: string; exerciseId?: string };

function staffContextFixture(): StaffContext {
  return {
    membershipId: "mem-contract",
    club: { id: "club-contract", name: "Club QA", logoUrl: null },
  } as StaffContext;
}

function appendMinimalExerciseFields(fd: FormData) {
  fd.append("objectivesText", "Objetivos válidos suficientemente largos");
  fd.append("explanationText", "");
  fd.append("durationMinutes", "30");
  fd.append("spaceWidthMeters", "20");
  fd.append("spaceLengthMeters", "35");
  fd.append("playersCount", "12");
  fd.append("complexity", COMPLEXITY_OPTIONS[0].value);
  fd.append("strategy", STRATEGY_OPTIONS[0].value);
  fd.append(
    "coordinativeSkill",
    COORDINATIVE_SKILL_OPTIONS[0].value
  );
  fd.append(
    "tacticalIntention",
    TACTICAL_INTENTION_OPTIONS[0].value
  );
  fd.append("dynamicType", DYNAMIC_TYPE_OPTIONS[0].value);
  fd.append("gameSituation", GAME_SITUATION_OPTIONS[0].value);
  fd.append(
    "coordinationType",
    COORDINATION_TYPE_OPTIONS[0].value
  );
}

function minimalCreateForm(name = "Ejercicio contrato"): FormData {
  const fd = new FormData();
  fd.append("name", name);
  appendMinimalExerciseFields(fd);
  fd.append("visibility", "CLUB_SHARED");
  return fd;
}

function minimalUpdateForm(
  overrides: Partial<{ exerciseId: string; name: string }> = {}
): FormData {
  const fd = minimalCreateForm(overrides.name ?? "Ejercicio actualizado");
  fd.append("id", overrides.exerciseId ?? "exo-target");
  return fd;
}

const duplicateSourceExercise = () => ({
  id: "exo-src",
  name: "Origen táctico",
  objectivesText: "Obj.",
  explanationText: "",
  durationMinutes: 20,
  spaceWidthMeters: 22,
  spaceLengthMeters: 32,
  minPlayers: 10,
  maxPlayers: 10,
  complexity: COMPLEXITY_OPTIONS[0].value,
  strategy: STRATEGY_OPTIONS[0].value,
  coordinativeSkill: COORDINATIVE_SKILL_OPTIONS[0].value,
  tacticalIntention: TACTICAL_INTENTION_OPTIONS[0].value,
  dynamicType: DYNAMIC_TYPE_OPTIONS[0].value,
  gameSituation: GAME_SITUATION_OPTIONS[0].value,
  coordinationType: COORDINATION_TYPE_OPTIONS[0].value,
  visibility: "CLUB_SHARED" as const,
  diagramData: null,
  diagramVersion: 1,
  diagramThumbnailUrl: null as string | null,
  isSystem: false,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createExercise (contrato acción)", () => {
  it("devuelve error estable sin club en contexto", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    const result = await createExercise(
      noopPrevState,
      minimalCreateForm()
    );
    expect(result).toEqual({ success: false, error: "Club no encontrado" });
    expect(stubs.exerciseCreate).not.toHaveBeenCalled();
  });

  it("devuelve error de validación del primer issue de Zod", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    const fd = minimalCreateForm("x");
    const result = await createExercise(noopPrevState, fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "El nombre debe tener al menos 2 caracteres."
    );
    expect(stubs.exerciseCreate).not.toHaveBeenCalled();
  });

  it("crea en club activo, revalida y devuelve exerciseId", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue(null);
    stubs.exerciseCreate.mockResolvedValue({ id: "exo-created" });

    const result = await createExercise(
      noopPrevState,
      minimalCreateForm("Pase interior")
    );

    expect(result).toEqual({
      success: true,
      exerciseId: "exo-created",
    });
    expect(stubs.exerciseCreate).toHaveBeenCalledTimes(1);
    const createArg = stubs.exerciseCreate.mock.calls[0]?.[0] as {
      data: { clubId: string; createdByMembershipId: string };
    };
    expect(createArg?.data?.clubId).toBe("club-contract");
    expect(createArg?.data?.createdByMembershipId).toBe("mem-contract");
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises");
  });
});

describe("updateExercise (contrato acción)", () => {
  it("devuelve error estable sin club", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    const result = await updateExercise(noopPrevState, minimalUpdateForm());
    expect(result).toEqual({ success: false, error: "Club no encontrado" });
    expect(stubs.exerciseUpdate).not.toHaveBeenCalled();
  });

  it("ejercicio fuera de club o id inválido: no encontrado", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue(null);
    const result = await updateExercise(
      noopPrevState,
      minimalUpdateForm({ exerciseId: "exo-otro-club", name: "Nombre ok" })
    );
    expect(result).toEqual({
      success: false,
      error: "Ejercicio no encontrado.",
    });
    expect(stubs.exerciseUpdate).not.toHaveBeenCalled();
  });

  it("fallo de validación cuando falta id", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    const fd = minimalCreateForm("Nombre suficientemente largo");
    const result = await updateExercise(noopPrevState, fd);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(stubs.exerciseFindFirst).not.toHaveBeenCalled();
  });

  it("persiste cambios cuando el ejercicio pertenece al club", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue({
      id: "exo-target",
      slug: "ejercicio-actualizado",
      name: "Ejercicio actualizado",
    });
    stubs.exerciseUpdate.mockResolvedValue({});

    const result = await updateExercise(noopPrevState, minimalUpdateForm());

    expect(result).toEqual({
      success: true,
      exerciseId: "exo-target",
    });
    expect(stubs.exerciseUpdate).toHaveBeenCalledTimes(1);
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises");
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises/exo-target");
  });
});

describe("toggleExerciseFavorite (contrato acción)", () => {
  it("sin club devuelve error estable", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    await expect(
      toggleExerciseFavorite("exo-fav")
    ).resolves.toEqual({
      ok: false,
      error: "Club no encontrado",
    });
  });

  it("ejercicio no visible en biblioteca: no encontrado", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue(null);
    await expect(
      toggleExerciseFavorite("exo-ausente")
    ).resolves.toEqual({
      ok: false,
      error: "Ejercicio no encontrado.",
    });
    expect(stubs.favoriteFindUnique).not.toHaveBeenCalled();
  });

  it("añade favorito cuando no existía y devuelve isFavorite true", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue({ id: "exo-fav" });
    stubs.favoriteFindUnique.mockResolvedValue(null);
    stubs.favoriteCreate.mockResolvedValue({});

    await expect(
      toggleExerciseFavorite("exo-fav")
    ).resolves.toEqual({ ok: true, isFavorite: true });

    expect(stubs.favoriteCreate).toHaveBeenCalledWith({
      data: {
        membershipId: "mem-contract",
        exerciseId: "exo-fav",
      },
    });
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises");
  });

  it("elimina favorito cuando existía y devuelve isFavorite false", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue({ id: "exo-fav" });
    stubs.favoriteFindUnique.mockResolvedValue({
      membershipId: "mem-contract",
    });
    stubs.favoriteDelete.mockResolvedValue({});

    await expect(
      toggleExerciseFavorite("exo-fav")
    ).resolves.toEqual({ ok: true, isFavorite: false });

    expect(stubs.favoriteDelete).toHaveBeenCalledWith({
      where: {
        membershipId_exerciseId: {
          membershipId: "mem-contract",
          exerciseId: "exo-fav",
        },
      },
    });
    expect(stubs.favoriteCreate).not.toHaveBeenCalled();
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises");
  });
});

describe("duplicateExercise (contrato acción)", () => {
  it("sin club", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(null);
    await expect(duplicateExercise("exo-x")).resolves.toEqual({
      ok: false,
      error: "Club no encontrado",
    });
  });

  it("fuera de biblioteca / no encontrado", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    stubs.exerciseFindFirst.mockResolvedValue(null);
    await expect(duplicateExercise("exo-x")).resolves.toEqual({
      ok: false,
      error: "Ejercicio no encontrado.",
    });
    expect(stubs.exerciseCreate).not.toHaveBeenCalled();
  });

  it("duplica con nombre (copia) y devuelve nuevo id", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue(staffContextFixture());
    const source = duplicateSourceExercise();
    stubs.exerciseFindFirst
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(null);
    stubs.exerciseCreate.mockResolvedValue({ id: "exo-dup" });

    const result = await duplicateExercise("exo-src");

    expect(result).toEqual({ ok: true, exerciseId: "exo-dup" });
    expect(stubs.exerciseCreate).toHaveBeenCalledTimes(1);
    const createArg = stubs.exerciseCreate.mock.calls[0]?.[0] as {
      data: { name: string; clubId: string };
    };
    expect(createArg?.data?.name).toBe("Origen táctico (copia)");
    expect(createArg?.data?.clubId).toBe("club-contract");
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/exercises");
  });
});
