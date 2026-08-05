"use client";

import { Button } from "@repo/design-system/components/button";
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
  zodResolver,
} from "@repo/design-system/components/form";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { z } from "zod";
import { mapFormActionResultToRhf } from "./map-action-result";
import { stubCreateTeam, type CreateTeamValues } from "./stub-store";

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

/**
 * Pilot A — classic submit (CreateTeamForm shape).
 * RHF + zodResolver + handleSubmit → stub FormActionResult. No useActionState.
 */
export function CreateTeamPilot() {
  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      clubName: "",
      teamName: "",
      teamCategory: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await stubCreateTeam(values);
    if (result.success) {
      form.reset();
      toast.success("Club y equipo creados (stub).");
      return;
    }
    mapFormActionResultToRhf(
      form as unknown as {
        setError: (
          name: string,
          error: { type: string; message: string }
        ) => void;
      },
      result
    );
    if (result.toastError) {
      toast.error(result.toastError);
    }
  });

  const rootError = form.formState.errors.root?.message;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FormField
            control={form.control}
            name="clubName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Nombre del club</FieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    placeholder="Ej: Club Deportivo Villa Real"
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="teamName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Nombre del equipo</FieldLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej: Juvenil A" />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="teamCategory"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel>Categoría (opcional)</FieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ej: Juvenil, Cadete, Senior"
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />
        </FieldGroup>

        {rootError ? (
          <p className="text-sm text-destructive" role="alert">
            {rootError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creando..." : "Crear club y equipo"}
        </Button>

        <p className="text-xs text-text-tertiary">
          Stub: club &quot;fail&quot; → fieldErrors; equipo &quot;root&quot; →
          formError; club &quot;toast&quot; → toastError.
        </p>
      </form>
    </Form>
  );
}
