# JES-60 — Settings deep links & create-team entry inventory (resolution)

Issue: [Inventory settings deep links and create-team entry points](https://linear.app/jesus-guti-workspace/issue/JES-60/inventory-settings-deep-links-and-create-team-entry-points)  
Parent partition: JES-56 · Prototype paths (observability only): `/prototype/settings/*` (JES-57)  
**No product code changes in this ticket** — facts for routing work after decisions land.

## Intended production targets (JES-56)

| Route | Path |
|---|---|
| Default | `/settings` → redirect **Equipo** |
| Equipo | `/settings/equipo` |
| Wellness | `/settings/wellness` |
| Políticas | `/settings/politicas` |
| Club | `/settings/club` |
| Cuenta | `/settings/cuenta` |

Forms section anchor (JES-59 assume): `#formularios` (legacy `#wellness-forms`).

## Inventory: current → intended

### In-app links / navigation

| Current entry | File(s) | Intended target |
|---|---|---|
| Ops nav item `href: "/settings"` | `apps/app/lib/admin-navigation.ts` | `/settings` (redirect Equipo) **or** direct `/settings/equipo`; match helper must cover `/settings/**` |
| Wellness CTA “Editar wellness” → `/settings#wellness-forms` | `apps/app/app/(authenticated)/wellness/page.tsx` | `/settings/wellness#formularios` (accept `#wellness-forms` alias during migrate if cheap) |
| Header team switcher “create team” → `/settings?createTeam=1` | `apps/app/components/layouts/active-team-switcher.tsx` | **Delete** settings query entry; create-team lives in **team switcher** only (JES-56). Retarget to switcher affordance / in-switcher flow — not a settings route |

### Query flags

| Current | Intended |
|---|---|
| `/settings?createTeam=1` (and settings page branch that shows create-team card when `canCreateTeam \|\| createTeam`) | **Delete** from settings home / Equipo. Do not recreate Superficie-style create-team card on new routes |

### Redirects

| Current | File(s) | Intended |
|---|---|---|
| `redirect("/settings")` after create/update team settings | `features/settings/actions/team-settings.ts` | Route-specific: Equipo mutations → `/settings/equipo`; branding → `/settings/club`; etc. |
| `redirect("/settings")` after club age policy | `features/settings/actions/club-age-band-policy.ts` | `/settings/club` |

### `revalidatePath("/settings")`

| Call site | File | Intended |
|---|---|---|
| Team settings mutations (several) | `features/settings/actions/team-settings.ts` | `revalidatePath` for the owning route(s): `/settings/equipo`, `/settings/wellness`, `/settings/politicas`, `/settings/club` as applicable; keep broad `/settings` only if layout data still keys off it |
| Club age policy | `features/settings/actions/club-age-band-policy.ts` | `/settings/club` (+ parent `/settings` if needed) |
| Profile update | `apps/app/actions/profile-actions.ts` | `/settings/cuenta` (and any layout that shows avatar/name) |

### Settings page surfaces to remove / move

| Current on `/settings` | Intended |
|---|---|
| Monolithic team form (category, timezone, reminders, forms, thresholds, age bands, reminder consent) + Guardar | Split per JES-56/59 routes; autosave (JES-58) |
| `ClubBrandingCard` | Club route |
| Club age policy form | Club route |
| **Superficie secundaria** card (Jugadores / Temporadas / Lesiones) | **Delete** — do not recreate (JES-56) |
| **Crear equipo** card (`createTeamFromSettings`) | **Delete** from settings; switcher-owned |

### Docs / scripts / scratch (list only — do not rewrite here)

| Mention | Notes |
|---|---|
| `packages/database/scripts/seed-age-band-qa.ts` → `${APP_BASE_URL}/settings` | Update when QA script next touched → Equipo or Políticas as appropriate |
| `packages/database/scripts/bootstrap.ts` console “onboarding/settings” | Docs-only; optional later |
| `.scratch/jes-44-audit-surfaces/AUDIT.md`, `.scratch/jes-45-reminder-consent/map.md`, design-direction issues | Historical; no rewrite in this ticket |
| Prototype `/prototype/settings/*` | Throwaway; **not** a production retarget. Production implementers use `/settings/*` |

### Tests

| Current | Notes |
|---|---|
| `apps/app/__tests__/age-band-settings-actions.test.ts` | Imports settings actions; update redirects/revalidate expectations when actions change — not in this ticket |

## Summary counts

- **Retarget:** wellness deep link, admin nav match, redirects, revalidatePath call sites, profile revalidate.
- **Delete / migrate away from settings:** `createTeam=1`, create-team card, Superficie secundaria.
- **Docs/scripts:** listed, deferred rewrite.

## No-goals

- Changing any link, redirect, or `revalidatePath` in product code in this ticket.
- Designing new create-team UX beyond noting switcher ownership.
- Player-app routes.
