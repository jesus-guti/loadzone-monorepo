# Form primitive home and RHF wiring shape

**Ticket:** [Decide Form primitive home and RHF wiring shape](https://linear.app/jesus-guti-workspace/issue/JES-66/decide-form-primitive-home-and-rhf-wiring-shape)  
**Accepted:** AFK `hitl → accepted` (2026-08-05) — recommendations applied without human wait per orchestrator AFK override.  
**Planning map:** `.scratch/jes-66-form-primitive-home/map.md`  
**Parent:** [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
**Evidence:** [Inventory DS fields and RHF Form gap](../research/ds-fields-and-rhf-form-gap.md), [Form surfaces and interaction modes](../research/form-surfaces-and-interaction-modes.md)  
**Governance:** [ADR 0001](../../../docs/adr/0001-design-system-package-boundary.md), `.cursor/rules/loadzone-design-system.mdc`

**Scope:** Where shared React Hook Form wiring lives and what public shape it exposes. **Does not** ship production Form components or migrate product forms.

---

## Answer

### 1. Home — promote into `@repo/design-system` now

Shared RHF wiring **belongs in** `@repo/design-system` as the planned Form System home — not as a temporary app-local kit waiting for a second consumer to “prove” promotion.

**Law:**

- Package module (implementation later): `packages/design-system/components/form.tsx` (flat sibling of `field.tsx`).
- Public exports (minimum): `Form`, `FormField`, `FormControl`, `FormMessage`, plus any small field-context hooks the shadcn/Base UI pattern needs (`useFormField` or equivalent).
- Apps import by path, same as other primitives: `@repo/design-system/components/form`.
- `react-hook-form`, `@hookform/resolvers`, and `zod` remain package dependencies (already present; currently unused in source).
- Product Form* implementation is a **later intentional PR** that names both `apps/app` and `apps/player` as consumers and links this resolution + ADR 0001. This ticket only locks the decision.

**ADR 0001 gates (satisfied intentionally):**

| Gate | How this decision meets it |
|---|---|
| App-agnostic contract | Form adapters carry no admin density, player check-in/DailyEntry domain, Spanish product copy, or Age Band branches |
| ≥2 product boundaries | Form System SPEC (JES-63) already commits **both** `apps/app` and `apps/player` to one RHF + DS authoring contract — same behavior/API, not similar visuals alone |
| Token-driven appearance | Error/invalid chrome uses existing semantic / Field tokens; no per-app class forks in the shared file |
| Intentional move PR | Future Form* land PR names second consumer + links governance; this resolution is the pre-commit of that intent |
| Prefer regenerable registry | Prefer shadcn registry `form` item adapted to LoadZone tokens/icons over a one-off composite |

**Rejected alternative:** Keep Form wiring app-local until one app ships and a second copies it. That fights the map standing preference, leaves unused RHF deps orphaned, and invents a throwaway ownership boundary the SPEC already crossed.

### 2. Control API — `FormField` / Controller primary; `register` narrow escape hatch

**Law:**

- **Preferred path for every control:** `FormField` wrapping RHF `Controller`, with a render prop that receives `field` / `fieldState`.
- **Required path** for Base UI / composite controls that do not behave like native named inputs: `Select`, `Combobox`, `Checkbox`, `Switch`, `RadioGroup`, `Toggle` / `ToggleGroup`, `Slider`, `Calendar`, `InputOTP`, and any future non-native composite.
- **Allowed escape hatch:** `register(...)` only on plain `Input`, `Textarea`, and `NativeSelect` when the author intentionally wants uncontrolled DOM fields. SPEC and docs teach Controller/`FormField` first; `register` is not the house style.
- Do **not** invent a second LoadZone form library (no Formik, no uncontrolled-only layer, no app-specific `useForm` wrapper that hides RHF).

**Composition sketch (prose / types — not shipped code):**

```tsx
// Text / NativeSelect — preferred
<FormField
  control={form.control}
  name="teamName"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid || undefined}>
      <FieldLabel>Nombre del equipo</FieldLabel>
      <FormControl>
        <Input {...field} aria-invalid={fieldState.invalid} />
      </FormControl>
      <FieldDescription>Visible en el roster.</FieldDescription>
      <FormMessage />
    </Field>
  )}
/>

// Base UI Select — must use Controller field value + onChange → onValueChange
<FormField
  control={form.control}
  name="status"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid || undefined}>
      <FieldLabel>Estado</FieldLabel>
      <Select value={field.value} onValueChange={field.onChange}>
        <FormControl>
          <SelectTrigger aria-invalid={fieldState.invalid}>
            <SelectValue />
          </SelectTrigger>
        </FormControl>
        <SelectContent>{/* SelectItem… */}</SelectContent>
      </Select>
      <FormMessage />
    </Field>
  )}
/>
```

`FormControl` owns accessibility wiring (`id`, `aria-describedby`, `aria-invalid`) for the slotted control. Combobox and other composites follow the same value/`onValueChange` (or checked/`onCheckedChange`) mapping inside `FormField`.

Player-local check-in controls (`ScaleInput`, `SliderInput`, `ChipInput`) stay **app-local compositions** but register with RHF through the same Controller/`FormField` rule (detail left to SPEC fog / later ticket — not a second form system).

### 3. Relationship to `Field*` — compose, do not replace

**Law:**

- Existing `Field*` layout primitives in `packages/design-system/components/field.tsx` remain the **layout vocabulary**: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`.
- RHF layer is additive: `Form` (= `FormProvider`), `FormField`, `FormControl`, `FormMessage`.
- **Do not** ship parallel `FormItem` / `FormLabel` / `FormDescription` that duplicate Field layout. Authors compose `Field*` inside `FormField` render.
- `FormMessage` is the RHF-aware error reader (field-context message). Presentation reuses `FieldError` tokens/slots (compose or thin wrapper) so product trees do not grow two error chromes.
- `FieldError` without RHF remains valid for non-RHF or manual error lists (its existing `errors?: Array<{ message?: string }>` helper).
- App-local session `FieldLabel` (`apps/app/features/sessions/...`) is **out of scope** for this decision; vocabulary / migration tickets retire dual labels toward DS `FieldLabel`.

**Rejected alternative:** Replace `Field*` with classic shadcn `FormItem` tree and deprecate Field layout. That discards regenerable Field primitives already in the package and recreates the dual-vocabulary problem JES-65 flagged — only inverted.

---

## Implications for downstream tickets

| Ticket | What this unlocks |
|---|---|
| JES-67 (autosave + RHF) | Settings pilots assume DS `Form`/`FormField` home; contract is how autosave talks to `control`, not where wrappers live |
| JES-68 (validation / action errors) | Maps Server Action errors into RHF `setError` against DS Form field names |
| JES-70 (pilots) | Prototypes import Form* from `@repo/design-system`; no app-local Form kit |
| Form System SPEC | Authoring chapter: Field layout + FormField Controller; Select composition; no FormItem fork |

## Explicit non-goals

- Shipping `form.tsx` or any product migration in this ticket.
- Choosing settings autosave timing, Zod schema ownership per feature, or ESLint bans on native controls.
- Promoting player Age Band / focus-step chrome into DS.
