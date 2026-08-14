# Player detail page — tab layout prototype

## Question

The staff player detail page (`/players/[id]`) stacks 7 unrelated blocks in one long
scroll: profile + badges, injuries panel, excused absences, injury history map,
3 summary stats, wellness charts, daily history table. Does splitting it into tabs make
it readable, and which grouping wins?

## Decisions taken before building (grill)

| Question | Answer |
|---|---|
| Groupings to compare | Variant A (3 tabs) and Variant C (2 tabs) |
| Profile header | Stays fixed outside the tabs, always visible |
| Tab state | URL-synced (`?tab=`), shareable and refresh-safe |
| Data fetching | Unchanged — page still fetches everything server-side; UI-only reorganisation |
| Prototype shape | Throwaway route inside `apps/app`, variants via `?variant=` + floating bar |
| Docs persistence | `.scratch/player-detail-tabs/` |

## Variants

- **A** — `Resumen` (stats + charts) / `Lesiones` / `Historial` (table + excused absences) — **rejected**
- **C** — `Wellness` (stats + charts + daily table + excused absences) / `Lesiones` — **accepted**

## Prototype refinements (Lesiones, post-verdict)

Applied only on the throwaway route before shipping:

- Flat layout, no cards; whitespace + hairline dividers
- Desktop 2-column (anatomy left, data right); mobile continuous vertical flow
- Frente/Espalda overlaid on body map; year filters only on Historial header
- Registrar lesión: desktop title-row right; mobile FAB
- Flat summary metrics on Wellness (no Card shells)

## Verdict

**Shipped** variant C (2 tabs: Wellness | Lesiones) on `/players/[id]` (JES-86).
Profile strip stays outside tabs; `?tab=` URL sync; no fetch changes.
Throwaway `prototype-tabs` route removed after fold-in.

Spec: `.scratch/player-detail-tabs/PRD.md`.
Implementation: [JES-86](https://linear.app/jesus-guti-workspace/issue/JES-86/staff-player-detail-wellness-lesiones-two-tab-layout).

## Prototype files (removed)

Folded into production:

- `apps/app/features/players/components/player-detail-shell.tsx`
- `apps/app/features/injuries/components/player-injuries-panel.tsx` (flat Lesiones layout)

## Open follow-ups (explicitly deferred)

- Shared `useTabParam` helper — optional, not required for first ship
- Per-tab lazy fetching — out of scope until perf pain appears
