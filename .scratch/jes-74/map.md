# JES-74 — Redesign Team Wellness summary

**Ticket:** [Redesign Team Wellness summary: pending bubbles, averages, alerts](https://linear.app/jesus-guti-workspace/issue/JES-74/redesign-team-wellness-summary-pending-bubbles-averages-alerts)  
**Soft-block:** [JES-73](https://linear.app/jesus-guti-workspace/issue/JES-73/standardize-staff-tabs-styles-from-wellness-segmented-control) (Tabs migration) — tip `9bfe070` present on origin; this branch builds on it  
**Branch:** `jesusgutierrezsiliceo/jes-74-redesign-team-wellness-summary-pending-bubbles-averages`  
**Worktree:** `/Users/jesus-guti/Code/personal/worktrees/rely/jes-74`  
**Mode:** plan:auto · HITL waived (orchestrator)

## Destination

Team Wellness overview summary strip is only three beats:

1. **Pending bubbles** — small avatar bubbles for Players who still owe forms; clear empty/complete state when nobody is pending; Reminder CTA stays attached here.
2. **Team averages** — recovery / energy / soreness means already computed, each as visual (progress-style fill) + number.
3. **Alerts** — count with icon, shown only when `alertCount > 0`.

Former summary tiles gone (Prioridad hoy, Pre completada, Post completada as separate tiles, duplicate pending headline/count chrome). Comparison table beside the summary stays (out of “summary tiles” scope).

## Decisions so far

| # | Level | Decision |
|---|---|---|
| 1 | auto | Composition order: pending bubbles → visual averages + number → alerts with icon when present; delete other summary tiles |
| 2 | assume | Session finished / pre vs pre+post: Wellness workspace has **no** client session-end signal today. Treat **post expected** ⇒ pending = missing pre **or** post (existing `buildWellnessSummary.pendingCount` / player filter). No new session fetch for this issue |
| 3 | auto | Averages = existing team means (recovery / energy / soreness); no new backend metrics |
| 4 | assume | Progress fill scales: recovery `0–10`, energy & soreness `1–5` (bootstrap form template bounds). Percent = `value / max * 100` |
| 5 | auto | Reminder CTA remains on the pending section |
| 6 | auto | Presentation only; no scoring / alert-detection / limits changes — only wire existing pending lists into bubbles |
| 7 | assume | Pending bubbles are compact avatars (initials / image) linking to `/players/:id`; not the filterable bubbles-view control |
| 8 | assume | Soft-block JES-73: merge tip when available; else ship on `origin/dev` without inventing a new local segmented control. **Resolved:** tip merged/stacked (`9bfe070`) |
| 9 | assume | Spanish copy: “Formularios pendientes”, “Todo al día”, metric labels Recuperación / Energía / Dolor muscular, “Alertas” |

## Out of scope

- Player cards grid / bubbles view mode redesign (beyond summary)
- DailyEntry scoring, wellness limits, or alert detection logic
- New wellness metrics
- Fetching TeamSession end state to toggle pre-only pending (follow-up if product needs true session-finished gating)
- JES-73 Tabs / segmented migration (merge tip if available; otherwise leave alone)

## Decision report

### JES-74 — Redesign Team Wellness summary
**Decidido**
1. Summary = pending bubbles → averages (visual + number) → alerts with icon when > 0; delete other summary tiles; keep comparison table.
2. Pending set = pre+post owed (existing rules); no session-end signal in workspace ⇒ post expected.
3. Averages reuse recovery/energy/soreness means; fill against 0–10 / 1–5 / 1–5.
4. Reminder CTA stays on pending section; presentation-only; no new metrics/scoring.
5. JES-73 tip available → stack summary redesign on Tabs migration; do not reintroduce local segmented chrome.

**Pendiente de ti**
lista para implementar

**Riesgo**: med · **Bloquea a**: —

## Implementation notes

- Primary file: `apps/app/features/wellness/components/team-wellness-overview.tsx`
- Helpers: `listPendingPlayers` (or inline filter) in `team-wellness-workspace.utils.ts` + unit coverage
- Prefer semantic tokens; small Avatar (`size-8` / `size-9`); simple track/fill for averages (avoid DS Progress `bg-muted` / `bg-primary` authoring tokens — use app-local bar with `bg-bg-tertiary` / tone fill)
