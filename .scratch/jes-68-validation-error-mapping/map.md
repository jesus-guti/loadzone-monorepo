# JES-68 — Decide validation ownership and action error mapping

Planning map for [Decide validation ownership and action error mapping](https://linear.app/jesus-guti-workspace/issue/JES-68/decide-validation-ownership-and-action-error-mapping).  
Parent map: [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls) (JES-63).  
Blocked by: [Decide Form primitive home and RHF wiring shape](https://linear.app/jesus-guti-workspace/issue/JES-66/decide-form-primitive-home-and-rhf-wiring-shape) (JES-66; AFK parallel — this ticket resolved without waiting).  
Blocks: [Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots) (JES-70), [Synthesize Form System SPEC](https://linear.app/jesus-guti-workspace/issue/JES-71/synthesize-form-system-spec) (JES-71).  
Route: `plan:afk` · Risk: `medium` · Label: `wayfinder:grilling`.  
Consumer summary: [`.scratch/form-system-wayfinder/resolutions/validation-ownership-and-action-error-mapping.md`](../form-system-wayfinder/resolutions/validation-ownership-and-action-error-mapping.md).  
**Do not implement** production form migrations in this ticket.

## Destination

Lock **where Zod schemas live**, how **client resolvers relate to Server Action re-validation**, the **canonical action result shape** for field / form / toast failures, and the **migration posture** for existing `useActionState` forms — so JES-70 pilots and JES-71 SPEC can cite one contract.

## Notes

- **Standing preferences (JES-63):** Server Actions remain the mutation boundary; Zod + `@hookform/resolvers` on the client; RHF is the product-form standard; no new `useState`-driven form trees.
- **Ground truth today:** schemas live next to actions (e.g. `createTeamSchema` in `create-team.ts`) or wrap package domain schemas (`age-band-policy-form.ts` → `@repo/database/age-band-policy`). Action results are almost always `{ success: boolean; error?: string }` with Zod collapsing to a single `error` string. No RHF / no `fieldErrors` yet ([JES-64](https://linear.app/jesus-guti-workspace/issue/JES-64/catalog-form-surfaces-and-interaction-modes), [JES-65](https://linear.app/jesus-guti-workspace/issue/JES-65/inventory-ds-fields-and-rhf-form-gap)).
- **Hard cases:** classic submit `CreateTeamForm` / `useActionState`; settings field actions (`SettingsFieldResult`); package domain Zod already in `@repo/database`.
- **AFK override:** auto/assume apply immediately; hitl recommendations accepted without waiting (hitl→accepted). Max 3 hitl.
- **Language:** this map and resolution in English; product error copy stays Spanish.

## Decisions so far

### Auto

1. **[auto] Schema ownership defaults to feature-local.** One Zod module per form (or tightly related form family) under the owning feature — e.g. `features/teams/schemas/create-team.schema.ts` or colocated next to the action — not inside `@repo/design-system`. Matches loadzone-core: keep a contract local until ≥2 real boundaries consume it.
2. **[auto] Shared packages host domain Zod, not UI form kits.** Existing `@repo/database` schemas (`age-band-policy`, `wellness-limits`, `reminder-consent`, …) stay the source of domain invariants. Feature form schemas **import / refine / pick** those; they do not re-author conflicting rules. No new `@repo/forms` package in this map.
3. **[auto] Promote a form schema to a shared package only when** (a) the invariant already belongs to that package, or (b) the **identical** schema is consumed across ≥2 of `{apps/app, apps/player, apps/web}` (or a shared non-UI consumer). Use-count of similar-looking fields alone is not enough (ADR 0001 spirit).
4. **[auto] Server Actions always re-validate.** Client resolver is UX-only; the action `safeParse`s the shared schema before mutating. Never trust client-only validation.
5. **[auto] Prefer typed action inputs for RHF forms.** Migrated actions accept `z.infer<typeof schema>` (or a narrow DTO). FormData adapters may remain for unmigrated `useActionState` surfaces until their wave.
6. **[auto] Keep `success: boolean` as the top-level flag** for continuity with `SettingsFieldResult` / existing actions; extend with optional error channels rather than inventing a parallel `ok`/`kind` union for v1 of the SPEC.

### Assume

7. **[assume] Colocate schema modules beside the feature form+action pair** (`*.schema.ts`), export the schema + `z.infer` type; actions and client forms both import that module. Reason: clearer than burying schemas only inside `"use server"` files (which client components cannot import). **Revert:** keep schema inside the action file and duplicate a client-safe mirror only if a server-only import boundary forces it — prefer extracting instead.
8. **[assume] Settings field actions stay `{ success, toastError? }` compatible** with this contract (`error` may alias `toastError` during migration). Per-field autosave feedback remains toast-first (JES-58); do not sticky field banners on settings rows unless JES-67 later requires it. **Revert:** require full `fieldErrors` on every settings field action if pilots show inline errors are needed.

### Human (AFK → accepted)

9. **[hitl→accepted] One shared Zod schema module; no divergent client/server copies.** Client `zodResolver(schema)` and Server Action `schema.safeParse(...)` import the **same** module. Duplicating Zod object literals is rejected. Reason: standing preference + single source of truth; divergence is the failure mode already latent in HTML `required`/`minLength` vs action schemas (CreateTeamForm).
10. **[hitl→accepted] Canonical `FormActionResult` shape** (see resolution for TypeScript sketch):
    - `success: true` — done (optional payload / redirect remains action-local).
    - `success: false` + `fieldErrors?: Record<string, string>` — map to RHF `setError(name, { message })` (one message per field path).
    - `success: false` + `formError?: string` — map to RHF root / form-level message (inline banner).
    - `success: false` + `toastError?: string` — Spanish toast only; do not sticky on fields.
    - Zod server failures → prefer `fieldErrors` (from `flatten()` / issue paths); form-level refine without a field path → `formError`.
    - Authz / not-found / unexpected catch → `toastError` (classic submit may also set `formError` when an inline banner is clearer — pick one channel, not both with different copy).
    - Legacy `{ success, error }` is a migration alias: treat `error` as `formError` for classic submit and as `toastError` for settings autosave until the action is updated.
11. **[hitl→accepted] Migration posture = replace, not permanent hybrid.** Migrated classic-submit forms use RHF `handleSubmit` → call the Server Action → map `FormActionResult` into RHF / toast. Do **not** keep `useActionState` on the same form once migrated. Unmigrated forms may keep `useActionState` until their wave. Pilot target: `CreateTeamForm` (and optionally `CreateTeamDialog`) under JES-70. Autosave coexistence is owned by JES-67; this ticket only requires compatible result mapping.

## Not yet specified

- Exact helper name/location for `mapActionResultToForm(result, form)` (app-local vs DS) — depends on JES-66 Form primitive home.
- Whether `fieldErrors` values are `string` (v1) or `string[]` (multi-message) — v1 locks single string; escalate only if a form needs stacked messages.
- Player check-in multi-step: whether root errors surface in focus-step chrome or only on final submit (JES-71 / player tickets).

## Out of scope

- Implementing production RHF migrations or changing live Server Action signatures in this PR.
- Redesigning domain APIs beyond the error-shape contract.
- ESLint guards against native inputs or duplicate Zod (post-SPEC).
- Choosing Form*/Field* DS wiring (JES-66).
- Autosave timing / `useForm` granularity (JES-67).

## Decision ledger

| # | Decision | Level |
|---|---|---|
| 1–6 | Feature-local schemas; package domain Zod; always re-validate; typed inputs; keep `success` | `auto` |
| 7 | `*.schema.ts` colocation importable by client + action | `assume` |
| 8 | Settings field actions toast-first alias | `assume` |
| 9 | Single shared Zod module (no duplicate) | `hitl→accepted` |
| 10 | Canonical `FormActionResult` channels | `hitl→accepted` |
| 11 | Replace `useActionState` on migrate; no permanent hybrid | `hitl→accepted` |

**HITL count: 3** (at cap). **Resolved** under AFK — publish resolution for JES-70 / JES-71.
