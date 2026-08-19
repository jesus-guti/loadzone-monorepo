# Team Wellness CSV export

Issue: [JES-108](https://linear.app/jesus-guti-workspace/issue/JES-108/team-wellness-csv-export-replace-editar-wellness-with-exportar)

Domain: `CONTEXT.md`. CSV dialect: [ADR 0002](../../docs/adr/0002-team-wellness-csv-excel-es.md).

## Problem Statement

Staff already collect **DailyEntry** wellness in LoadZone, but many coaches live in Excel or other tools. Today Team Wellness only offers **Editar wellness** (a jump to settings). There is no way to take the Team’s check-in history out of the product. Editing forms does not belong on the monitoring screen.

## Solution

On Team Wellness, **Exportar** replaces **Editar wellness**. Staff open a dialog, set a date range, and download a CSV of **DailyEntry** rows for the **active Team**. Form editing stays under Configuración → Wellness.

## User Stories

1. As staff on Team Wellness, I want an **Exportar** control in the header, so that I can take wellness data out of LoadZone.
2. As staff on Team Wellness, I do not want **Editar wellness** in that header, so that monitoring is not mixed with form-editing.
3. As staff, I want to edit wellness forms and limits from Configuración → Wellness (including the formularios deep link), so that settings still work as today.
4. As staff, I want **Exportar** to open a dialog, so that I can confirm scope before a download.
5. As staff on a Team with an active **Season**, I want start and end dates prefilled to that Season’s bounds, so that a typical export is one click after confirm.
6. As staff on a Team with no usable Season, I want the date fields empty and confirm disabled until both dates are set, so that we do not invent a silent default window.
7. As staff, I want to change the start and end dates, so that I can export a slice that is not the whole Season.
8. As staff, I want confirm disabled when start is after end, so that I do not download a nonsense range.
9. As staff, I want the download to include only the **active Team**, so that I do not leak another squad’s **DailyEntry**.
10. As staff, I want one CSV row per **DailyEntry** in range, so that empty days do not clutter Excel.
11. As staff, I want PRE-session and POST-session on that same row, so that one calendar day stays one Excel row.
12. As staff, I want **Player** identity as the display name only, so that the sheet is readable in the club and never contains the public player token.
13. As staff, I accept two Players with the same name looking alike in the file, so that v1 stays simple.
14. As staff, I want archived Players’ past **DailyEntry** included, so that archive is not deletion of Team history.
15. As staff, I want a **Temporada** column (Season name), so that a range that crosses Seasons is still interpretable.
16. As staff, I want the date filter to be the calendar range on the Team, not a hidden “active Season only” second filter, so that widening dates actually adds rows.
17. As staff, I want **PlayerDailyStats** (loads, ACWR) omitted, so that the file is check-in data, not staff load analytics.
18. As staff, I want Injury and Pain Alert rows omitted, so that this export is not a medical log.
19. As staff, I want FormSubmission internals omitted, so that Excel does not contain form engine payloads.
20. As staff, I want Spanish column headers, so that the sheet matches the rest of the staff product.
21. As staff, I want the file to open in Spanish Excel via double-click (UTF-8 BOM, `;`), so that I do not fight import wizards.
22. As staff, I want the filename `wellness-{team-name}-{start}-{end}.csv`, so that successive exports do not silently overwrite in Downloads without a date hint.
23. As staff, I want a header-only CSV when the range has no **DailyEntry**, so that the download never fails silently.
24. As staff without access to that Team Wellness, I must not obtain the file, so that export is not a back door.
25. As staff, I want no new role just for export, so that anyone who can open Team Wellness can export.
26. As staff, I do not want a Preseason filter, so that we do not pretend Preseason is a domain object.
27. As staff, I do not want a Club-wide or multi-Team CSV in v1, so that scope stays the active Team.
28. As staff, I do not want email, .xlsx, or Sheets sync in v1, so that the first slice is a dialog + download.
29. As a future agent, I want a regression test on export scope (active Team + date range, archived Players included, tokens absent) outside UI internals, so that the contract does not rot.

## Implementation Decisions

- One Feature: header chrome + dialog + CSV. No extra Linear children.
- Replace the Team Wellness header link **Editar wellness** with **Exportar**. Settings route and `#formularios` stay.
- Dialog: start date, end date; confirm downloads. Default range = active **Season** `startDate`/`endDate` when that Season exists; otherwise dates empty and confirm off until both are set. No range length cap.
- Scope query: **DailyEntry** whose **Player** belongs to the active **Team** (including `isArchived`) and whose civil `date` is inside the inclusive range. Do not restrict to `seasonId` of the active Season. Include Season **name** as a column.
- Row grain: existing **DailyEntry** only (sparse). One row; PRE/POST are columns on that row (`preFilledAt` / `postFilledAt` plus the metric fields already on the record).
- Columns (Spanish headers): Jugador, Fecha, Temporada, Recuperación, Energía, Molestias, Horas de sueño, Calidad de sueño, RPE, Duración, Alerta fisio, PRE rellenado, POST rellenado. Empty cells for null metrics/timestamps. Never player public tokens, never FormSubmission payload, never PlayerDailyStats, never Injury/Pain Alert.
- Identity: Player display name as shown on Wellness. No dorsal, no internal id in v1.
- CSV dialect per ADR 0002: UTF-8 with BOM, `;` separator, quoted fields when needed.
- Filename: `wellness-{team-name}-{from}-{to}.csv` with civil dates. Sanitize the team name for filesystem safety without inventing a new product name.
- Authorization: same gate as opening Team Wellness (staff session + active Team in membership). No new role.
- Delivery: browser download from a staff server action (or equivalent App Router mutation), not email.
- No schema change. Reuse **DailyEntry** / **Player** / **Season**. Ignore `Season.preSeasonEnd` in the UI.
- Keep CSV building in the staff app wellness feature (not `@repo/design-system`). Prefer one pure formatter plus one scoped loader so tests do not mount the page.

## Testing Decisions

- Good tests assert observable export behavior: which rows, which columns, dialect, and authorization — not dialog component internals.
- **Seam (one):** a staff-app function (or pair: load rows for Team+range, format those rows to CSV string) that is callable without rendering Team Wellness. Tests feed fixture **DailyEntry**-shaped rows (and/or a thin loader with a fake store) and assert:
  - only the requested Team
  - inclusive civil date range
  - archived Players included; other Teams excluded
  - sparse rows (no invented empty days)
  - one row with both PRE and POST columns
  - no token / FormSubmission payload / PlayerDailyStats
  - Spanish headers; BOM; `;`
  - header-only file when zero rows
- Prior art: Vitest contract tests next to other staff wellness tests (`team-wellness-workspace-utils`, injury/pain-alert contracts) — pure modules, not E2E as the primary seam.
- Optional thin test that the header shows Exportar and not Editar wellness if cheap; do not make Playwright the source of truth for CSV scope.

## Out of Scope

- Native Excel (.xlsx), Google Sheets, email, scheduled delivery
- Club-wide or multi-Team export
- Preseason filter or product language around `preSeasonEnd`
- Export from `apps/player`
- Injury / Pain Alert export
- Changing wellness form definitions or limits
- New staff roles
- PlayerDailyStats / load ratios
- Re-import of the CSV into LoadZone

## Further Notes

- Glossary: **DailyEntry** is Team history after archive; PRE/POST are fill moments on one record; **Preseason** is not an entity.
- Homonym Players are accepted in v1.
- Grill confirmed this remains a single ticket.
