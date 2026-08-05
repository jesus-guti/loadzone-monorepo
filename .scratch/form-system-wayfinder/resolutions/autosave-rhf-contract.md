# Autosave + RHF contract for settings

**Ticket:** [Decide autosave + RHF contract for settings](https://linear.app/jesus-guti-workspace/issue/JES-67/decide-autosave-rhf-contract-for-settings)  
**Parent map:** [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls) (JES-63)  
**Session map:** [`.scratch/jes-67-autosave-rhf/map.md`](../../jes-67-autosave-rhf/map.md)  
**Accepted:** AFK full pipeline (2026-08-05) — hitl recommendation applied without human wait  
**Supersedes:** nothing; **extends** [JES-58 settings autosave contract](../../jes-58-autosave-contract/resolution.md) with an RHF mapping. JES-58 law must not regress.

## Answer

Settings keep **per-field autosave** under React Hook Form: one `useForm` per settings **route form component**, field-level commits into existing `useSettingsAutosave`, client validation **blocks** invalid saves, and successful saves clear dirty **per field** without full-form resets that clobber siblings. Deep-link chrome (`SettingsSection` / `SettingsRow`) stays outside the RHF authoring API.

---

## 1. Form granularity

**One `useForm` per settings route form component** (e.g. `WellnessSettingsForm`, `EquipoSettingsForm`), spanning every `SettingsSection` on that route.

| Rejected | Why |
| --- | --- |
| One `useForm` per field | Breaks shared Zod schema / `FormProvider`, multiplies remounts, fights deep-link scroll stability |
| One `useForm` per `SettingsSection` | Splits schema and last-saved bookkeeping; wellness (Formularios + Umbrales + Recordatorios) is one product surface |

`defaultValues` come from the server props that hydrate the page. Remount the form when `teamId` (and route identity) changes — e.g. `key={teamId}` — so context switches match the generation bump already in `useSettingsAutosave`.

File uploads on hybrid routes (Cuenta avatar, Club logo) stay **outside** the RHF field tree (or use a dedicated non-autosave control) so they do not invent a Guardar path.

---

## 2. When to call save (RHF → `useSettingsAutosave`)

Preserve JES-58 control-commit moments; only change the **wiring**, not the law.

| Control kind | RHF moment | Hook API |
| --- | --- | --- |
| Toggle / select / checkbox / segmented | Value commit `onChange` | `saveImmediate(() => action(…))` |
| Text / number | `onChange` (debounced) **and** `onBlur` flush | `saveDebounced(fieldKey, …)` / `flushDebounced(fieldKey, …)` |

### Rules

1. **Per-field handlers only.** Wire saves from the field’s `onChange` / `onBlur` (via `register` return or `Controller` `field` — exact API is JES-66).  
2. **No form-wide save subscription.** Do not `watch()` the whole form, and do not iterate `dirtyFields` on a timer, to trigger saves. That would batch-spam Server Actions and fight “save the field that changed.”  
3. **Last-saved gate.** Before debounce fire or blur flush, compare the candidate value to a per-field **last-saved snapshot**. If equal, skip the hook call (JES-58: blur commits only when value differs from last saved). Today’s wellness `onBlur` always flushes — pilots must close that gap.  
4. **Debounce key = field name** (same string RHF uses), passed to `saveDebounced` / `flushDebounced`.  
5. **Keep `useSettingsAutosave`.** Generation / stale-completion behavior stays the single concurrency law; RHF does not replace it.  
6. **No Enter-to-save / no Guardar.** Optional `<form className="contents" onSubmit={(e) => e.preventDefault()}>` is fine for a11y grouping; never introduce submit chrome.

`mode` / `reValidateMode` should validate early enough that the save gate can read field validity on each change (typically `onChange` for continuous fields; discrete fields validate on change at commit). Exact RHF `mode` flags are implementation detail as long as the gate works.

---

## 3. Validation timing vs save timing

**Block client-side save while the committing field is invalid.**

| Stage | Behavior |
| --- | --- |
| Client Zod (resolver / field schema) fails | Do **not** call `saveImmediate` / `saveDebounced` / `flushDebounced`. Show inline field error (`FormMessage` / `FieldError`). No toast for client validation. |
| Client Zod passes | Proceed with JES-58 save timing. |
| Server returns `success: false` | Spanish error toast (JES-58); map message into RHF field error when the shape is field-scoped (detail in JES-68). Apply failure recovery in §4. |

### Wellness-specific

- Empty string for a limit is **valid** and means disabled (`null`) — saving empty is allowed and must not be treated as “invalid number.”
- Out-of-range / non-numeric (when non-empty) is **invalid** — block save; keep the typed value visible with inline error.
- Reminder minutes: same rule — only save finite ints in range; mirror server `reminderMinutesSchema` on the client field schema.

Server Actions remain authoritative; client block is UX + noise reduction, not a security boundary.

---

## 4. `reset` / `defaultValues` after save and round-trip

### Success

1. Update the field’s **last-saved snapshot** to the value just persisted.  
2. Clear dirty for **that field only** — prefer `resetField(name, { defaultValue: saved })` (or equivalent) so sibling dirty fields keep typing.  
3. Do **not** replace the entire form from server props after every `revalidatePath` / RSC refresh while the user is on the page. Full `reset(serverProps)` is reserved for remount (`teamId` / route change) or first mount.

Silent success remains the feedback law (no success toasts).

### Failure

| Control kind | Recovery |
| --- | --- |
| Discrete (select / toggle / checkbox) | Revert control to last-saved (`resetField` / setValue to snapshot). Toast already shown. |
| Text / number | Keep typed value; set field error; leave dirty so blur/retry can re-attempt. Optional: explicit retry is the next valid debounce/blur. |

Permission-denied: existing authz path; do not loosen `canEdit` / `canCreateTeam`.

### Stale completions

Unchanged from JES-58 / `useSettingsAutosave`: if generation ≠ current (team or route changed), ignore the result — do not `resetField` or toast for stale work.

---

## 5. Coexistence with deep links and settings chrome

| Concern | Contract |
| --- | --- |
| `SettingsSection` | Keeps `id` / `scroll-mt` for anchors (`#formularios`, legacy `#wellness-forms`). Not an RHF boundary. |
| `SettingsRow` | Keeps visible Spanish `label` + `htmlFor` pointing at the control `id`. Do not duplicate the same string with a second visible `FormLabel`. |
| Hash / deep link | Must not remount or `reset` the form. Scroll is independent of RHF state. |
| Route layout | Autosave absolute — no footer Guardar on Equipo / Wellness / Políticas / Club / Cuenta. |
| DS controls | Prefer DS primitives (`NativeSelect` / `Select`, `Input`, `Checkbox`, …) over raw natives as Form System migrates; behavior contract is identical. |

---

## Hard case: wellness settings

Concrete mapping for the live hard case:

```
WellnessSettingsForm
  useForm({ defaultValues: { preForm, postForm, preMinutes, … limits… }, resolver })
  useSettingsAutosave({ teamId, routeKey: "wellness" })
  <SettingsSection id="formularios">  // deep link
    NativeSelect preForm  → onChange → if valid → saveImmediate(updateTeamFormAssignment)
    NativeSelect postForm → same
  </SettingsSection>
  <SettingsSection title="Umbrales…">
    Input soreness|recovery|… → onChange → if valid & ≠ lastSaved → saveDebounced
                              → onBlur  → if valid & ≠ lastSaved → flushDebounced
  </SettingsSection>
  <SettingsSection title="Recordatorios">
    Input pre/post minutes → same debounced pattern
  </SettingsSection>
```

Pilot order hint (from JES-64 research): prove the contract on **Equipo** (two text fields) before wellness.

---

## Non-goals

- Implementing the RHF migration or changing production settings forms in this ticket.  
- Choosing Form primitive home / `register` vs `Controller` (JES-66).  
- Full Server Action ↔ `setError` vocabulary (JES-68).  
- Weakening JES-58 (autosave absolute, no Guardar).  
- Player-app forms (out of settings autosave law; covered elsewhere on the Form System map).

## Downstream

- **JES-70** pilots must exercise Equipo then Wellness against this contract.  
- **JES-71** SPEC must cite this resolution + JES-58 as the settings interaction chapter.
