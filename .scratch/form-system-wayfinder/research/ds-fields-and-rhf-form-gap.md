# Inventory: design-system fields and RHF Form gap

**Ticket:** [JES-65](https://linear.app/jesus-guti-workspace/issue/JES-65/inventory-ds-fields-and-rhf-form-gap)  
**Map:** [JES-63](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
**Date:** 2026-08-05  
**Scope:** Primary sources under `packages/design-system/**`, product form imports in `apps/app` and `apps/player`, and `components.json`.

## Verdict

`@repo/design-system` already ships a full set of field primitives (Input through Field layout, plus Combobox / NativeSelect / OTP / Slider / Calendar). Product forms today use a thin subset (`Input`, `Label`, `Select*`, `Textarea`, occasional `Switch` / `Calendar`) and wire them with `useActionState` + FormData or local `useState` autosave — **not** React Hook Form. The package depends on `react-hook-form` and `@hookform/resolvers` but has **no** `form.tsx` and **zero** source imports of those packages. The shadcn-style `Form` / `FormField` / `FormControl` / `FormItem` / `FormLabel` / `FormMessage` / `FormDescription` authoring path is the main gap.

---

## 1. Package deps and registry

| Fact | Source |
| --- | --- |
| `react-hook-form` `^7.68.0` is a dependency | `packages/design-system/package.json` |
| `@hookform/resolvers` `^5.2.2` is a dependency | same |
| `zod` `^4.1.13` is a dependency | same |
| No `form.tsx` (or any Form* module) under components | filesystem: `packages/design-system/components/form.tsx` absent |
| No source file imports `react-hook-form` or `@hookform/*` | repo-wide search; only `package.json` / lockfile reference them |
| Package barrel exports only `DesignSystemProvider` | `packages/design-system/index.tsx` — apps import components by path |
| Registry config: shadcn schema, style `base-nova`, RSC, aliases to `@repo/design-system/components` | `packages/design-system/components.json` |
| `iconLibrary` still `"lucide"` in registry config (product code uses Phosphor) | `components.json` — irrelevant to Form gap, but registry is ready to `add` a form component |

Neither `apps/app/package.json` nor `apps/player/package.json` list `react-hook-form` or `@hookform/resolvers`.

---

## 2. Field primitives that exist in `@repo/design-system`

All live under `packages/design-system/components/` (direct path imports; not re-exported from `index.tsx`).

### Core controls

| Module | Exports | Notes |
| --- | --- | --- |
| `input.tsx` | `Input` | Base UI `Input`; supports `aria-invalid` styling |
| `textarea.tsx` | `Textarea` | Present |
| `label.tsx` | `Label` | Present |
| `select.tsx` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` | Composite Base UI select |
| `native-select.tsx` | `NativeSelect`, `NativeSelectOptGroup`, `NativeSelectOption` | Styled native `<select>` wrapper — good FormData/`name` path |
| `combobox.tsx` | `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`, `ComboboxEmpty`, `ComboboxSeparator`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipsInput`, `ComboboxTrigger`, `ComboboxValue`, `useComboboxAnchor` | Present; unused in product forms |
| `checkbox.tsx` | `Checkbox` | Base UI checkbox; unused in product forms |
| `switch.tsx` | `Switch` | Present |
| `radio-group.tsx` | `RadioGroup`, `RadioGroupItem` | Present; unused in product forms |
| `toggle.tsx` | `Toggle`, `toggleVariants` | Present |
| `toggle-group.tsx` | `ToggleGroup`, `ToggleGroupItem` | Present; unused in product forms |
| `slider.tsx` | `Slider` | Present; unused in product forms (player uses app-local range) |
| `calendar.tsx` | `Calendar`, `CalendarDayButton` | Present |
| `input-otp.tsx` | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | Present; unused |
| `input-group.tsx` | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea` | Composition helpers; unused in product forms |

### Field layout (not RHF)

| Module | Exports |
| --- | --- |
| `field.tsx` | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle` |

`FieldError` accepts optional `errors?: Array<{ message?: string } | undefined>` — a display helper, **not** wired to RHF `formState.errors` (`packages/design-system/components/field.tsx`). None of these `Field*` exports are imported from `@repo/design-system` in product apps (search: no `from "@repo/design-system/components/field"`).

**Absent:** `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormProvider` wrappers (classic shadcn RHF layer).

---

## 3. What product forms use today

### `apps/app` — design-system field imports (product / features)

| Primitive | Used in product forms / settings? | Representative paths |
| --- | --- | --- |
| `Input` | Yes — dominant | `features/players/components/create-player-form.tsx`, `edit-player-form.tsx`, `features/teams/components/create-team-form.tsx`, `features/sessions/components/session-form.tsx`, `edit-session-form.tsx`, `attendance-form.tsx`, `features/exercises/components/exercise-form.tsx`, settings forms (`wellness-settings-form.tsx`, `club-settings-form.tsx`, …), `create-team-dialog.tsx` |
| `Label` | Yes | create/edit player, create team/season, excused absence, create-team-dialog, age-band-policy-fields, edit-profile-dialog |
| `Select*` | Yes | session forms, exercise form, attendance, edit-player (partial), toolbars/switchers |
| `Textarea` | Yes | session forms, exercise form, session-builder, tactics toolbar |
| `Switch` | Sparse | `recurrence-picker.tsx`, tactics `toolbar.tsx` (toolbar is map out-of-scope chrome) |
| `Calendar` | Filter UI | `features/wellness/components/wellness-date-filter.tsx` (not a classic submit form) |
| `Checkbox` | **No DS usage** | Native `type="checkbox"` in settings: `age-band-policy-fields.tsx`, `reminder-consent-policy-fields.tsx`, `politicas-settings-form.tsx`, `club-settings-form.tsx` |
| `NativeSelect` | **No** | Ad-hoc native `<select className=…>` instead (below) |
| `Combobox`, `RadioGroup`, `ToggleGroup`, `Field*`, `InputOTP`, `InputGroup`, `Slider` | **No** product form imports found | — |

App-local label: sessions/exercises use `FieldLabel` from `apps/app/features/sessions/components/form-section.tsx`, **not** DS `FieldLabel`.

### Native HTML controls still in product forms

Despite DS `Select` / `NativeSelect` / `Checkbox` existing, product trees still use raw markup:

| Pattern | Paths |
| --- | --- |
| `<select>` | `create-player-form.tsx`, `edit-player-form.tsx`, `wellness-settings-form.tsx`, `politicas-settings-form.tsx`, `reminder-consent-policy-fields.tsx`, `apps/app/app/(authenticated)/injuries/page.tsx`, `apps/player/.../injury-report-form.tsx` |
| `type="checkbox"` | settings policy / club / reminder consent fields (listed above) |

Example: `create-player-form.tsx` uses DS `Input` + `Label` but a hand-styled native `<select>` for age band override.

### Authoring / mutation patterns (no RHF)

| Pattern | Evidence |
| --- | --- |
| `useActionState` + `<form action={…}>` + `name=` fields | e.g. `create-player-form.tsx`, `create-team-form.tsx` |
| Settings autosave via `useState` + field actions | `wellness-settings-form.tsx` + `use-settings-autosave` |
| FormData checkbox helpers | `features/settings/lib/age-band-policy-form.ts`, `reminder-consent-policy-form.ts` |

Repo search: **no** `useForm`, `Controller`, `FormProvider`, or `@hookform` usage under `apps/`.

### `apps/player`

Player check-in / injury UI barely uses DS field primitives:

- Forms import `Button`, `Badge`, `AlertDialog`, `toast`, etc. — not `Input` / `Select` / `Label` (`pre-session-form.tsx`, `post-session-form.tsx`, `injury-report-form.tsx`).
- App-local controls: `scale-input.tsx`, `slider-input.tsx`, `chip-input.tsx` (native range / button groups; `slider-input.tsx` uses a native `<input type="range">`).
- Injury report still uses a native `<select>`.

These match JES-63 “Not yet specified” notes on how player-local inputs register with RHF.

### `apps/web` (out of map core, for completeness)

`apps/web/app/[locale]/contact/components/contact-form.tsx` imports DS `Calendar`, `Input`, `Label` — same non-RHF style as admin.

---

## 4. Gap analysis for an RHF authoring path

### What is missing

1. **`form.tsx` (or equivalent) in `@repo/design-system`**  
   Shadcn-style wrappers typically: `Form` (= `FormProvider`), `FormField` (`Controller`), `FormItem`, `FormLabel`, `FormControl` (slot/`aria-*` wiring), `FormDescription`, `FormMessage`. None exist; deps are pre-installed but unused.

2. **App dependencies / consumption**  
   Even after adding Form* to the DS package, apps must import and use them; today neither app depends on RHF directly (they would get it via the workspace package once wrappers exist and are used).

3. **Adoption of unused field primitives**  
   Spec intent (JES-63) names Checkbox, Combobox, Toggle Group, Radio Group, Field layout — all exist in DS but are unused or replaced by native HTML / app-local chrome.

4. **Dual Field vocabularies**  
   DS `Field*` (layout + `FieldError`) vs future RHF `Form*` vs app-local `FieldLabel` in sessions — SPEC / control-vocabulary tickets (JES-66, JES-69) need to pick a single authoring story.

5. **Server Action + RHF bridge**  
   Current success/error paths are toast + `useActionState` state objects, not `setError` / field-level RHF mapping. That contract is SPEC work, not a missing component file.

### What is already enough for controls

- Visual / a11y field widgets are largely present (`aria-invalid` on Input/NativeSelect/Checkbox, etc.).
- `NativeSelect` is the natural drop-in for FormData-friendly selects currently written as raw `<select>`.
- `Field` layout can compose labels/descriptions/errors without RHF; RHF `FormMessage` would still be needed for automatic `name`-keyed errors.

### Registry note

`components.json` is configured for shadcn CLI against this package (`style: "base-nova"`, aliases under `@repo/design-system/...`). Adding the official **form** registry item is a viable generation path, then adapting tokens/icons to LoadZone conventions — but nothing has been generated yet.

---

## 5. Summary table

| Layer | Status |
| --- | --- |
| DS field widgets | Present (Input, Textarea, Select, NativeSelect, Combobox, Checkbox, Switch, Toggle/ToggleGroup, RadioGroup, Slider, Calendar, InputOTP, InputGroup, Label, Field*) |
| DS Form* / RHF wrappers | **Missing** |
| RHF deps in DS `package.json` | Present, unused in source |
| Product usage | Input / Label / Select / Textarea primary; Switch / Calendar sparse; many natives; no Field*, Checkbox, Combobox, RadioGroup, NativeSelect |
| Player forms | App-local Scale/Slider/Chip; almost no DS fields |
| Product RHF usage | **None** |

---

## Sources (primary)

- `packages/design-system/package.json`
- `packages/design-system/components.json`
- `packages/design-system/index.tsx`
- `packages/design-system/components/{input,textarea,label,select,native-select,combobox,checkbox,switch,radio-group,toggle,toggle-group,slider,calendar,input-otp,input-group,field}.tsx`
- Product import greps under `apps/app/features/**`, `apps/player/**`
- Representative forms: `apps/app/features/players/components/create-player-form.tsx`, `apps/app/features/settings/components/wellness-settings-form.tsx`, `apps/player/app/[token]/components/{pre-session-form,scale-input,slider-input,chip-input}.tsx`
