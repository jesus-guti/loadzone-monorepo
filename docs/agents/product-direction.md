# Product direction (staff ICP pivot)

Living product constraints for the near-term refactor. Agents must read this before planning or building staff (`apps/app`) flows that touch sessions, exercises, calendar, or load views. Domain terms live in root `CONTEXT.md`; this file is **not** a glossary.

## ICP

Primary staff user: **preparador físico** at **División de Honor** / **Juvenil** amateur football.

Design for that person under time pressure — not for a generic “club admin power user,” not for sports-science lab workflows.

## Promise

**Success = less time in the app.** Take planning and spreadsheet work off their plate. Prefer fewer clicks, fewer fields, fewer decisions. Maximum UX friction removal — **not** staff gamification (streaks/cromos stay player-side).

## Opinionated product

- Football planning is **Match Day–centric**: sessions and microcycles orbit **MD**, **MD-1**, **MD-2**, … (see `CONTEXT.md`).
- **LoadZone-prepared content** for exercises and session building blocks. In this product wave, staff **consume** the catalog; do **not** ship new staff “create Exercise” UX (schema/API may still allow club-owned exercises — product UI does not promote authoring).
- **Session calendar**: create a Session with the fewest possible clicks and fields; **drag-and-drop** to reschedule; **mobile-first** for daily staff use.
- Prefer sensible defaults over configuration screens. Refuse new builders, wizards, and optional fields that only serve edge clubs.

## Carga (the retention surface)

What the ICP asks for today is often **export to Excel** for their own acute/chronic and minutes math.

Product goal: they should not need to leave for that job. Staff surface **Carga** (Spanish UI label — not “Estadísticas”) shows interactive, Excel-like / pro-table views of:

- microcycles
- acute and chronic load (and related ratios already in **PlayerDailyStats**)
- ordered views (e.g. who has more minutes)
- improve depth over time on this surface

CSV export may remain as escape hatch; it is **not** the primary destination for load analysis. Prefer deepening **Carga** over new export formats or external spreadsheet workflows.

## How agents should decide

When a staff feature could go two ways, pick the option that:

1. Saves the preparador físico wall-clock time
2. Fits Match Day / microcycle language
3. Works with a thumb on a phone first
4. Uses prepared content instead of authoring
5. Puts insight in **Carga** instead of “download and calculate elsewhere”

## Out of scope for this direction doc

Player-app habit / cromo design; Age Band / Guardian policy; irreversible schema ADRs (those stay in `docs/adr/`).
