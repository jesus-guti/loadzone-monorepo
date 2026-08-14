# Validation ownership and action error mapping (resolution)

**Ticket:** [Decide validation ownership and action error mapping](https://linear.app/jesus-guti-workspace/issue/JES-68/decide-validation-ownership-and-action-error-mapping) (JES-68)  
**Parent map:** [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls) (JES-63)  
**Planning ledger:** [`.scratch/jes-68-validation-error-mapping/map.md`](../../jes-68-validation-error-mapping/map.md)  
**Date:** 2026-08-05  
**Mode:** AFK (auto/assume applied; 3 hitl recommendations accepted)  
**Grounded on:** JES-64 surface catalog, JES-65 DS/RHF gap, `CreateTeamForm` + `createTeam`, session/player/settings action result patterns, `@repo/database` domain Zod, JES-58 autosave feedback law.

This resolution locks the Form System contract for **Zod ownership**, **client↔server validation**, **action error shape**, and **`useActionState` migration posture**. It does **not** migrate production forms.

---

## 1. Schema ownership

### Default

**Feature-local.** Each product form (or tightly related form family) owns one Zod module next to its feature code, e.g.:

- `apps/app/features/teams/schemas/create-team.schema.ts`
- imported by both the Server Action and the client form (`zodResolver`)

Do **not** put feature form schemas in `@repo/design-system`. DS owns UI primitives and (per JES-66) Form wiring — not domain field rules.

### When shared packages host Zod

| Case | Where | Rule |
| --- | --- | --- |
| Domain invariant already owned by a package | e.g. `@repo/database/age-band-policy`, `wellness-limits`, `reminder-consent` | Feature form schemas **import / refine / pick** that schema. Do not fork conflicting rules. |
| Identical form contract across ≥2 of `{apps/app, apps/player, apps/web}` (or a shared non-UI consumer) | Promote the **schema module** into the package that owns the domain (usually `@repo/database`), not a new form-kit package | Same ADR 0001 spirit: intentional promotion, not use-count of lookalike fields. |
| Otherwise | Stay feature-local | — |

No `@repo/forms` package in this map.

### Colocation (`assume`)

Prefer `*.schema.ts` modules that **client components can import**. Avoid leaving the only copy of a schema inside a `"use server"` file that the client cannot touch — that pattern forces duplication.

---

## 2. Client resolver vs server re-validation

**Law:** one schema module; two call sites.

| Layer | Responsibility |
| --- | --- |
| Client | `zodResolver(schema)` (or equivalent) for immediate UX; blocks obvious bad submits |
| Server Action | **Always** `schema.safeParse(...)` before mutate — trust boundary |

- **Rejected:** divergent client/server Zod object literals, or relying on HTML `required`/`minLength` as the only client check while the action has richer rules (today’s `CreateTeamForm` gap).
- **Accepted:** action accepts `z.infer<typeof schema>` for RHF-migrated forms; FormData parsing may remain on unmigrated `useActionState` actions until their wave, still running the same schema after mapping FormData → object.
- Client validation never replaces server validation.

---

## 3. Canonical action result shape

### Type (SPEC / pilot target)

```ts
export type FormActionResult = {
  success: boolean;
  /** Field path → single Spanish message. Maps to RHF setError(name, { message }). */
  fieldErrors?: Record<string, string>;
  /** Non-field form error. Maps to RHF root / inline form banner. */
  formError?: string;
  /** Ephemeral failure. Spanish toast only; do not sticky on fields. */
  toastError?: string;
};
```

Keep `success: boolean` for continuity with today’s `SettingsFieldResult` and feature `ActionResult` types. Optional success payloads (`sessionId`, etc.) remain action-local extras; they are not part of the error contract.

### Channel rules

| Failure kind | Channel | UI |
| --- | --- | --- |
| Zod issues with field `path` | `fieldErrors` | RHF field messages via FormMessage / FieldError |
| Zod form-level refine / issues without usable path | `formError` | Root / banner |
| Authz, missing team/club, not-found, unexpected `catch` | `toastError` (preferred) | Toast; classic submit may use `formError` instead when an inline banner is clearer — **one** channel, same Spanish copy |
| Settings autosave field failure (JES-58) | `toastError` | Toast; control stays dirty / retry per JES-58 |

On `success: true`, omit error channels. Do not send conflicting copy on two channels for the same failure.

### Mapping helper (implement later)

Pilots / SPEC should define a thin mapper (location deferred to JES-66):

1. If `fieldErrors` — `setError` each path; clear stale server errors on resubmit as RHF normally does.
2. If `formError` — `setError("root", { message: formError })` (or agreed root key).
3. If `toastError` — `toast.error(toastError)` (Spanish); leave field state alone unless JES-67 says otherwise for autosave revert.

### Legacy alias

Existing `{ success, error?: string }` continues to work during migration:

- Classic submit: treat `error` as `formError`.
- Settings field actions: treat `error` as `toastError`.

New or touched actions in migration waves should emit the explicit channels.

### Zod → `fieldErrors` sketch

```ts
if (!parsed.success) {
  const flat = parsed.error.flatten();
  const fieldErrors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat.fieldErrors)) {
    const message = messages?.[0];
    if (message) fieldErrors[key] = message;
  }
  const formError = flat.formErrors[0];
  return {
    success: false,
    ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    ...(formError ? { formError } : {}),
  };
}
```

---

## 4. Migration posture for `useActionState` forms

**Replace on migrate — no permanent hybrid.**

| Surface state | Pattern |
| --- | --- |
| Migrated classic submit | RHF `useForm` + `handleSubmit` → `await action(values)` → map `FormActionResult`. Pending via `form.formState.isSubmitting` / `useTransition` as needed. |
| Same form, post-migrate | **No** `useActionState` alongside RHF. |
| Unmigrated | May keep `useActionState` + FormData until its wave. |
| Settings autosave | Stays per-field Server Actions; RHF wiring owned by JES-67; results must be toast-compatible with this shape. |

**Pilot recommendation (JES-70):** migrate `CreateTeamForm` first (small, DS inputs, clear Zod in `create-team.ts`). Optionally align `CreateTeamDialog` (today: `form action` + `useTransition`, no field errors) in the same classic-submit wave.

---

## 5. Answers to the ticket questions (gist)

1. **Schema ownership** — feature-local by default; shared packages only for existing domain Zod or cross-app identical contracts; never DS-hosted feature schemas.
2. **Client vs server** — same schema module; resolver on client; mandatory `safeParse` on the action; no duplicates.
3. **Result shape** — `FormActionResult` with `fieldErrors` / `formError` / `toastError` (+ legacy `error` alias).
4. **Migration** — replace `useActionState` when a form moves to RHF; no long-lived hybrid on one surface.

---

## 6. No-goals

- Shipping production RHF migrations or mass-updating action signatures in JES-68.
- Deciding Form*/Field* primitive home (JES-66).
- Autosave `useForm` granularity / save timing (JES-67).
- Player focus-step error chrome details (SPEC / later tickets).
- ESLint / CI guards (post-SPEC fog on JES-63).

---

## Sources

- `apps/app/features/teams/components/create-team-form.tsx`
- `apps/app/features/teams/actions/create-team.ts`
- `apps/app/features/settings/components/create-team-dialog.tsx`
- `apps/app/features/settings/actions/settings-field-actions.ts` (`SettingsFieldResult`)
- `apps/app/features/sessions/actions/session-actions.ts` (`ActionResult`)
- `packages/database/age-band-policy.ts` (shared domain Zod precedent)
- `.scratch/form-system-wayfinder/research/form-surfaces-and-interaction-modes.md` (JES-64)
- `.scratch/form-system-wayfinder/research/ds-fields-and-rhf-form-gap.md` (JES-65)
- `.scratch/jes-58-autosave-contract/resolution.md` (toast-on-failure for settings)
