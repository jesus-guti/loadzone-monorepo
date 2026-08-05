# Form System — Implementation backlog (suggestions)

Status: sketches for `/to-issues` — **not law**  
Date: 2026-08-05  
Parent: [MAP.md](MAP.md) · Spec: [SPEC.md](SPEC.md)

Independently grabbable **tracer-bullet** slices. Wave order and lint/CI remain **fog** on the parent map — treat clusters below as recommendations only. Do not start implementation from this file alone without promoting via `/to-issues`.

Each bullet: title + acceptance cues. Prefer one vertical slice per future issue.

---

## Suggested Wave 0 — Form fuel & hygiene

- **W0a — Stabilize Form* + typed `mapFormActionResultToRhf` in DS**  
  Ensure `packages/design-system/components/form.tsx` is production-ready (not prototype-only); export typed mapper; document import path in a short comment or rule cite. Acceptance: both apps can import Form* + mapper; no feature schemas in DS.

- **W0b — Cursor rule note for Form System**  
  Point `.cursor/rules/loadzone-design-system.mdc` (or a sibling rule) at SPEC §§2–5: RHF standard, Field*+FormField, native ban + exceptions, no FormItem fork. Acceptance: agents cite SPEC; no migration code in the same PR unless scoped separately.

---

## Suggested Wave 1 — Classic submit pilots → production

- **W1a — Migrate CreateTeamForm (+ optional CreateTeamDialog)**  
  Feature-local Zod schema shared with action; RHF + DS; `FormActionResult`; drop `useActionState` hybrid. Acceptance: onboarding create-team matches SPEC; Spanish field/form errors.

- **W1b — Migrate create/edit player forms**  
  Replace native `<select>` age band / consent with DS `Select`; RHF + shared schema. Acceptance: no raw selects on those surfaces; sentinel pattern for optional empty if needed.

- **W1c — Migrate session create/edit forms**  
  RHF + existing DS Select/Input/Textarea; action error channels. Acceptance: classic submit contract; no permanent `useActionState` hybrid.

---

## Suggested Wave 2 — Settings autosave

- **W2a — Equipo settings → RHF**  
  Smallest autosave surface (two text fields) proves §5 before wellness. Acceptance: JES-58 timing + last-saved + `resetField`; no Guardar.

- **W2b — Wellness settings → RHF + DS Select**  
  Replace native template selects; per-field debounce/blur; invalid blocks save. Acceptance: matches SPEC §5 + JES-70 pilot behavior in production.

- **W2c — Políticas / Club / Cuenta autosave fields**  
  DS Checkbox/Switch + Select; file uploads stay outside RHF tree. Acceptance: native checkbox/select debt cleared on touched sections.

---

## Suggested Wave 3 — Remaining admin + player

- **W3a — Exercise form + attendance batch**  
  RHF for metadata form; retire EnumSelect+hidden bridge; attendance as RHF or explicit “other” batch with DS controls. Acceptance: no hidden-native Select bridge on exercise.

- **W3b — Staff injuries status editor**  
  DS Select/Textarea + RHF or thin action mapping. Acceptance: no raw select/textarea on injuries page form.

- **W3c — Player injury report**  
  DS controls + RHF classic submit. Acceptance: no styled raw natives as the outer tree.

- **W3d — Player focus check-in RHF adapters (fog)**  
  Wire `ScaleInput` / `SliderInput` / `ChipInput` through Controller/FormField without promoting Age Band chrome to DS. Acceptance: one RHF form under focus-step; adapter approach documented in the issue.

---

## Optional / fog follow-ups

- **F1 — ESLint / CI guard for raw field elements** in product form trees (allow-list exceptions).  
- **F2 — Migration wave reorder** after first production learnings (W1 vs W2 swap is fine).  
- **F3 — Calendar-based date pattern** vs DS `Input type="date"` (product choice, not Form System law).
