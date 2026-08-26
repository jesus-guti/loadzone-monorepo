# Production Streak Cromo vs TCG-like frame (facts)

Question (ticket 02): In the current Streak Cromo DOM, CSS, and surfaces (header pill vs Racha sheet vs completion), what is already a “card” and what is missing for a physical TCG-like frame plus working pointer tilt — facts only, no new design.

Scope: LoadZone production player sources listed below. No UI changes. Contrast with `pokemon-cards-css` pointer vars is cited from prior research only; that CSS is not copied here.

Ticket 08 decision (grill, not implemented in production CSS): rectangular outer frame; arched portrait window inside; foil on tilt on **frame, LOADZONE pill, rank seal, dorsal**; portrait matte; player name and Team name ink. (`.scratch/streak-cromo-foil-wayfinder/issues/08-cromo-frame-and-foil-regions.md`)

---

## 1. What already is a “card”

### Component

`StreakCromo` (`apps/player/app/[token]/components/streak-cromo.tsx`) is a client identity card: props are streak/restart plus photo, crest, position, names, shirt, teammate streaks. There are **no** pointer, gyro, or celebration props.

Paint path:

1. `tier = streakCountToCromoTier(streakCount)` (`apps/player/app/[token]/lib/streak-cromo.ts`).
2. `foilKind = cromoFoilKind(tier)` (`plate` if `tier <= 2`, else `holo`); intensity from `CROMO_FOIL_INTENSITY`.
3. `CromoFoilShell` wraps an `<article class="cromo-shell">`.
4. Outer node: `div.cromo-foil-frame` with `data-cromo-foil`, `data-streak-cromo-tier`, inline `--cromo-foil-intensity` only.

`CROMO_TIER_SHELL` exists in `streak-cromo.ts` but the live card does **not** apply it as inline style; `[data-streak-cromo-tier]` in `apps/player/app/globals.css` owns `--cromo-*` aliases.

`CromoFoilKind` in production is `"plate" | "holo"` only. Glossary `CONTEXT.md` also names a **spark** recipe on Diamante; production `cromoFoilKind` does not return `spark`.

### Rectangular shell + 3px rim

`.cromo-foil-frame` (`globals.css`): `width: min(100%, 16.5rem)`, `--cromo-radius: 0.5rem`, `padding: 3px`, `overflow: hidden`, `isolation: isolate`. Inner `.cromo-shell` radius is `calc(0.5rem - 3px)`.

- **Plate:** static 145° metallic gradient on the frame; inset box-shadow on the article; `CromoPlateShine` (`.cromo-foil-brushed`) **inside** the article, `absolute inset-0 z-20`, `pointer-events-none`.
- **Holo:** repeating rainbow on the **frame** (`background-size: 220%`, `cromo-foil-rim` 8s); `CromoHoloShine` is a **sibling above** the article (`absolute inset-0 z-20`, `pointer-events-none`): mask + rainbow + sparkle + glare. Opacity `0.28 + 0.52 * intensity`.

`.cromo-shell` is a radial highlight + 180° linear gradient using `--cromo-top` / `--cromo-bottom`. Padding `p-4`, column layout: portrait, optional name/position header, footer.

This is a **rounded rectangle card** with a **3px painted rim**. It is not a thick TCG border with a cut-out window.

### Portrait (already arched crop, not a framed window)

`CromoPortrait`: `aspect-5/5`, `w-full`, `rounded-t-full rounded-b-sm`. Photo `object-cover` or silhouette. 1px inset edge using `--cromo-edge`. Bottom gradient wash. Dorsal (`ShirtOverprint`) sits **on the portrait** (`absolute inset-0 z-10`, same rounded clip), hollow numeral `text-white/25` + `WebkitTextStroke`.

The arch is the **photo’s own border-radius**, inset by the shell’s `p-4`. There is no separate inner window node, clip-path, or frame mass around the portrait.

### Identity chrome (ink today)

- Player name: `text-2xl font-bold` (when set).
- Playing Position: uppercase tracking line (when set).
- Rank seal (`ShirtInkSeal`): SVG rings + arc text (`CROMO_SEAL_ARC_TOP` / `cromoSealArcBottom`), `#` + rank; `currentColor`; static rotate `CROMO_SHIRT_SEAL_ROTATION_DEG` (25°). Footer, `absolute`.
- LOADZONE pill: `border-current` split bar; left “LOADZONE”; hatch; right `FOCUS_COPY.streakCalm(streakCount)`.
- Team name: `.cromo-team-name` (Instrument serif).
- Club crest: circular disc, or `CROMO_CLAIM` copy when no URL.

Restart footnote is **outside** `CromoFoilShell` (`FOCUS_COPY.streakRestart`).

Ticket 08: name and Team stay **ink**. Production already treats those as text, not foil layers.

### Foil coverage vs ticket 08 regions

Ticket 08 foil targets: **frame, LOADZONE pill, rank seal, dorsal**; **portrait matte**.

| Region | Production fact |
| --- | --- |
| Frame (3px rim) | Plate/holo **does** paint `.cromo-foil-frame` background. |
| Shell / portrait | Holo overlay is `inset-0` on the **frame** (covers article + photo). Plate brushed layer is `inset-0` on the **article** (covers photo). Not a matte-portrait mask. |
| LOADZONE pill | Border + fill text; no foil class or metallic overlay. |
| Rank seal | Stroke/fill `currentColor`; no foil overlay. |
| Dorsal | White-alpha fill + stroke on the photo; no foil overlay. |

Holo/plate motion is CSS keyframes (`translate3d` / `background-position`). No `rotateX` / `rotateY` / `perspective` on production cromo rules (`globals.css`).

---

## 2. Surfaces: what mounts a card vs not

### Header pill — not a cromo

`RachaSheet` trigger (`apps/player/app/[token]/components/racha-sheet.tsx`): `rounded-full` chip — `StreakFireIcon` + tabular `streakCount` + `HeaderPhotoDisc` (28px circle or `UserCircleIcon`). **Does not** render `StreakCromo`, `.cromo-foil-frame`, or foil attributes.

`session-page.tsx` always puts this pill in the check-in header.

Ticket 04 (grill): tracking on **full cromo only**, not the header pill. `CONTEXT.md` Streak Cromo: compact header pill is not a cromo and is not tracked.

### Racha sheet — full card (resting)

Same `RachaSheet`: bottom `Sheet`, title `FOCUS_COPY.streakSheetTitle`. First body child is full `StreakCromo` with the same identity props as completion. Below: large fire + `streakHero`, then week session marks (Team Sessions, not DailyEntry). Comment: overlay is the resting full-card surface while forms still show.

### Completion — full card if today

`session-page.tsx`: `showCelebration = allDone && !editingPre && !editingPost`. Then thank-you copy; **`StreakCromo` only if `isTodaySelected`**; else `FOCUS_COPY.pastDateDone`. PRE/POST forms do not mount `StreakCromo`.

Call sites of `StreakCromo` in player app (this research): `session-page.tsx`, `racha-sheet.tsx`, and lab `prototype-dd-05` (out of this map’s judge surface; not inspected further).

---

## 3. What is missing for TCG-like frame (vs ticket 08)

Facts of **absence** in production DOM/CSS — not a proposed layout:

- **Frame mass:** only `padding: 3px` on `.cromo-foil-frame`. No wider rectangular chrome, dual-radius window, or inner mat around the portrait.
- **Hybrid window:** no inner arched **window** distinct from the photo crop; portrait is a rounded rectangle filling the padded shell.
- **Selective foil:** no foil layers scoped to pill, seal, or dorsal. Holo/plate shine is full-bleed on frame/article (`inset-0`). Portrait is not isolated as matte.
- **`spark`:** glossary/CONTEXT names Diamante spark; production kind is still `plate | holo` (`streak-cromo.ts`).

Glossary in `CONTEXT.md` already **describes** rectangular outer frame + arched window + selective foil. That text is the ticket 08 product intent. **CSS/DOM have not been updated to match it.**

---

## 4. What is missing for working pointer tilt

### Production cromo

- `StreakCromo` / `CromoFoilShell`: no `onPointerMove`, no orientation listeners, no `--pointer-x` / `--pointer-y` / `--rotate-x` / `--rotate-y` (or LoadZone `--lz-*` equivalents).
- Shine nodes are `pointer-events-none` (they do not consume hits; the frame also has **no** hit handlers).
- Foil motion: infinite `ease-in-out alternate` keyframes. `prefers-reduced-motion: reduce` sets `animation: none` on holo frame + layers + glare + mask; static paint remains.
- `CROMO_SHIRT_*_ROTATION_DEG` is a **fixed** 25° ink/dorsal rotate, not pointer-driven 3D.

Prior catalog (`.scratch/streak-cromo-foil-wayfinder/research-streak-cromo-current.md`): same conclusion — ambient CSS, no pointer/gyro plumbing.

### Contrast (reference only)

`.scratch/streak-cromo-foil-wayfinder/research-pokemon-cards-css.md`: `pokemon-cards-css` writes `--pointer-x`, `--pointer-y`, `--rotate-x`, `--rotate-y`, glare springs onto `.card`; CSS reads them on rotator/shine/glare. Production cromo has **none** of those variables.

A throwaway `apps/player/app/[token]/prototype-cromo-foil/` tree has `usePointerTilt` and `--lz-pointer-*`. This map’s `map.md` says that route is **not** the judge surface and must not be extended. Production `StreakCromo` does not import it.

Ticket 04 (grill): pointer on full cromo (Racha + today’s completion); modest 3D; ambient until interact; gyro opt-in on Racha; reduced-motion static. **Not present in production code.**

---

## 5. Implications (facts, not a plan)

| Need (ticket 08 + 04) | Production today |
| --- | --- |
| Full cromo to judge | Exists: Racha overlay + today’s celebration `StreakCromo` |
| Header as foil/tilt target | Pill is fire + count + disc; not a card |
| TCG-like frame + inner arch | Rounded 16.5rem card, 3px rim, arched **photo** radius |
| Foil on frame + pill + seal + dorsal; portrait matte | Rim + full-card holo/plate wash; pill/seal/dorsal ink (or photo stroke) |
| Pointer tilt | None on production cromo; ambient keyframes only |

---

## Sources

- `apps/player/app/[token]/components/streak-cromo.tsx`
- `apps/player/app/[token]/lib/streak-cromo.ts`
- `apps/player/app/globals.css` (`.cromo-foil-frame`, `.cromo-shell`, foil keyframes, `.cromo-team-name`)
- `apps/player/app/[token]/components/racha-sheet.tsx`
- `apps/player/app/[token]/components/session-page.tsx`
- `CONTEXT.md` (Streak Cromo glossary)
- `.scratch/streak-cromo-foil-wayfinder/issues/08-cromo-frame-and-foil-regions.md`
- `.scratch/streak-cromo-foil-wayfinder/issues/04-pointer-gyro-contract.md`
- `.scratch/streak-cromo-foil-wayfinder/research-streak-cromo-current.md`
- `.scratch/streak-cromo-foil-wayfinder/research-pokemon-cards-css.md` (pointer-var contrast only)
- `.scratch/streak-cromo-tcg-card-wayfinder/map.md` (judge surface / ignore `prototype-cromo-foil`)
