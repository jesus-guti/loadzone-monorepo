# RHF + DS pilots prototype (JES-70)

**Ticket:** [Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots)  
**Accepted:** AFK full pipeline (2026-08-05) — hitl “does it feel right?” recommendation applied without human wait  
**Prototype:** `apps/app/app/prototype/form-system/` → `/prototype/form-system`  
**Form fuel:** `packages/design-system/components/form.tsx` (Form / FormField / FormControl / FormMessage)  
**Grounded on:** JES-66 / JES-67 / JES-68 / JES-69 resolutions; real `CreateTeamForm`, `WellnessSettingsForm`, `useSettingsAutosave`

## Question

Does the proposed Form System contract feel right when applied to one classic-submit form and one settings-autosave form?

## Verdict

**AFK-accepted — contract feels right.** Both pilots authored cleanly against the decided wiring. No blocking contract breakage. Small amendments below are clarifications for JES-71 SPEC, not reversals.

---

## What we built

| Pilot | Shape | Contract exercised |
| --- | --- | --- |
| A — Create team | `useForm` + `zodResolver` + `handleSubmit` → stub `FormActionResult` | JES-66 Form*/Field*; JES-68 channels; no `useActionState` hybrid |
| B — Wellness slice | One `useForm`; DS `Select`; debounced + blur Inputs; stub autosave | JES-67 granularity/timing/last-saved/`resetField`; JES-69 Select vocabulary |

State is surfaced on-page (dirty / last-saved / save log + in-memory store panel).

---

## What broke / friction

1. **Empty Select value** — Base UI `SelectItem` rejects `value=""`. Pilot maps “Sin asignar” through a `__none__` sentinel. Not a contract failure; SPEC should note sentinel-or-omit for optional Selects.
2. **`FormControl` slotting** — Without Radix `Slot`, `cloneElement` on the focusable child works for `Input` and `SelectTrigger`. Authors must wrap the trigger, not `Select` Root (already sketched in JES-66). Worth a one-liner in SPEC.
3. **`mapFormActionResultToRhf` typing** — RHF `setError` path generics fight a shared mapper signature. Prototype used a narrow duck type + cast. SPEC should ship a typed helper (feature-local or next to Form*) once.
4. **App → RHF imports** — Pilots re-export `useForm` / `zodResolver` from `@repo/design-system/components/form` so `apps/app` need not declare RHF deps yet. Production migration may still add direct app deps; either is fine — document preferred import path in SPEC.
5. **Async `trigger` before save** — Autosave gate `await form.trigger(name)` before debounce/flush is correct but easy to forget on blur if `field.value` is stale in a closure. Pilot always passes the committed string into `commitIfChanged`; SPEC examples should do the same.

Nothing required reverting JES-66–69.

---

## What felt right

- Field layout + FormField Controller composition (no FormItem fork).
- Classic submit: client Zod blocks → action → `fieldErrors` / `formError` / `toastError` channels.
- Autosave: one form for the surface; per-field immediate vs debounce+blur; invalid blocks save; last-saved skips no-op blur; `resetField` clears only the saved field.
- DS `Select` for templates (not native / NativeSelect).

---

## Contract amendments (for JES-71)

| # | Amendment | Severity |
| --- | --- | --- |
| 1 | Document optional Select empty-value pattern (`__none__` sentinel or omit item + nullable field). | Clarification |
| 2 | Document `FormControl` wraps the focusable leaf (`SelectTrigger` / `Input`), never composite Root. | Clarification (already implied) |
| 3 | Ship / specify typed `mapFormActionResultToRhf` helper location in SPEC (pilot-proven shape). | Small addition |
| 4 | Prefer documenting import path: Form* + `useForm`/`zodResolver` from DS form module **or** direct `react-hook-form` once app declares deps. | Clarification |

**If none of the above counted as amendments:** the behavioral laws of JES-66–69 **stand unchanged**.

---

## Explicit non-goals confirmed

- No production migration of `CreateTeamForm` / `WellnessSettingsForm`.
- No permanent `useActionState` + RHF hybrid on Pilot A.
- Throwaway route only under `prototype/form-system`.
