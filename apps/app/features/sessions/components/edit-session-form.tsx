"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useActionState, useEffect, useId, useState } from "react";
import { updateSession } from "../actions/session-actions";
import { FieldLabel, FormSection } from "./form-section";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type EditableSession = {
  id: string;
  title: string;
  type: "TRAINING" | "MATCH" | "RECOVERY" | "OTHER";
  visibility: "TEAM_PRIVATE" | "CLUB_SHARED";
  location: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  preReminderMinutes: number | null;
  postReminderMinutes: number | null;
  isRecurring: boolean;
};

type EditSessionFormProps = {
  readonly locations: ReadonlyArray<string>;
  readonly session: EditableSession;
};

const SESSION_TYPES = [
  { value: "TRAINING", label: "Entrenamiento" },
  { value: "MATCH", label: "Partido" },
  { value: "RECOVERY", label: "Recuperación" },
  { value: "OTHER", label: "Otro" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "TEAM_PRIVATE", label: "Privada del equipo" },
  { value: "CLUB_SHARED", label: "Compartida del club" },
] as const;

export function EditSessionForm({ session, locations }: EditSessionFormProps) {
  const router = useRouter();
  const formId = useId();
  const [state, action, isPending] = useActionState(updateSession, {
    success: false,
  });
  const [type, setType] = useState<(typeof SESSION_TYPES)[number]["value"]>(
    session.type
  );
  const [visibility, setVisibility] = useState<
    (typeof VISIBILITY_OPTIONS)[number]["value"]
  >(session.visibility);
  const [scope, setScope] = useState<"instance" | "futureAndCurrent">("instance");

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (state.success && state.sessionId) {
      toast.success("Sesión actualizada correctamente");
      router.push(`/sessions/${state.sessionId}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-6" id={formId}>
      <input name="sessionId" type="hidden" value={session.id} />

      <FormSection
        description="Información principal de la sesión."
        title="Detalles"
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input
            autoFocus
            defaultValue={session.title}
            id="title"
            name="title"
            placeholder="Entrenamiento MD-1"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="type">Tipo</FieldLabel>
            <Select
              name="type"
              onValueChange={(value) =>
                setType(value as (typeof SESSION_TYPES)[number]["value"])
              }
              value={type}
            >
              <SelectTrigger className="w-full" id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="visibility">Visibilidad</FieldLabel>
            <Select
              name="visibility"
              onValueChange={(value) =>
                setVisibility(
                  value as (typeof VISIBILITY_OPTIONS)[number]["value"]
                )
              }
              value={visibility}
            >
              <SelectTrigger className="w-full" id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="location">Ubicación</FieldLabel>
          <Input
            defaultValue={session.location}
            id="location"
            list="locations-list"
            name="location"
            placeholder="Campo principal, Polideportivo..."
          />
          {locations.length > 0 ? (
            <datalist id="locations-list">
              {locations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          ) : null}
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea
            defaultValue={session.notes}
            id="notes"
            name="notes"
            placeholder="Indicaciones generales..."
            rows={3}
          />
        </div>
      </FormSection>

      <FormSection
        description="Cuándo empieza y termina la sesión."
        title="Programación"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="startsAt">Empieza</FieldLabel>
            <Input
              defaultValue={session.startsAt}
              id="startsAt"
              name="startsAt"
              required
              type="datetime-local"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="endsAt">Termina</FieldLabel>
            <Input
              defaultValue={session.endsAt}
              id="endsAt"
              name="endsAt"
              required
              type="datetime-local"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Avisos automáticos a los jugadores."
        title="Recordatorios"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="preReminderMinutes">Pre (min)</FieldLabel>
            <Input
              defaultValue={
                session.preReminderMinutes !== null
                  ? String(session.preReminderMinutes)
                  : ""
              }
              id="preReminderMinutes"
              max={1440}
              min={0}
              name="preReminderMinutes"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="postReminderMinutes">Post (min)</FieldLabel>
            <Input
              defaultValue={
                session.postReminderMinutes !== null
                  ? String(session.postReminderMinutes)
                  : ""
              }
              id="postReminderMinutes"
              max={1440}
              min={0}
              name="postReminderMinutes"
              type="number"
            />
          </div>
        </div>
      </FormSection>

      {session.isRecurring ? (
        <FormSection
          description="Esta sesión forma parte de una serie recurrente."
          title="Opciones de repetición"
        >
          <div className="space-y-4">
            <input name="scope" type="hidden" value={scope} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                  scope === "instance"
                    ? "border-brand/30 bg-brand/5"
                    : "border-border-secondary hover:bg-bg-secondary/50"
                }`}
                onClick={() => setScope("instance")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary text-sm">Solo esta sesión</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${scope === "instance" ? "border-brand" : "border-border-tertiary"}`}>
                    {scope === "instance" && <div className="h-2 w-2 rounded-full bg-brand" />}
                  </div>
                </div>
                <span className="text-xs text-text-secondary">
                  Los cambios solo afectarán a esta instancia.
                </span>
              </label>

              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                  scope === "futureAndCurrent"
                    ? "border-brand/30 bg-brand/5"
                    : "border-border-secondary hover:bg-bg-secondary/50"
                }`}
                onClick={() => setScope("futureAndCurrent")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary text-sm">Esta y siguientes</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${scope === "futureAndCurrent" ? "border-brand" : "border-border-tertiary"}`}>
                    {scope === "futureAndCurrent" && <div className="h-2 w-2 rounded-full bg-brand" />}
                  </div>
                </div>
                <span className="text-xs text-text-secondary">
                  Los cambios afectarán a esta sesión y a todas las futuras.
                </span>
              </label>
            </div>
          </div>
        </FormSection>
      ) : null}

      <div className="flex justify-end gap-2 pt-4">
        <Button asChild variant="outline">
          <Link href={`/sessions/${session.id}`}>Cancelar</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
