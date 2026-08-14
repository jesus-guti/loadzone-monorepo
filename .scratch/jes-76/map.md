# JES-76 — Apply wellness visual scales to player table or day cards

**Ticket:** [JES-76](https://linear.app/jesus-guti-workspace/issue/JES-76/apply-wellness-visual-scales-to-player-table-or-day-cards)  
**Branch:** `jesusgutierrezsiliceo/jes-76-apply-wellness-visual-scales-to-player-table-or-day-cards`  
**Mode:** `plan:auto`

## Question

Where should prototype wellness visual scales land so staff can scan DailyEntry metrics without glyph soup?

## Decisions

1. **Hybrid placement (closed)** — Richer scales on per-Player day cards; compact scales in comparison / history tables only for cells that earn space (recovery, energy, soreness, risk). Pre/post and dense secondary columns stay compact text.
2. **App-local only (closed)** — Reuse `/prototype/wellness-scales` language under `apps/app/features/wellness/components/wellness-scales/`. Do **not** promote to `@repo/design-system` (ADR 0001).
3. **No Team Wellness summary redesign** — Left column / pending / averages strip stays for JES-74.
4. **No scoring or limits changes** — Tone helpers and thresholds remain; scales are presentation only.
5. **Empty DailyEntry** — Missing metrics render a calm `—`, never a fake full scale.
6. **Metric → primitive map**
   - Recovery (0–10, higher better) → `ScaleSlider` (`higherIsBetter`)
   - Energy (1–5) → `ScaleBattery`
   - Soreness (1–5) → `ScaleIntensity`
   - Risk → `ScaleThermometer` (level mapped from `RiskLevel`)
   - RPE (0–10, higher worse) → `ScaleSlider` on day cards only (not every table column)

## Surfaces

| Surface | Treatment |
| --- | --- |
| `TeamWellnessPlayerCard` | `md` scales for recovery / energy / soreness / risk / RPE when present |
| `TeamWellnessOverview` comparison table | `sm` scales for recovery / energy / soreness / risk; Pre/Post stay Sí/— |
| `PlayerHistoryTable` | `sm` scales for recovery / energy / soreness / risk; sleep / RPE / duration / alerts stay compact |

## Artifact paths

- Production scales: `apps/app/features/wellness/components/wellness-scales/`
- Prototype smoke route: `apps/app/app/prototype/wellness-scales/` (re-exports feature primitives)
- Wiring: player card, overview table, player history table
