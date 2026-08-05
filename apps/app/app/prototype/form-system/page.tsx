import type { Metadata } from "next";
import Link from "next/link";
import { CreateTeamPilot } from "./_components/create-team-pilot";
import { PrototypeStorePanel } from "./_components/prototype-store-panel";
import { WellnessAutosavePilot } from "./_components/wellness-autosave-pilot";

export const metadata: Metadata = {
  title: "Prototype — Form System pilots (JES-70)",
};

/**
 * Throwaway Form System pilots (JES-70).
 * Question: Does the proposed Form System contract feel right on classic-submit + autosave?
 * Sub-shape B under existing apps/app/app/prototype/.
 */
export default function FormSystemPrototypePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="space-y-2 border-b border-border-secondary pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Prototype · JES-70 · throwaway
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          Form System — pilots RHF + DS
        </h1>
        <p className="text-sm text-text-secondary">
          Contrato: Form*/Field* + FormActionResult + autosave per-field. No es
          migración de producción.
        </p>
        <Link
          href="/prototype/settings"
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          ← Prototype settings
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(240px,320px)]">
        <div className="space-y-10">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-text-primary">
                A — Submit clásico
              </h2>
              <p className="text-sm text-text-secondary">
                CreateTeamForm: useForm + zodResolver + handleSubmit → stub
                FormActionResult.
              </p>
            </div>
            <div className="max-w-md rounded-md border border-border-secondary bg-bg-primary p-4">
              <CreateTeamPilot />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-text-primary">
                B — Autosave wellness
              </h2>
              <p className="text-sm text-text-secondary">
                Un useForm; Select DS; Inputs con debounce + blur; gate
                last-saved; resetField por campo.
              </p>
            </div>
            <div className="max-w-md rounded-md border border-border-secondary bg-bg-primary p-4">
              <WellnessAutosavePilot />
            </div>
          </section>
        </div>

        <PrototypeStorePanel />
      </div>
    </div>
  );
}
