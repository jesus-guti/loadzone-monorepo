# Current Streak Cromo foil and check-in hooks

Question: How does the player Streak Cromo foil work today, where does it render in check-in vs racha sheet, and what would an in-place pointer/gyro + tier-up celebration have to hook?

Scope: LoadZone primary sources only. No production code changes in this note.

---

## Glossary (CONTEXT.md)

**Streak Cromo** (`CONTEXT.md` glossary + Relationships):

- Player-facing identity card in `apps/player` that evolves with **Recoverable Streak**.
- Photo (Club crest from `Club.logoUrl` only), optional Playing Position, optional shirt overprint, Team streak-rank ink seal, Team name. Streak count lives in the header racha pill and the LOADZONE pill — not a fire disc on the card.
- Material names (Bronce, Oro, Esmeralda, …) are **not printed** on the card; chrome is player-local CSS, not staff / design-system sage.
- **Shine:** 3px foil rim on every tier. **Bronce / Plata** = metallic plate bevel. **Oro and above** = holographic drift on the **shell and the rim**.
- Explicit constraint: **“ambient CSS only — no pointer tracking.”**
- Distinct from staff Wellness Tarjetas. DD-05 lab (`prototype-dd-05`, variant C) reuses the same app-local component.

**Recoverable Streak:** season-scoped expected-day habit; increments when PRE/POST **DailyEntry** obligations for that day are complete.

---

## Tiers and foil kinds (`apps/player/app/[token]/lib/streak-cromo.ts`)

| `CromoTier` | Min streak days (`CROMO_TIER_MIN_DAYS`) | Label (`CROMO_TIER_LABEL`, not on-card) | `cromoFoilKind` | `CROMO_FOIL_INTENSITY` |
| --- | --- | --- | --- | --- |
| 1 | 0 | Bronce | `plate` | 0.18 |
| 2 | 3 | Plata | `plate` | 0.38 |
| 3 | 7 | Oro | `holo` | 0.56 |
| 4 | 14 | Platino | `holo` | 0.72 |
| 5 | 30 | Esmeralda | `holo` | 0.86 |
| 6 | 60 | Diamante | `holo` | 1 |

- `streakCountToCromoTier` is a waterfall on those minima (0–2 → 1, 3–6 → 2, …, ≥60 → 6). Covered in `apps/player/__tests__/streak-cromo.test.ts`.
- `cromoFoilKind(tier)`: `tier <= 2 ? "plate" : "holo"`.
- `CROMO_TIER_SHELL` maps each tier to CSS custom properties `var(--cromo-N-*)`. Comment: keep in sync with `[data-streak-cromo-tier]` in `apps/player/app/globals.css`. The live card does **not** apply this object as inline style; it uses `data-streak-cromo-tier` so CSS owns paint.
- `CROMO_TIER_LABEL` is for tests / domain names only; `StreakCromo` never renders it.

---

## Component structure (`apps/player/app/[token]/components/streak-cromo.tsx`)

Client component. Props: `streakCount`, `restarted`, optional photo/crest/position/name/team/shirt/`teammateStreaks`. No pointer, gyro, or celebration props.

**Paint path:**

1. `tier = streakCountToCromoTier(streakCount)`
2. `foilKind = cromoFoilKind(tier)`, `foilIntensity = CROMO_FOIL_INTENSITY[tier]`
3. `CromoFoilShell` wraps the card:
   - Outer `.cromo-foil-frame` with `data-cromo-foil={foilKind}`, `data-streak-cromo-tier={tier}`, `--cromo-foil-intensity`.
   - **Holo:** `CromoHoloShine` is a **sibling above** the `<article>` (`absolute inset-0 z-20`, `pointer-events-none`): mask + rainbow + sparkle layers + glare. Opacity `0.28 + 0.52 * intensity`.
   - **Plate:** inset box-shadow on the article; `CromoPlateShine` **inside** the article (`cromo-foil-brushed`, `z-20`, `pointer-events-none`). Opacity `0.35 + 0.5 * intensity`.
4. `<article class="cromo-shell">` holds portrait, identity header, footer. `motion-safe:transition-[background-color,color]` (300ms) — Tailwind `motion-safe`, not foil keyframes.

**Identity chrome (not foil):** portrait load fade/scale; rotated ink seal and dorsal overprint (`CROMO_SHIRT_*_ROTATION_DEG`); LOADZONE pill uses `FOCUS_COPY.streakCalm(streakCount)`. Restart line (`FOCUS_COPY.streakRestart`) when `restarted || streakCount === 0`.

**Implication for pointer/gyro:** shine layers are `pointer-events-none`. Tracking would attach to `.cromo-foil-frame` (or a new wrapper), then drive CSS variables. There is **no** `--pointer-x` / orientation plumbing today.

---

## Foil CSS and reduced motion (`apps/player/app/globals.css`)

**Tokens:** `:root` and `.dark` define `--cromo-1-*` … `--cromo-6-*` (top/bottom/glow/edge/inset/fg). Comment: player-local only; do not fork brand sage.

**Shell:** `[data-streak-cromo-tier="N"]` aliases those into `--cromo-top` etc. `.cromo-shell` is a radial highlight + 180° linear gradient.

**3px rim:** `.cromo-foil-frame` has `padding: 3px`, `--cromo-radius: 0.5rem`, inner radius `calc(... - 3px)`, `width: min(100%, 16.5rem)`, `isolation: isolate`.

- **`[data-cromo-foil="plate"]`:** static 145° metallic gradient using `--cromo-foil-intensity`.
- **`[data-cromo-foil="holo"]`:** repeating rainbow on the **frame** (`background-size: 220%`), `animation: cromo-foil-rim 8s ease-in-out infinite alternate`.
- **`.cromo-foil-brushed`:** repeating stripe + `mix-blend-mode: soft-light`.
- **Holo overlay:** `mix-blend-mode: plus-lighter`; layers `cromo-foil-drift` 7s; glare 9s; mask 11s. All `ease-in-out infinite alternate`. Motion is `translate3d` / `background-position` — no 3D `rotateX/Y`.

**`prefers-reduced-motion: reduce`:** sets `animation: none` on `[data-cromo-foil="holo"]`, `.cromo-foil-holo-layer`, `.cromo-foil-holo-glare`, `.cromo-foil-holo-mask`. Plate bevel and static holo **paint** remain. Component `motion-safe:*` transitions also drop under reduced motion.

No `DeviceOrientationEvent`, pointer listeners, or foil-related JS besides intensity inline styles.

---

## Where it renders

### Production check-in — not on the forms

`apps/player/app/[token]/page.tsx` loads streak / media (`cromoMediaUrl`) and renders `SessionPage`.

`apps/player/app/[token]/components/session-page.tsx`:

- **Always (header):** `RachaSheet` — compact pill (fire icon + numeric streak + photo disc). **Not** the full cromo.
- **PRE/POST tabs:** `PreSessionForm` / `PostSessionForm` — **no** `StreakCromo`.
- **Celebration (`showCelebration`):** `allDone && !editingPre && !editingPost`. Copy from `FOCUS_COPY.completionTitle` / `completionBody` (Age Band). **Full `StreakCromo` only if `isTodaySelected`**. Past dates get `FOCUS_COPY.pastDateDone` instead. Then edit PRE/POST buttons + optional `PushPrompt`.

Streak state: `streakCount` / `streakRestarted` from page `currentStreak`, updated in `handlePreComplete` / `handlePostComplete` when the action returns `{ currentStreak, restarted }`.

### Racha sheet

`apps/player/app/[token]/components/racha-sheet.tsx`: bottom `Sheet` (“Racha”). Full `StreakCromo` in the overlay, then a large fire + `FOCUS_COPY.streakHero`, then week session marks (not DailyEntry done/miss). Same cromo props as celebration. Opening the sheet from the header is the **resting** full-card surface while the player is still filling forms.

### Lab (not production check-in)

`apps/player/app/[token]/prototype-dd-05/variant-c-reward.tsx`: same `StreakCromo` **during** stub questions and on complete. Variants A/B do not use it. `CONTEXT.md` Relationships: DD-05 variant C reuses the app-local component.

Call sites of `StreakCromo`: `session-page.tsx`, `racha-sheet.tsx`, `prototype-dd-05/variant-c-reward.tsx`.

---

## Existing celebration on complete

There is a **completion beat**, not a **CromoTier-up** beat.

- Gate: both PRE and POST complete, not editing (`session-page.tsx`).
- UX: Spanish thank-you heading + body; cromo if today; no extra foil animation, no confetti, no tier label, no comparison of previous vs next `CromoTier`.
- Layout: `shouldReserveFixedSaveClearance` is false during celebration (`apps/player/app/[token]/lib/session-chrome.ts`).
- Streak increment: `maybePersistStreak` in `apps/player/app/[token]/actions/save-entry.ts` runs only when `isDayObligationsComplete` — typically the **last** fill (usually POST). PRE complete often returns no streak payload; the cromo on celebration uses whatever `streakCount` is after that last successful persist.
- Restart copy is the cromo footnote, not a separate celebration animation.

Detecting a tier-up would be **new**: compare `streakCountToCromoTier` before vs after `currentStreak` on complete (likely `handlePostComplete`). Nothing in `StreakCromo` or session page tracks previous tier.

---

## What pointer/gyro + CromoTier-up would have to hook

| Concern | Today | Likely hook |
| --- | --- | --- |
| Ambient-only glossary | `CONTEXT.md`: “ambient CSS only — no pointer tracking” | Glossary + `pointer-gyro-contract` grilling (`.scratch/streak-cromo-foil-wayfinder/tickets/pointer-gyro-contract.md`) |
| Pointer / gyro input | None; foil `pointer-events-none`; CSS keyframes only | `CromoFoilShell` / `.cromo-foil-frame`; CSS vars into `globals.css` (rim + holo layers). Two live instances: racha overlay + celebration (same component). Header pill is **not** a cromo. |
| Reduced motion | Kill holo **animations**; keep static foil | Must also refuse pointer/gyro motion; keep plate/holo still paint |
| Intensity / kind | Derived only from current `streakCount` | Same functions; optional extra “celebrate” class on the shell |
| Tier-up | No previous-tier state | `session-page.tsx` complete handlers + `streakCountToCromoTier`; optional prop into `StreakCromo`. Persist timing is `save-entry.ts` `maybePersistStreak`. |
| Surfaces | Forms: no card. Resting full card: racha sheet. Post-check-in: celebration cromo (today only). Lab C: card during questions. | Map: extra animation **only on tier-up**; resting + check-in. Compact header is fire+count, not a foil target unless the contract expands. |
| Package boundary | Player-local CSS + component | Stay in `apps/player` (map: do not promote foil to `@repo/design-system`) |

---

## Sources

- `CONTEXT.md` (Streak Cromo, Recoverable Streak, Relationships)
- `apps/player/app/[token]/lib/streak-cromo.ts`
- `apps/player/app/[token]/components/streak-cromo.tsx`
- `apps/player/app/globals.css`
- `apps/player/app/[token]/components/racha-sheet.tsx`
- `apps/player/app/[token]/components/session-page.tsx`
- `apps/player/app/[token]/page.tsx`
- `apps/player/app/[token]/lib/session-chrome.ts`
- `apps/player/app/[token]/lib/focus-copy.ts`
- `apps/player/app/[token]/actions/save-entry.ts` (`maybePersistStreak`)
- `apps/player/app/[token]/prototype-dd-05/variant-c-reward.tsx`
- `apps/player/__tests__/streak-cromo.test.ts`
- `.scratch/streak-cromo-foil-wayfinder/MAP.md`
