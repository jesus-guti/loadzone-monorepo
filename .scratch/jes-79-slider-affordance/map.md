# JES-79 — Fix player SliderInput thumb and unset→midpoint activation affordance

Planning map for [JES-79](https://linear.app/jesus-guti-workspace/issue/JES-79/fix-player-sliderinput-thumb-and-unsetmidpoint-activation-affordance).  
Route: `plan:auto` · Risk: low · Area: `apps/player/check-in`.

## Destination

Player recovery / RPE `SliderInput` shows a visible, draggable thumb on WebKit and Firefox; unset state reads as resting at the scale midpoint (~5 on 0–10) with a clear press/drag-to-activate affordance, without persisting a value until the **Player** interacts.

## Notes

- Consumer is app-local native `<input type="range">` in `apps/player/app/[token]/components/slider-input.tsx` — used by pre-session **recovery** and post-session **RPE** only. Energy / soreness / sleep quality use `ScaleInput` / chips, not this component.
- `@repo/design-system` `Slider` (Base UI) is **not** the consumer; do not restyle staff/DS slider for this issue.
- Unset model already exists: `value: number | null`; `displayValue = value ?? Math.round((min + max) / 2)` drives the range while hidden input stays `value ?? ""`. Commit timers only fire after interaction (`onChange` / release / key). Keep that contract — do **not** auto-persist midpoint.
- Confusion today: large readout shows `"–"` while the track sits at mid (`displayValue`), so the control looks broken/static. Hint `"Desliza para elegir"` is present but underpowered next to the dash.
- Existing e2e: `apps/player/e2e/tests/player-checkin.spec.ts` helper `setSlider` (prototype value setter + `input`/`change`/`pointerup`). Player vitest suite is pure-logic only (no RTL). Spanish product copy.

### Root-cause hypothesis (missing thumb)

Primary suspects in current thumb CSS (lines ~204–209):

1. **WebKit vertical offset** — `[&::-webkit-slider-thumb]:mt-[-20px]` is a fragile track/thumb centering hack (`(8−48)/2`). With input `h-12`, parent `min-h-12 py-2`, and a separate absolute gradient track, the thumb can sit clipped, above/below the visible track, or misaligned vs the decorative bar (especially Safari/iOS).
2. **Pseudo-element appearance not sticking** — Custom thumb requires reliable `appearance: none` / `-webkit-appearance: none` on both the input and `::-webkit-slider-thumb` / `::-moz-range-thumb`. If Tailwind v4 arbitrary variants fail to apply, the native thumb is tiny or invisible against a **transparent** runnable track.
3. **Low-contrast fill vs. mistaken “same as page”** — Thumb uses `bg-bg-primary` + `border-text-primary`. On light player chrome this should contrast the gradient; if borders also fail to apply, a near-white native/custom fill disappears into the mid-track (`via-premium`) or card surface.
4. **Firefox defaults** — `::-moz-range-thumb` often needs an explicit border reset / `box-sizing` before a custom 3px border; missing moz track/thumb pairing leaves a default chrome thumb that does not match the transparent track story.

Fix direction: keep native range (no DS Slider swap); make thumb styles engine-robust (appearance + contrast + alignment without brittle `mt-[-20px]`); leave decorative gradient as the visual track.

## Decisions so far

### Assumed (contained UI — reversible)

1. **[assume] Unset large readout shows muted midpoint number, not `"–"`** — While `value === null`, render `Math.round((min + max) / 2)` (typically **5** on 0–10) in `text-text-tertiary` (or equivalent muted token). After first interaction, use existing `colorForValue` / committed styling. Hidden field and parent `null` state stay unset until interaction. **Revert:** keep `"–"` and rely only on hint copy + thumb pulse.
2. **[assume] Hint copy refined in Spanish** — Replace or extend `"Desliza para elegir"` with something that invites **press or drag**, e.g. `"Pulsa o desliza para elegir"`. No Age Band copy fork. **Revert:** keep exact current string.
3. **[assume] Unset thumb affordance = visible mid thumb + optional calm muted/idle treatment** — Same resting position as `displayValue` mid; optional slightly lower emphasis (opacity / softer border) until activated; no auto-advance, no celebration motion (>200ms micro OK if needed). **Revert:** thumb styling identical for unset and committed; rely on readout + hint only.
4. **[assume] Thumb fix stays in `slider-input.tsx` class list / local CSS** — Prefer engine-safe utilities (explicit webkit/moz appearance, solid high-contrast fill+border, vertical align without `mt-[-20px]` hack — e.g. matched track/thumb geometry or documented safe offset). Do not add a second custom thumb DOM overlay unless native styling still fails after the first pass. **Revert:** overlay thumb div synced to value if native pseudo-elements remain broken after a focused CSS pass.

### Auto

5. **[auto] Scope = player `SliderInput` only** — Wire points: `pre-session-form.tsx` (recovery), `post-session-form.tsx` (RPE). No `ScaleInput`, no staff admin, no `@repo/design-system` `Slider`.
6. **[auto] Do not change scales, keys, care thresholds, or commit timing** — `IDLE_COMMIT_MS` / `RELEASE_COMMIT_MS` / validation (`hasValue: … !== null`) unchanged. Midpoint is visual-only until interaction.
7. **[auto] Regression coverage** — Prefer a small pure helper (or exported readout logic) covered by vitest: unset → muted mid digit; set → committed digit. Extend e2e around existing `setSlider`: assert unset UI does not show lone `"–"` (shows mid), and interaction still advances. Optionally assert range input retains webkit/moz thumb class tokens so a delete of thumb utilities fails CI. No new RTL dependency required for v1.
8. **[auto] Docs** — None beyond this map unless implementer hits a non-obvious WebKit gotcha worth one line in a comment.

## Out of scope

- Auto-persisting 5 / advancing without interaction.
- Restyling DS or staff sliders.
- Changing min/max, Borg labels, or care red-flag rules.
- Energy / soreness `ScaleInput` affordance.

## Fog

- Exact visual recipe that wins on both Safari iOS and Firefox desktop (utility-only vs thin local CSS vs overlay thumb) — resolve during implementation smoke, starting with native pseudo-element fix.
- Whether Playwright should assert computed thumb size (browser-flaky) vs class-token / readout assertions only — default to readout + class-token unless thumb still regresses silently.

## Human review

- **2026-08-10** — User: `ok all`. All decisions (including assumes 1–4) accepted as written. Proceed to implement.
