"use client";

import type { FormActionResult, SettingsFieldResult } from "./types";

export type CreateTeamValues = {
  clubName: string;
  teamName: string;
  teamCategory?: string;
};

export type WellnessPilotValues = {
  preForm: string;
  postForm: string;
  soreness: string;
  recovery: string;
  preMinutes: string;
};

/** In-memory prototype store — wiped on reload. */
export type PrototypeStoreSnapshot = {
  createTeamSubmits: Array<{
    at: string;
    values: CreateTeamValues;
    result: FormActionResult;
  }>;
  wellnessSaves: Array<{
    at: string;
    field: string;
    value: string;
    result: SettingsFieldResult;
  }>;
  wellnessLastSaved: Record<string, string>;
};

const store: PrototypeStoreSnapshot = {
  createTeamSubmits: [],
  wellnessSaves: [],
  wellnessLastSaved: {
    preForm: "tpl-pre-1",
    postForm: "tpl-post-1",
    soreness: "3",
    recovery: "",
    preMinutes: "60",
  },
};

const listeners = new Set<() => void>();

export function getPrototypeStore(): PrototypeStoreSnapshot {
  return store;
}

export function subscribePrototypeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Stub classic-submit action. Forces field error when clubName === "fail". */
export async function stubCreateTeam(
  values: CreateTeamValues
): Promise<FormActionResult> {
  await delay(400);

  if (values.clubName.trim().toLowerCase() === "fail") {
    const result: FormActionResult = {
      success: false,
      fieldErrors: {
        clubName: "El servidor rechazó este nombre de club.",
      },
    };
    store.createTeamSubmits.unshift({
      at: nowIso(),
      values,
      result,
    });
    emit();
    return result;
  }

  if (values.clubName.trim().toLowerCase() === "toast") {
    const result: FormActionResult = {
      success: false,
      toastError: "No autorizado (stub toastError).",
    };
    store.createTeamSubmits.unshift({
      at: nowIso(),
      values,
      result,
    });
    emit();
    return result;
  }

  if (values.teamName.trim().toLowerCase() === "root") {
    const result: FormActionResult = {
      success: false,
      formError: "No se pudo crear el equipo (error de formulario).",
    };
    store.createTeamSubmits.unshift({
      at: nowIso(),
      values,
      result,
    });
    emit();
    return result;
  }

  const result: FormActionResult = { success: true };
  store.createTeamSubmits.unshift({ at: nowIso(), values, result });
  emit();
  return result;
}

/**
 * Stub settings field save. Fails when value === "99".
 * Mirrors SettingsFieldResult / toastError legacy alias.
 */
export async function stubSaveWellnessField(
  field: string,
  value: string
): Promise<SettingsFieldResult> {
  await delay(250);

  if (value.trim() === "99") {
    const result: SettingsFieldResult = {
      success: false,
      error: "Valor rechazado por el servidor (stub).",
    };
    store.wellnessSaves.unshift({
      at: nowIso(),
      field,
      value,
      result,
    });
    emit();
    return result;
  }

  store.wellnessLastSaved[field] = value;
  const result: SettingsFieldResult = { success: true };
  store.wellnessSaves.unshift({ at: nowIso(), field, value, result });
  emit();
  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
