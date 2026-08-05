# JES-61 — Last-operational-route memory for Volver (resolution)

Issue: [Decide last-operational-route memory for Volver](https://linear.app/jesus-guti-workspace/issue/JES-61/decide-last-operational-route-memory-for-volver)  
Parent lock (JES-56): “Volver a la app” → **last operational route**, fallback **Inicio**.  
Prototype alignment (JES-57 tip `c402dec`): **memory + destination label** (e.g. “Volver a Wellness”) — **not** “no memory / always Inicio”.

## Contract

### 1. Storage

**`sessionStorage`**, staff admin app (`apps/app`) only.

- Suggested key: `loadzone_settings_volver` (distinct from prototype key `loadzone_prototype_settings_volver`).
- Value shape: `{ href: string; label: string }` (same idea as prototype `VolverMemory`).
- Tab-local; survives in-tab refresh; clears when the tab closes.
- No cookie / no PII beyond path+label already visible in the URL chrome.
- **Revert later:** `localStorage` if cross-session memory is desired.

### 2. What counts as an “operational” route?

Any authenticated `apps/app` route that is **not**:

- `/settings` or `/settings/**`
- `/prototype/**` (throwaways)
- Auth / sign-in / sign-out surfaces
- API-only / server-action-only paths (nothing the user navigates as a page)

Operational examples: Inicio `/`, Wellness, Sesiones, roster, etc. (whatever the live ops IA exposes).

### 3. When is it written?

**On every operational navigation** (authenticated layout effect and/or client nav listener) — not only when entering settings.

Reason: deep ops → settings → Volver must restore the last ops page, not a stale entry-only snapshot.

When entering settings, Volver **reads** memory and renders **`Volver a {label}`** linking to `href`. If missing/invalid → fallback Inicio `/` with label **Inicio** (or equivalent Spanish product copy).

### 4. Cross-tab / refresh

| Event | Behavior |
|---|---|
| Refresh in same tab | Memory kept (`sessionStorage`) |
| New tab | Independent empty memory → Volver falls back to Inicio until that tab navigates ops |
| Tab close | Memory cleared |
| Cross-tab sync | **None** for v1 |

## Prototype → production

| Prototype (JES-57) | Production (this contract) |
|---|---|
| Seeds default Wellness in `sessionStorage` for demo | Real writes on ops navigation |
| Label “Volver a {label}” | Same UX law |
| Key `loadzone_prototype_settings_volver` | Key `loadzone_settings_volver` |
| May hardcode demo seed | No demo seed required if user arrived from ops |

## No-goals

- Implementing Volver wiring in production in this ticket (belongs with shell implement).
- Cross-device or server-side last-route.
- Changing the standing meaning of Volver (already locked on JES-56).
