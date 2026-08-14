# JES-67 — Decide autosave + RHF contract for settings

**Ticket:** [Decide autosave + RHF contract for settings](https://linear.app/jesus-guti-workspace/issue/JES-67/decide-autosave-rhf-contract-for-settings)  
**Parent map:** [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls) (JES-63)  
**Resolution:** [`.scratch/form-system-wayfinder/resolutions/autosave-rhf-contract.md`](../form-system-wayfinder/resolutions/autosave-rhf-contract.md)  
**Mode:** AFK full pipeline (auto/assume applied; hitl→accepted via AFK)  
**No production code** in this ticket.

## Question

How should settings per-field autosave (`useSettingsAutosave`: immediate vs debounced, flush on blur) map onto React Hook Form without regressing UX?

## Grounding

- **JES-58 law (absolute):** per-field autosave; no page-level **Guardar**; discrete controls save immediately; text/number debounce ~300ms + blur flush when value differs from last saved; silent success; Spanish error toast; ignore stale completions on team/route change. See `.scratch/jes-58-autosave-contract/resolution.md`.
- **Standing prefs (JES-63):** RHF is the product-form standard; Zod + `@hookform/resolvers`; Server Actions stay the mutation boundary; DS field primitives.
- **Live reference:** `use-settings-autosave.ts`, `wellness-settings-form.tsx` (native selects + debounced numeric limits), `equipo-settings-form.tsx`, `SettingsSection` / `SettingsRow`.
- **Form* home / register vs Controller:** owned by [Decide Form primitive home and RHF wiring shape](https://linear.app/jesus-guti-workspace/issue/JES-66/decide-form-primitive-home-and-rhf-wiring-shape) (JES-66). This contract is behavior-first and API-agnostic.

## Decisions so far

1. **Form granularity — one `useForm` per settings route form component** (`auto`)  
   e.g. one form for `WellnessSettingsForm` covering all `SettingsSection`s on that route. Not one `useForm` per field, and not one per section. Keeps one Zod schema, one `FormProvider`, and stable remount boundaries for deep links.

2. **Save triggers — per-field commit into `useSettingsAutosave`; never form-wide `watch`** (`auto`)  
   Map JES-58 control-commit moments onto RHF field handlers (`onChange` / `onBlur` via `register` or `Controller`). Discrete → `saveImmediate`. Text/number → `saveDebounced` on change + `flushDebounced` on blur. Skip save when value equals last-saved snapshot (closes the blur-always-saves gap in today's wellness flush). Do **not** subscribe form-wide `watch` / `dirtyFields` to fire saves.

3. **Validation vs save — block client save while the field is invalid** (`hitl` → accepted AFK)  
   Run field Zod (via resolver) before calling `saveImmediate` / `saveDebounced` / `flushDebounced`. Invalid → inline field error only; no save call; no validation toast spam. Empty wellness limit strings remain valid (`null` / disabled). Server still validates; server failures keep JES-58 toast + recovery path.  
   *AFK applied recommendation without waiting.*

4. **Post-save reset — per-field `resetField` / defaultValue bump only** (`assume`)  
   On successful field save: update last-saved snapshot and clear dirty for **that field only** (`resetField(name, { defaultValue })` or equivalent). Do **not** full-form `reset` from server props after each `revalidatePath` (would clobber sibling in-flight edits). On `teamId` / `routeKey` change: remount via `key` + fresh `defaultValues` (aligns with hook generation bump). On failure: revert discrete controls to last-saved; for text/number keep typed value, set field error, leave dirty for retry.  
   *Revert: switch failure path to always-revert, or allow full-form reset if pilots prove sibling clobber is rare — document in SPEC if changed.*

5. **Chrome + deep links — `SettingsSection` / `SettingsRow` stay presentational; anchors unchanged** (`auto`)  
   RHF wraps the route form tree; section `id`s (`#formularios`, legacy `#wellness-forms`) and scroll-mt stay on `SettingsSection`. No Guardar / submit chrome. Hash navigation must not remount the form. Row `label`/`htmlFor` remain the visible label; avoid duplicate `FormLabel` text (wire a11y via control id / `aria-*`).

## Hard case (wellness)

| Control | RHF | Save |
| --- | --- | --- |
| Pre/post template `<select>` → DS `Select` | field in section form | `saveImmediate` on change |
| Reminder minutes + wellness limits (`Input type="number"`) | same form | debounce 300ms + blur flush iff dirty vs last-saved **and** field valid |
| Empty limit | valid | may save `null` (disable threshold) |

## Out of scope

- Production migration / pilot implementation (JES-70).
- Form primitive home and `register` vs `Controller` API (JES-66).
- Server Action error → RHF `setError` shape detail beyond “map into field/form errors” (JES-68).
- Changing JES-58 product law (autosave absolute).

## Blocks

- [Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots) (JES-70)
- [Synthesize Form System SPEC](https://linear.app/jesus-guti-workspace/issue/JES-71/synthesize-form-system-spec) (JES-71)
