"use client";

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@repo/design-system/components/field";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  useForm,
  useWatch,
  zodResolver,
} from "@repo/design-system/components/form";
import { Input } from "@repo/design-system/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/select";
import { toast } from "@repo/design-system/components/sonner";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import {
  getPrototypeStore,
  stubSaveWellnessField,
  type WellnessPilotValues,
} from "./stub-store";
import { usePrototypeAutosave } from "./use-prototype-autosave";

const NONE_VALUE = "__none__";

const PRE_TEMPLATES = [
  { id: "tpl-pre-1", name: "Wellness pre (sistema)" },
  { id: "tpl-pre-2", name: "Wellness pre (club)" },
] as const;

const POST_TEMPLATES = [
  { id: "tpl-post-1", name: "RPE post (sistema)" },
  { id: "tpl-post-2", name: "RPE post (club)" },
] as const;

function toSelectValue(value: string): string {
  return value === "" ? NONE_VALUE : value;
}

function fromSelectValue(value: string | null): string {
  if (!value || value === NONE_VALUE) {
    return "";
  }
  return value;
}

const emptyOrIntInRange = (min: number, max: number, label: string) =>
  z.string().superRefine((value, ctx) => {
    const trimmed = value.trim();
    if (trimmed === "") {
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: `${label}: introduce un número entero.`,
      });
      return;
    }
    if (parsed < min || parsed > max) {
      ctx.addIssue({
        code: "custom",
        message: `${label}: debe estar entre ${min} y ${max}.`,
      });
    }
  });

const wellnessPilotSchema = z.object({
  preForm: z.string(),
  postForm: z.string(),
  soreness: emptyOrIntInRange(1, 5, "Agujetas"),
  recovery: emptyOrIntInRange(0, 10, "Recuperación"),
  preMinutes: z.string().superRefine((value, ctx) => {
    const trimmed = value.trim();
    if (trimmed === "") {
      ctx.addIssue({
        code: "custom",
        message: "Minutos: obligatorio.",
      });
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Minutos: introduce un número entero.",
      });
      return;
    }
    if (parsed < 0 || parsed > 1440) {
      ctx.addIssue({
        code: "custom",
        message: "Minutos: debe estar entre 0 y 1440.",
      });
    }
  }),
});

type FieldName = keyof WellnessPilotValues;

/**
 * Pilot B — wellness-shaped autosave.
 * One useForm; DS Select; debounced Inputs; last-saved gate; resetField on success.
 */
export function WellnessAutosavePilot() {
  const initial = getPrototypeStore().wellnessLastSaved;
  const lastSavedRef = useRef<Record<string, string>>({ ...initial });
  const [lastSavedView, setLastSavedView] = useState({ ...initial });
  const [saveLog, setSaveLog] = useState<
    Array<{ field: string; ok: boolean; at: string }>
  >([]);

  const form = useForm<WellnessPilotValues>({
    resolver: zodResolver(wellnessPilotSchema),
    defaultValues: {
      preForm: initial.preForm ?? "tpl-pre-1",
      postForm: initial.postForm ?? "tpl-post-1",
      soreness: initial.soreness ?? "3",
      recovery: initial.recovery ?? "",
      preMinutes: initial.preMinutes ?? "60",
    },
    mode: "onChange",
  });

  const watched = useWatch({ control: form.control });
  const dirtyFields = form.formState.dirtyFields;

  const onResult = useCallback(
    (fieldKey: string, result: { success: boolean; error?: string }) => {
      setSaveLog((prev) =>
        [
          {
            field: fieldKey,
            ok: result.success,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 12)
      );

      if (!result.success) {
        toast.error(result.error ?? "No se pudo guardar el cambio.");
        const name = fieldKey as FieldName;
        if (name === "preForm" || name === "postForm") {
          form.resetField(name, {
            defaultValue: lastSavedRef.current[name] ?? "",
          });
        } else {
          form.setError(name, {
            type: "server",
            message: result.error ?? "No se pudo guardar.",
          });
        }
        return;
      }

      const name = fieldKey as FieldName;
      const saved = lastSavedRef.current[name];
      form.resetField(name, { defaultValue: saved });
      setLastSavedView({ ...lastSavedRef.current });
    },
    [form]
  );

  const { saveImmediate, saveDebounced, flushDebounced } =
    usePrototypeAutosave({
      scopeKey: "prototype-wellness",
      onResult,
    });

  const isValidField = useCallback(
    async (name: FieldName): Promise<boolean> => {
      return form.trigger(name);
    },
    [form]
  );

  const commitIfChanged = useCallback(
    async (
      name: FieldName,
      value: string,
      timing: "immediate" | "debounced" | "flush"
    ): Promise<void> => {
      const valid = await isValidField(name);
      if (!valid) {
        return;
      }
      if (value === lastSavedRef.current[name]) {
        return;
      }

      const save = async () => {
        const result = await stubSaveWellnessField(name, value);
        if (result.success) {
          lastSavedRef.current[name] = value;
        }
        return result;
      };

      if (timing === "immediate") {
        saveImmediate(name, save);
        return;
      }
      if (timing === "debounced") {
        saveDebounced(name, save);
        return;
      }
      flushDebounced(name, save);
    },
    [flushDebounced, isValidField, saveDebounced, saveImmediate]
  );

  return (
    <Form {...form}>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <FieldGroup className="gap-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-text-primary">
              Formularios
            </h3>

            <FormField
              control={form.control}
              name="preForm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>Formulario pre-sesión</FieldLabel>
                  <Select
                    items={[
                      { value: NONE_VALUE, label: "Sin asignar" },
                      ...PRE_TEMPLATES.map((template) => ({
                        value: template.id,
                        label: template.name,
                      })),
                    ]}
                    value={toSelectValue(field.value)}
                    onValueChange={(next) => {
                      const value = fromSelectValue(next);
                      field.onChange(value);
                      void commitIfChanged("preForm", value, "immediate");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Sin asignar</SelectItem>
                      {PRE_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </Field>
              )}
            />

            <FormField
              control={form.control}
              name="postForm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>Formulario post-sesión</FieldLabel>
                  <Select
                    items={[
                      { value: NONE_VALUE, label: "Sin asignar" },
                      ...POST_TEMPLATES.map((template) => ({
                        value: template.id,
                        label: template.name,
                      })),
                    ]}
                    value={toSelectValue(field.value)}
                    onValueChange={(next) => {
                      const value = fromSelectValue(next);
                      field.onChange(value);
                      void commitIfChanged("postForm", value, "immediate");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Sin asignar</SelectItem>
                      {POST_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </Field>
              )}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-text-primary">
              Umbrales / recordatorio
            </h3>

            <FormField
              control={form.control}
              name="soreness"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>Agujetas (1–5, vacío = off)</FieldLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      placeholder="Ej: 3"
                      onChange={(event) => {
                        const next = event.target.value;
                        field.onChange(next);
                        void commitIfChanged("soreness", next, "debounced");
                      }}
                      onBlur={() => {
                        field.onBlur();
                        void commitIfChanged(
                          "soreness",
                          field.value,
                          "flush"
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </Field>
              )}
            />

            <FormField
              control={form.control}
              name="recovery"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>Recuperación (0–10, vacío = off)</FieldLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      placeholder="Ej: 4"
                      onChange={(event) => {
                        const next = event.target.value;
                        field.onChange(next);
                        void commitIfChanged("recovery", next, "debounced");
                      }}
                      onBlur={() => {
                        field.onBlur();
                        void commitIfChanged(
                          "recovery",
                          field.value,
                          "flush"
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </Field>
              )}
            />

            <FormField
              control={form.control}
              name="preMinutes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>Recordatorio pre-sesión (min)</FieldLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={1440}
                      onChange={(event) => {
                        const next = event.target.value;
                        field.onChange(next);
                        void commitIfChanged("preMinutes", next, "debounced");
                      }}
                      onBlur={() => {
                        field.onBlur();
                        void commitIfChanged(
                          "preMinutes",
                          field.value,
                          "flush"
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </Field>
              )}
            />
          </section>
        </FieldGroup>

        <div className="mt-6 space-y-2 rounded-md border border-border-secondary bg-bg-secondary p-3 font-mono text-xs text-text-secondary">
          <p className="font-sans text-sm font-medium text-text-primary">
            Estado (prototype skill)
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(
              {
                values: watched,
                dirtyFields,
                lastSaved: lastSavedView,
                recentSaves: saveLog,
              },
              null,
              2
            )}
          </pre>
          <p className="font-sans text-xs text-text-tertiary">
            Stub: valor &quot;99&quot; falla (toast + discrete revert / text
            keep). Vacío en umbrales es válido.
          </p>
        </div>
      </form>
    </Form>
  );
}
