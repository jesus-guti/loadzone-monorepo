# Player detail — two-tab layout (staff)

## Problem Statement

The staff Player detail page stacks seven unrelated blocks in one long scroll (profile badges, open/closed injuries, excused absences, injury history map, summary stats, wellness charts, daily history table). Staff cannot scan or jump between wellness and injury work without scrolling through everything. The page feels chaotic and hard to use day to day.

## Solution

Reorganize the staff Player detail page into **two tabs** — **Wellness** and **Lesiones** — with the profile strip always visible above the tabs. Keep the same server-side data load; this is a UI organisation change. On the Lesiones tab, use a flat, card-less layout: body map on the left (desktop) / top (mobile), lists and history on the right / below, separated by whitespace and hairline dividers rather than cards.

## User Stories

1. As staff, I want Player detail split into Wellness and Lesiones tabs, so that I only see the domain I am working on.
2. As staff, I want the Player profile strip (avatar, status, pre/post today, physio alert, streak) always visible above the tabs, so that identity and today-status stay in context while I switch tabs.
3. As staff, I want the active tab reflected in the URL (`?tab=`), so that refresh and share keep the same tab.
4. As staff, I want Wellness to show summary metrics (registros, último RPE, último ACWR), charts, daily history table, and excused absences, so that load/recovery work lives in one place.
5. As staff, I want Lesiones to show open injuries, closed injuries, the history body map, and register/edit/close/reopen actions, so that injury work lives in one place.
6. As staff on desktop, I want Lesiones as a two-column layout (anatomy left, lists/actions right) without packing sections into cards, so that the page feels calm and scannable.
7. As staff on mobile, I want Lesiones as a continuous vertical flow (body map → open → closed → history), so that the layout still works on a phone.
8. As staff, I want Frente/Espalda as a flat segmented control on or next to the body image, so that view switching is tied to the anatomy, not to year filters.
9. As staff, I want Total / year filters only on the Historial section header, so that time filtering stays next to the list it affects.
10. As staff on desktop, I want **Registrar lesión** aligned with the Lesiones tab chrome (status line / title row), so that the primary CTA is not floating mid-page.
11. As staff on mobile, I want **Registrar lesión** as a reachable primary action (FAB or end-of-flow / title-adjacent), so that I can register without hunting.
12. As staff, I want section titles on Lesiones simplified (e.g. Abiertas / Cerradas / Historial, no redundant “Lesiones” heading under the Lesiones tab), so that hierarchy is clearer.
13. As staff, I want list rows separated by hairline dividers and generous vertical whitespace between sections, so that I can scan without card chrome.
14. As staff, I want existing injury mutations (create, edit, close, reopen) and excused-absence actions to keep working after the reorganisation, so that no behaviour regresses.
15. As staff, I want Copy token / header chrome unchanged, so that check-in link sharing stays where it is.
16. As a future agent, I want the throwaway prototype route removed once the real page ships this layout, so that dead prototype code does not linger.

## Implementation Decisions

- **Tab model:** Exactly two tabs — `Wellness` and `Lesiones` (variant C from the prototype). Three-tab Resumen/Lesiones/Historial is rejected.
- **Profile chrome:** Avatar + status + pre/post today + physio alert + streak stay **outside** the tabs (sticky or top-of-page), always visible.
- **URL sync:** Active tab via `?tab=` (values such as `wellness` | `lesiones`). Default `wellness` when missing/invalid. Shareable and refresh-safe. Optional small helper later; not required if inlined once.
- **Data fetching:** Unchanged. Page still loads all Player / Injury / DailyEntry / PlayerDailyStats / ExcusedAbsence data in the server page and passes props. No per-tab Suspense/lazy fetch in this slice.
- **Design system:** Use existing `@repo/design-system` `Tabs` (`line` list variant preferred). Semantic tokens only; no new card wrappers for Lesiones sections.
- **Lesiones layout:** Desktop ≥ `lg`: two columns — anatomy column (~fixed max width, sticky while scrolling lists) + data column. Mobile: single column continuous flow.
- **Filters:** Frente/Espalda overlaid or adjacent to the body map. Year/Total only on Historial header. Region chip/filter stays lightweight text, not a heavy chip box if avoidable.
- **CTA placement:** Desktop — primary **Registrar lesión** on the right of the Lesiones status/title row. Mobile — FAB or equivalent primary placement; must not collide with app chrome.
- **Flat hierarchy:** Prefer whitespace (`~32–48px` between major sections) and `1px` low-opacity horizontal rules over `Card` shells for Lesiones lists and for Wellness summary metrics (flat `<dl>`-style stats OK).
- **Reuse behaviour:** Keep existing injury panel / history map / form / close dialog behaviour; recompose layout. Prefer folding prototype decisions into production components rather than leaving a parallel prototype tree.
- **Prototype source of truth:** `.scratch/player-detail-tabs/` (historical). Throwaway route `players/[id]/prototype-tabs` was deleted after fold-in (JES-86).
- **Copy:** Product UI Spanish (tab labels Wellness / Lesiones already used in prototype; keep Spanish for injury CTAs and section titles).
- **Barrel imports:** Client shells must not import feature barrels that re-export server-only queries (lesson from prototype build error).

## Testing Decisions

- Prefer external behaviour over implementation detail.
- Manual / smoke: open `/players/[id]`, switch tabs, refresh with `?tab=lesiones`, register/edit/close/reopen injury, filter year and Frente/Espalda, excuse absence still works on Wellness.
- No new unit tests required for pure layout unless existing injury filter helpers change.
- If a shared `useTabParam` helper is extracted, a small unit test for default/invalid values is enough; otherwise skip.

## Seams (for the implementing agent)

Highest existing seams — prefer these; do not invent new packages:

1. **Staff Player detail route** — composition root that owns fetch + layout of tabs.
2. **Design-system Tabs** — tab chrome and panels.
3. **Existing injury UI modules** — open/closed lists, history map/filters, log form, close dialog (behaviour unchanged; layout/composition may move).
4. **Existing wellness Player modules** — charts, history table, excused absence form.
5. **URL `searchParams`** — tab persistence (same pattern as prototype).

## Out of Scope

- Per-tab lazy data fetching / streaming.
- Changing Injury domain rules, schema, or server actions beyond what layout requires.
- Player app (`apps/player`) UI.
- Team injuries list page.
- Adding third tabs (career, matches, transfers, etc.).
- Promoting prototype components into `@repo/design-system`.
- Redesigning the global Header / sidebar.
- Visual clone of federation / third-party sites (inspiration only).

## Further Notes

- Grill decisions and prototype verdict live in `.scratch/player-detail-tabs/map.md`.
- Existing related work (done): JES-51 (staff injury log), JES-55 (injury history map) — this issue reorganises that UI, it does not redo domain.
- Admin density rules still apply: flat surfaces, semantic tokens, Phosphor icons, no structural shadows on ordinary lists.
