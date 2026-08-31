# 01 — Separate Team Wellness Tarjetas and Lista roster views

**Status:** in-progress
**Labels:** Improvement · plan:direct · risk:low
**Blocked by:** None — can start immediately

`plan:direct` · `risk:low` · area: apps/app/wellness

## What Jesús asked

> Vamos a cambiar en la interfaz de wellness los tabs "Tarjetas" y "Burbujas" a "Tarjetas" y "Lista". Vamos a quitar la sección de "Burbujas" que hay y, básicamente, se van a mostrar los datos en "Tarjetas", "Lista" o en una tabla que es como se está mostrando ahora. De cierrarse bien que el formato lista se ve en versión móvil y no se ocultan los datos, ya que antes se ocultaban y puede crear confusión.

## What I understand

Staff Team Wellness (`/wellness`) keeps the Tarjetas / Lista switcher at the top of `TeamWellnessWorkspace`. Tarjetas stays the player-card grid. Lista replaces Burbujas: no filterable avatar bubbles. Lista shows the existing comparison table from `md` up, and a metric list on smaller viewports so Recuperación / Energía / Agujetas / Sueño / Calidad / RPE / Riesgo stay visible (the table used to hide those columns below `md`).

**Assumptions taken**
- Shared summary (formularios pendientes, medias, alertas) stays visible in **both** modes.
- Bubble-based roster filtering is removed with the bubbles section.
- Switcher stays at the top of `TeamWellnessWorkspace`, not inside `Header`.
- Default remains Tarjetas.
- Reuse shared `Tabs`.

## What to build

On Team Wellness, staff pick **Tarjetas** or **Lista**. Tarjetas: summary + player cards. Lista: summary + table (desktop) or full-metric list (mobile). Never mix cards with table/list. Never show filterable bubbles.

## No-goals

- Do not restyle player cards (JES-88 cromo) or wellness visual scales (JES-76).
- Do not change pending-bubble, average, or alert scoring (JES-74).
- Do not put the switcher in the sticky page Header next to date / CSV.
- Do not change `@repo/design-system` Tabs.
- Do not persist view mode across visits (local `useState` is enough).

## Acceptance criteria

- [ ] On `/wellness` with an operational baseline, the Tarjetas / Lista control is the first control in the workspace (above the overview).
- [ ] With **Tarjetas** selected, the comparison table and list are not in the DOM; the player-card grid is; the summary is still visible.
- [ ] With **Lista** selected, the player-card grid is not in the DOM; desktop shows the comparison table; mobile shows the comparison list with all metrics (not only name + risk).
- [ ] Switching modes never shows table/list and cards at the same time.
- [ ] Filterable bubbles are gone.
- [ ] Date filter, CSV export, and page Header layout are unchanged.
- [ ] Empty baseline states (no Season / no Players) still skip the workspace entirely.
