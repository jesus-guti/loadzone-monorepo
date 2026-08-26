# 01 — Separate Team Wellness Tarjetas and Burbujas roster views

**Status:** ready-for-agent
**Labels:** Improvement · plan:direct · risk:low
**Blocked by:** None — can start immediately

`plan:direct` · `risk:low` · area: apps/app/wellness

## What Jesús asked

> En la pestaña de wellness tengo dos tabs. Vamos a ponerlos en la zona de arriba para diferenciar bien entre lo que es burbujas y tarjetas. Si hay burbujas, mostramos la tabla. Si hay tarjetas, mostramos solo las tarjetas. No mezclar las dos.

## What I understand

Staff Team Wellness (`/wellness`) currently renders `TeamWellnessOverview` (pending bubbles, averages, alerts, **and** the comparison table) and then a Tarjetas / Burbujas switcher below it. The table is therefore always mixed with whichever roster view is selected. Grill confirmed: move the switcher **above** the overview (workspace top, not the sticky page Header with date/CSV), make the two roster views exclusive, and keep the team summary in both modes.

**Assumptions taken**
- Shared summary (formularios pendientes, medias, alertas) stays visible in **both** modes — grill: keep-summary.
- Burbujas = existing filterable player bubbles + comparison table; no card grid.
- Tarjetas = existing `TeamWellnessPlayerCard` grid; no comparison table; no filterable bubbles.
- Switcher lives at the top of `TeamWellnessWorkspace`, not inside `Header` (date filter and CSV export stay in the header).
- Default remains Tarjetas. Filter selection in Burbujas still filters the table and the summary, as today.
- Reuse shared `Tabs`; do not restyle the primitive (JES-73 already landed that chrome).

## What to build

On Team Wellness, staff pick **Tarjetas** or **Burbujas** first. Tarjetas shows the team summary plus the player-card grid only. Burbujas shows the team summary plus filterable bubbles and the comparison table only. The two roster representations never appear together.

## No-goals

- Do not restyle player cards (JES-88 cromo) or wellness visual scales (JES-76).
- Do not change pending-bubble, average, or alert scoring (JES-74).
- Do not put the switcher in the sticky page Header next to date / CSV.
- Do not change `@repo/design-system` Tabs.
- Do not persist view mode across visits (local `useState` is enough).
- Do not add a third view or merge bubbles into cards.

## Acceptance criteria

- [ ] On `/wellness` with an operational baseline, the Tarjetas / Burbujas control is the first control in the workspace (above the overview), not below it.
- [ ] With **Tarjetas** selected, the comparison table is not in the DOM; the player-card grid is; the summary (pendientes / medias / alertas) is still visible.
- [ ] With **Burbujas** selected, the player-card grid is not in the DOM; the comparison table and filterable bubbles are; the summary is still visible.
- [ ] Switching modes never shows table and cards at the same time.
- [ ] Date filter, CSV export, and page Header layout are unchanged.
- [ ] Empty baseline states (no Season / no Players) still skip the workspace entirely.

## Blocked by

- None — can start immediately
