# JES-66 — Decide Form primitive home and RHF wiring shape

Planning map for [Decide Form primitive home and RHF wiring shape](https://linear.app/jesus-guti-workspace/issue/JES-66/decide-form-primitive-home-and-rhf-wiring-shape).  
Parent map: [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls) (JES-63).  
Blocked by: [Inventory DS fields and RHF Form gap](https://linear.app/jesus-guti-workspace/issue/JES-65/inventory-ds-fields-and-rhf-form-gap) (JES-65) — resolved.  
Blocks: [Decide autosave + RHF contract for settings](https://linear.app/jesus-guti-workspace/issue/JES-67/decide-autosave-rhf-contract-for-settings) (JES-67), [Decide validation ownership and action error mapping](https://linear.app/jesus-guti-workspace/issue/JES-68/decide-validation-ownership-and-action-error-mapping) (JES-68), [Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots) (JES-70).  
Route: AFK full pipeline · Risk: medium (shared DS contract; reversible until Form* ships).

## Destination

Lock where shared React Hook Form wiring lives and what public shape it exposes — enough for the Form System SPEC and later pilots — **without** implementing production Form components in this ticket.

## Notes

- Domain: `@repo/design-system` Form/RHF adapters; consult ADR 0001, `loadzone-design-system.mdc`, research under `.scratch/form-system-wayfinder/research/`.
- Standing preference (JES-63): prefer promoting shared Form wiring into DS when both apps need the same app-agnostic contract; RHF + `@hookform/resolvers` already dependencied there; still must pass ADR 0001 five gates.
- Evidence: DS field widgets exist; no `form.tsx`; product forms use zero RHF today (JES-64 / JES-65).
- Autonomy: classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. AFK override: apply recommendations immediately as `hitl → accepted`. Do not implement production Form* in this ticket.
- Resolution law: `.scratch/form-system-wayfinder/resolutions/form-primitive-home-and-rhf-wiring.md`.

## Decisions so far

### Auto

1. **[auto] Decision-only ticket** — Record home + public API shape in scratch/resolution; do **not** add `form.tsx` or migrate product forms here. Implementation follows SPEC / later issues (e.g. pilots).
2. **[auto] No new ADR for this choice** — ADR 0001 already governs package boundary and promotion. Form wiring is another app-agnostic primitive under that ADR; rules + Form System SPEC document the authoring contract. (Fog on JES-63 about a dedicated Form ADR stays closed unless a later export/folder split forces one.)
3. **[auto] Apps consume Form via DS path imports** — Same pattern as `Input` / `Field` today (`@repo/design-system/components/…`); no barrel re-export required by this decision.
4. **[auto] Validation stack stays package-owned** — Zod + `@hookform/resolvers` remain DS dependencies; field/form error mapping to Server Actions is owned by later tickets (JES-67 / JES-68), not redefined here.

### Assume

5. **[assume] Module home `packages/design-system/components/form.tsx`** — Flat sibling of `field.tsx` / `input.tsx`, generated or hand-adapted from the shadcn registry `form` item against existing `components.json` (`base-nova`).  
   **Revert:** nest under a registry-required path (e.g. `components/ui/form.tsx`) only if CLI regenerate forces it; keep the public import alias stable for apps.
6. **[assume] Thin `FormMessage` → FieldError presentation** — `FormMessage` reads RHF field-state errors; visual presentation reuses `FieldError` tokens/slots (compose or thin wrapper), not a second error chrome system.  
   **Revert:** keep classic standalone `FormMessage` styles if FieldError composition fights a11y id wiring in the first pilot — still one error vocabulary in SPEC docs.

### Hitl → accepted (AFK recommendation applied 2026-08-05)

7. **[hitl → accepted] Promote Form wiring into `@repo/design-system` now** — Planned home is DS `Form` / `FormField` / `FormControl` / `FormMessage` (+ field-context helpers as needed). Do **not** keep a temporary app-local Form kit “until a second consumer ships”: JES-63 already scopes both `apps/app` and `apps/player` to the same app-agnostic contract, RHF deps already live in the package, and ADR 0001 gates are satisfied intentionally (not use-count auto-promote). Product Form* code still lands in a later implementation PR that names both consumers.
8. **[hitl → accepted] Primary control API is `FormField` (Controller) render props** — One authoring story for text and composites. Base UI Select / Combobox / Checkbox / Switch / Radio / Toggle / Slider / Calendar / OTP **must** wire through Controller/`FormField` (`value` + `onValueChange` / equivalent). `register` is an allowed escape hatch only for plain `Input` / `Textarea` / `NativeSelect` when intentionally uncontrolled — not the preferred path in SPEC/docs.
9. **[hitl → accepted] Compose with existing `Field*` layout; do not replace** — Keep `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, … as the layout vocabulary. RHF layer adds `Form` (= `FormProvider`), `FormField`, `FormControl`, `FormMessage`. Do **not** introduce parallel `FormItem` / `FormLabel` / `FormDescription` that duplicate Field layout. Authors compose `Field*` inside `FormField` render. App-local session `FieldLabel` cleanup is out of scope here (vocabulary / migration tickets).

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Decision-only / no Form* code | `auto` | Ticket AC + wayfinder plan-don't-do |
| 2 | No dedicated Form ADR | `auto` | ADR 0001 covers boundary |
| 3 | Path-import consumption | `auto` | Existing DS convention |
| 4 | Zod/resolvers stay in DS; action mapping deferred | `auto` | Deps present; JES-67/68 own mapping |
| 5 | `form.tsx` module path | `assume` | Convention; clean revert |
| 6 | FormMessage ↔ FieldError presentation | `assume` | Avoid dual chrome; pilot may adjust |
| 7 | Promote Form wiring into DS now | `hitl → accepted` | DS transversal + ADR gates + JES-63 standing pref |
| 8 | FormField/Controller primary API | `hitl → accepted` | Shared authoring contract across controls |
| 9 | Field* compose, don't replace | `hitl → accepted` | DS transversal / dual-vocabulary risk |

## Out of scope (this ticket)

- Implementing `form.tsx` or migrating any product form.
- Autosave ↔ RHF contract (JES-67).
- Validation ownership / Server Action error mapping (JES-68).
- Control vocabulary / native-control bans (later SPEC tickets).
- Player `ScaleInput` / `SliderInput` / `ChipInput` adapter details (map fog; follows Controller rule).
