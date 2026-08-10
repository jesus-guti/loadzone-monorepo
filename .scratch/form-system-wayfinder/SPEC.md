# LoadZone Form System — Specification

Status: accepted (AFK map exit, JES-71)  
Date: 2026-08-05  
Parent: [MAP.md](MAP.md) · Linear [JES-63](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
Planning: [`.scratch/jes-71-form-system-spec/map.md`](../jes-71-form-system-spec/map.md)  
Handoff: [BACKLOG.md](BACKLOG.md) (suggestions for `/to-issues` — not law)

This document is the **implementation-ready** Form System doctrine for product forms in `apps/app` and `apps/player`. It synthesizes locked wayfinder resolutions; it does **not** invent new product forks and does **not** execute migration.

**Language:** English (this doc). Product UI copy remains **Spanish**.

**Governance:** [ADR 0001](../../docs/adr/0001-design-system-package-boundary.md) · `.cursor/rules/loadzone-design-system.mdc`  
**No dedicated Form ADR** (JES-66): ADR 0001 + rules + this SPEC suffice.

---

## 1. Purpose & standing locks

### Destination

A single authoring contract so product forms:

1. Use **React Hook Form (RHF)** as the standard state/validation layer.
2. Author **design-system field primitives** (no ad-hoc native field chrome).
3. Share one **Zod schema module** between client resolver and Server Action.
4. Map action failures through a canonical **`FormActionResult`** into RHF / toast channels.
5. Keep settings **per-field autosave** (JES-58 absolute) wired through one `useForm` per route form.

Destination of this wayfinder is **SPEC + backlog sketches**, not shipped migrations.

### Standing locks (do not reopen)

| Lock | Meaning |
|---|---|
| **RHF standard** | Do not introduce new `useState`-driven product form trees. Migrate existing ones in post-SPEC waves. |
| **DS controls only** | New/touched product fields use DS primitives; raw natives only per §5 exceptions. |
| **Zod + resolvers** | `@hookform/resolvers` + feature (or domain-package) Zod; never DS-hosted feature schemas. |
| **Server Actions stay the mutation boundary** | RHF does not replace actions; it owns client state and error display. |
| **Both apps in scope** | Same RHF + DS contract. Player Age Band / focus-step chrome stays **app-local** under RHF — not a second form system. |
| **Form* in `@repo/design-system`** | Shared wiring home decided; intentional land PR names both apps as consumers. |
| **JES-58 absolute** | Settings: no Guardar; per-field autosave; silent success; toast on failure. |

### Soft / clarification notes (non-blocking)

JES-70 pilots confirmed the contract on classic submit + wellness autosave. Clarifications below are **law refinements**, not reversals of JES-66–69.

---

## 2. Form primitives (home & API)

Source: [form-primitive-home-and-rhf-wiring.md](resolutions/form-primitive-home-and-rhf-wiring.md) · pilot: [rhf-ds-pilots-prototype.md](resolutions/rhf-ds-pilots-prototype.md)

### Home

- Module: `packages/design-system/components/form.tsx`
- Import path: `@repo/design-system/components/form`
- Minimum public exports: `Form` (= `FormProvider`), `FormField`, `FormControl`, `FormMessage`, plus field-context hooks as needed (`useFormField`).
- Package already depends on `react-hook-form`, `@hookform/resolvers`, `zod`.

### Preferred import path (apps)

| Prefer | Also acceptable |
|---|---|
| Form* **and** `useForm` / `zodResolver` re-exported from `@repo/design-system/components/form` (pilot pattern; apps need not declare RHF deps yet) | Direct `react-hook-form` / `@hookform/resolvers` once an app declares those deps |

Do not invent an app-local Form kit or a second form library.

### Control wiring

- **Preferred for every control:** `FormField` → RHF `Controller` with render prop (`field` / `fieldState`).
- **Required** for Base UI / composite controls: `Select`, `Combobox`, `Checkbox`, `Switch`, `RadioGroup`, `Toggle` / `ToggleGroup`, `Slider`, `Calendar`, `InputOTP`, and future non-native composites.
- **Escape hatch:** `register(...)` only on plain `Input` and `Textarea` — not house style; teach Controller first.

### Compose with `Field*`, do not fork shadcn FormItem

- Layout vocabulary remains `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, … from `field.tsx`.
- Compose `Field*` **inside** `FormField` render. Do **not** ship parallel `FormItem` / `FormLabel` / `FormDescription`.
- `FormMessage` is the RHF-aware error reader; presentation reuses `FieldError` tokens/slots.
- `FormControl` owns a11y wiring (`id`, `aria-describedby`, `aria-invalid`) for the **focusable leaf** — wrap `Input`, `SelectTrigger`, etc., **never** composite Root (`Select`, `Combobox`).

### Optional Select empty value

Base UI `SelectItem` rejects `value=""`. For optional Selects, either:

1. Map “empty / Sin asignar” through a non-empty sentinel (e.g. `__none__`) and translate at the schema/action boundary, or  
2. Omit the empty item and keep the field nullable with a clear placeholder via `SelectValue`.

Document the chosen sentinel in the feature schema; do not rely on `value=""`.

---

## 3. Control vocabulary & native exceptions

Source: [control-vocabulary-and-native-exceptions.md](resolutions/control-vocabulary-and-native-exceptions.md)  
Inventory: [ds-fields-and-rhf-form-gap.md](research/ds-fields-and-rhf-form-gap.md), [form-surfaces-and-interaction-modes.md](research/form-surfaces-and-interaction-modes.md)

Adopting RHF on a surface **includes** migrating that surface’s controls to this vocabulary in the same change — do not wrap leftover raw natives in `Controller` and call it done.

### Option lists

| Need | Use | Do not use |
|---|---|---|
| Closed, finite options | DS `Select*` | Raw `<select>`, `DropdownMenu` as value picker |
| Long lists / typeahead / filter | DS `Combobox*` | `Select` stretched into search; menu-as-picker |
| Commands / actions (not a field value) | `DropdownMenu` / Button + menu | Menu items that set RHF values |

Migrate raw natives to DS `Select` — not a parallel native wrapper.

### Core control map

| Intent | Primitive |
|---|---|
| Single-line / typed browser input | `Input` (`type` as needed) |
| Multiline | `Textarea` |
| Closed options | `Select*` |
| Searchable / long options | `Combobox*` |
| Boolean | `Checkbox` or `Switch` |
| One-of few visible | `RadioGroup` or `ToggleGroup` |
| Continuous numeric (shared) | `Slider` |
| Date UI | `Calendar` where product already uses it; else DS `Input type="date"` / `datetime-local` |
| OTP | `InputOTP*` |
| Field layout / errors | `Field*` + Form* |

### Ban (product form trees)

Banned outside the allow-list: raw `<input>`, `<select>`, `<textarea>` in `apps/app` / `apps/player` feature forms and settings sections.

**Out of ban scope:** `prototype/**`, tactics-board canvas chrome, vendor Clerk auth, analysis chat compose (unless later pulled in), marketing `apps/web`.

Existing native hotspots (JES-64) are **migration debt**, not precedent.

### Explicit exceptions (allow-list)

| Exception | Rule |
|---|---|
| `input type="hidden"` | Allowed for ids, scopes, serialized payloads, temporary FormData bridges |
| `input type="file"` | Allowed (usually visually hidden) triggered by DS Button; upload UX unchanged |
| Typed text-ish | DS `Input` with appropriate `type` — not raw `<input>` |
| OTP | DS `InputOTP` |
| Player app-local check-in | `ScaleInput` / `SliderInput` / `ChipInput` may keep native internals **inside** those compositions; outer trees still DS/Form* |
| Checkboxes / radios / switches | **Not** exceptions — use DS primitives |

**Enforcement fog:** ESLint / CI guards against raw field elements remain deferred (§8). Reviewer + pilot law until then.

---

## 4. Validation & Server Action error mapping

Source: [validation-ownership-and-action-error-mapping.md](resolutions/validation-ownership-and-action-error-mapping.md)

### Schema ownership

- **Default:** feature-local `*.schema.ts` next to the feature; imported by both client (`zodResolver`) and Server Action.
- **Do not** put feature schemas in `@repo/design-system`.
- **Shared packages:** import / refine / pick existing domain Zod (`@repo/database` age-band, wellness-limits, reminder-consent, …). Promote a schema module only when ≥2 of `{apps/app, apps/player, apps/web}` (or a shared non-UI consumer) share an identical contract — ADR 0001 spirit.
- No `@repo/forms` package.

### Client vs server

| Layer | Responsibility |
|---|---|
| Client | `zodResolver(schema)` — UX gate |
| Server Action | **Always** `schema.safeParse(...)` before mutate — trust boundary |

One schema module; two call sites. Client never replaces server validation.

### Canonical result shape

```ts
export type FormActionResult = {
  success: boolean;
  /** Field path → single Spanish message → RHF setError(name, { message }). */
  fieldErrors?: Record<string, string>;
  /** Non-field form error → RHF root / inline banner. */
  formError?: string;
  /** Ephemeral failure → Spanish toast only; do not sticky on fields. */
  toastError?: string;
};
```

| Failure kind | Channel |
|---|---|
| Zod issues with field path | `fieldErrors` |
| Form-level refine / no usable path | `formError` |
| Authz, not-found, unexpected `catch` | `toastError` (preferred); classic submit may use `formError` for inline banner — **one** channel |
| Settings autosave field failure (JES-58) | `toastError` |

On success, omit error channels. Do not duplicate the same failure on two channels.

**Legacy alias** during migration: `{ success, error?: string }` — classic submit treats `error` as `formError`; settings field actions treat `error` as `toastError`. New/touched actions should emit explicit channels.

### Mapper helper

Ship a typed **`mapFormActionResultToRhf`** (next to Form* or a thin shared util imported by apps):

1. `fieldErrors` → `setError` each path.  
2. `formError` → `setError("root", { message })` (or agreed root key).  
3. `toastError` → `toast.error(...)` (Spanish); leave fields alone unless autosave revert law applies.

Pilot proved a narrow duck-typed mapper; production must type it once against RHF `UseFormSetError` / `FieldValues` without unsafe casts at call sites.

### `useActionState` posture

**Replace on migrate — no permanent hybrid.** Migrated classic submit: `useForm` + `handleSubmit` → `await action(values)` → map `FormActionResult`. Pending via `formState.isSubmitting` / `useTransition` as needed. Unmigrated surfaces may keep `useActionState` + FormData until their wave.

---

## 5. Settings autosave + RHF (extends JES-58)

Source: [autosave-rhf-contract.md](resolutions/autosave-rhf-contract.md) · absolute: [jes-58-autosave-contract/resolution.md](../jes-58-autosave-contract/resolution.md)

### Granularity

- **One `useForm` per settings route form component** (e.g. `WellnessSettingsForm`), spanning all `SettingsSection`s on that route.
- `defaultValues` from server props; remount on `teamId` / route identity (`key={teamId}`).
- File uploads on hybrid routes stay **outside** the RHF autosave field tree (or dedicated non-autosave control).

### Save wiring (preserve JES-58 moments)

| Control kind | RHF moment | Hook |
|---|---|---|
| Toggle / select / checkbox / segmented | Value commit `onChange` | `saveImmediate` |
| Text / number | Debounced `onChange` **and** blur flush | `saveDebounced` / `flushDebounced` |

**Rules:**

1. Per-field handlers only — no form-wide `watch()` / dirty-timer save loops.  
2. Last-saved gate before debounce fire or blur flush; skip if value equals snapshot.  
3. Debounce key = RHF field name.  
4. Keep `useSettingsAutosave` as concurrency law (generation / stale completions).  
5. No Enter-to-save / no Guardar.  
6. **Block client save while the committing field is invalid** (inline `FormMessage`; no toast for client Zod). Pass the committed string into save helpers (avoid stale closure on blur).  
7. Success: update last-saved snapshot; `resetField(name, { defaultValue: saved })` only — never full-form `reset(serverProps)` while the user stays on the page.  
8. Failure: discrete controls revert to last-saved; text/number keep typed value + field error + dirty. Toast per JES-58.

### Chrome coexistence

`SettingsSection` / `SettingsRow` / hash deep links stay **outside** the RHF authoring API. Do not duplicate visible Spanish labels with a second `FormLabel`. Hash scroll must not remount or reset the form.

---

## 6. Interaction modes in scope

Source: [form-surfaces-and-interaction-modes.md](research/form-surfaces-and-interaction-modes.md)

| Mode | Form System rule |
|---|---|
| Classic submit | RHF + Zod + `FormActionResult`; replace `useActionState` on migrate |
| Settings autosave | §5 |
| Multi-step focus check-in | One RHF form (or agreed step boundary) under app-local focus chrome; final submit maps like classic |
| File upload | Exception allow-list; typically outside autosave RHF tree |
| Other (attendance batch, chat, GET search, vendor auth) | Migrate only when treated as product forms; chat/auth/search stay out unless explicitly pulled |

Hard-case references for implementers: `CreateTeamForm` / dialog (classic); `WellnessSettingsForm` + Equipo (autosave). Evidence pilots: `/prototype/form-system` (throwaway).

---

## 7. In scope / out of scope

### In scope (this SPEC + later `/to-issues` migration)

- Product forms in `apps/app` and `apps/player`.
- Promoting / stabilizing Form* in `@repo/design-system` for both apps.
- Aligning touched Server Actions to `FormActionResult` channels.
- Replacing native field hotspots when those surfaces migrate.
- Extending settings forms to RHF without regressing JES-58.

### Out of scope (this wayfinder)

- Executing the full monorepo form migration (post-SPEC `/to-issues` / orchestrator).
- Tactics-board / canvas toolbar chrome that is not a product form.
- Throwaway prototypes under `apps/app/app/prototype/**` (may remain as evidence).
- Redesigning Server Action domain APIs beyond the error-shape contract.
- Changing Age Band product policy or check-in question content.
- A dedicated Form ADR beyond ADR 0001.

---

## 8. Deferred / fog (ok for later issues)

| Fog | Note |
|---|---|
| Migration wave order | Which feature clusters first after SPEC — suggestions in [BACKLOG.md](BACKLOG.md), not law |
| ESLint / CI guard | Raw `<input>`/`<select>`/`<textarea>` in product form trees — optional later |
| Player-local RHF adapters | How `ScaleInput` / `SliderInput` / `ChipInput` register (Controller wrappers vs stay outside FormField) — same Controller law, adapter detail open |
| Exact RHF `mode` / `reValidateMode` flags | Implementation detail as long as autosave / submit gates can read validity |
| Mass action-signature rewrite | Only on touched/migrated actions |

~~Dedicated Form ADR~~ — **closed** by JES-66: no.

---

## 9. Resolution & research index

| Ticket | Artifact |
|---|---|
| JES-64 Catalog surfaces | [research/form-surfaces-and-interaction-modes.md](research/form-surfaces-and-interaction-modes.md) |
| JES-65 DS / RHF gap | [research/ds-fields-and-rhf-form-gap.md](research/ds-fields-and-rhf-form-gap.md) |
| JES-66 Form primitive home | [resolutions/form-primitive-home-and-rhf-wiring.md](resolutions/form-primitive-home-and-rhf-wiring.md) |
| JES-67 Autosave + RHF | [resolutions/autosave-rhf-contract.md](resolutions/autosave-rhf-contract.md) |
| JES-68 Validation / errors | [resolutions/validation-ownership-and-action-error-mapping.md](resolutions/validation-ownership-and-action-error-mapping.md) |
| JES-69 Control vocabulary | [resolutions/control-vocabulary-and-native-exceptions.md](resolutions/control-vocabulary-and-native-exceptions.md) |
| JES-70 Pilots | [resolutions/rhf-ds-pilots-prototype.md](resolutions/rhf-ds-pilots-prototype.md) |
| JES-58 Settings autosave | [../jes-58-autosave-contract/resolution.md](../jes-58-autosave-contract/resolution.md) |
| ADR 0001 | [../../docs/adr/0001-design-system-package-boundary.md](../../docs/adr/0001-design-system-package-boundary.md) |
