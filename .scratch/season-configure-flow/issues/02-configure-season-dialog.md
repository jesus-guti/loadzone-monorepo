# 02 — Configure Season dialog with auto-filled preseason and official ranges

**Status:** ready-for-agent
**Labels:** Improvement · plan:auto · risk:low
**Blocked by:** None — can start immediately

`plan:auto` · `risk:low` · area: apps/app/seasons

## What Jesús asked

> mejorar dialog crear temporada
>
> (Spec: modal «Configurar Temporada», año base, pretemporada 1 jul–15 ago, temporada oficial 16 ago–31 may año+1, recálculo al cambiar año, encadenamiento, ±1 sem, barra de ciclo, Cancelar / Guardar.)

## What I understand

Replace the current create-Season dialog (manual name + start / end / optional `preSeasonEnd` DatePickers) with a fast «Configurar Temporada» flow: pick a start year, inject standard amateur-football ranges, chain official start to the day after preseason end, and save onto the existing **Season** fields. Grill: this is a sibling of the mobile header bug, not the same ticket; `/seasons/new` should reuse the same behaviour so both entry points stay consistent (assumption below).

**Assumptions taken**
- Persist as today: `name` (generated label e.g. `2026/2027` or `Temporada 2026/2027`), `startDate` = preseason start, `preSeasonEnd` = preseason end, `endDate` = official season end. Official start is derived (`preSeasonEnd` + 1 day), not a new column.
- Default start year = current civil year when the modal opens.
- Default preseason: 1 July `[year]`–15 August `[year]`. Default official: 16 August `[year]`–31 May `[year+1]`.
- ±1 week on preseason adjusts **preseason end** (and thus official start). ±1 week on official season adjusts **endDate** only. Start of preseason stays 1 July unless the user edits the start date picker.
- Overlap / inverted ranges are blocked in UI and in `createSeasonSchema`.
- Spanish product copy. Semantic tokens only (no hardcoded blue/purple; use `brand` / secondary surface tokens for the two period chips).
- Shared form logic for `CreateSeasonDialog` and `/seasons/new` (`CreateSeasonForm`) so mobile-from-page and shell dialog do not diverge.

**Open questions** (planner may assume)
- Exact chip colors → recommendation: period labels via existing `Badge` / semantic `brand` vs secondary text, not new hues.
- Timeline bar → recommendation: decorative month span of `startDate`→`endDate`; not a second source of truth for dates.

## What to build

Staff open Configurar Temporada (dialog title). They pick **año de inicio**; the cycle label updates (`Temporada YYYY/YYYY+1`) and both period dates refill. Preseason block: start/end pickers plus duration (`-1 sem` / N semanas / `+1 sem`). Official block: start locked/synced to day after preseason end; end picker; same duration control for official length. Footer: Cancelar and Guardar Temporada (existing create + activate behaviour in the shell dialog). Invalid overlapping ranges cannot submit.

## No-goals

- Do not add a new Season period entity or migrate historical Seasons.
- Do not change how DailyEntry / stats are scoped to Season.
- Do not restyle `@repo/design-system` Dialog.
- Do not hide the mobile Season switcher (sibling `01`).
- Do not require the user to type the Season name if the cycle label is enough.

## Acceptance criteria

- [ ] Opening the modal (current year) prefills preseason 1 Jul–15 Aug and official 16 Aug–31 May next year without typing dates.
- [ ] Changing the base year instantly rewrites all four dates and the cycle label.
- [ ] Official start always equals preseason end + 1 day after duration or date edits; overlapping or inverted ranges cannot save.
- [ ] ±1 week on preseason moves preseason end (and official start); ±1 week on official moves `endDate`.
- [ ] Cancelar closes without persist; Guardar Temporada creates the Season (shell: activates it) with generated name and the three persisted dates.
- [ ] `/seasons/new` uses the same defaults and chaining as the dialog.
- [ ] Copy is Spanish; chrome uses semantic tokens.

## Blocked by

- None — can start immediately
