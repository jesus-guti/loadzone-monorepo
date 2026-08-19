# JES-109 — Player Recoverable Streak sheet and Streak Cromo identity

Planning map for [Player Recoverable Streak sheet and Streak Cromo identity](https://linear.app/jesus-guti-workspace/issue/JES-109/player-recoverable-streak-sheet-and-streak-cromo-identity).  
Route: `plan:auto` · Risk: medium · Area: `apps/player` (plus staff Playing Position on `apps/app`).  
**Epic only plans** — no code PR for JES-109. Children implement: [Playing Position on Player and Streak Cromo](https://linear.app/jesus-guti-workspace/issue/JES-110/playing-position-on-player-and-streak-cromo), [Player header streak pill opens Racha sheet](https://linear.app/jesus-guti-workspace/issue/JES-111/player-header-streak-pill-opens-racha-sheet), [Racha sheet week row and Team Session banner](https://linear.app/jesus-guti-workspace/issue/JES-112/racha-sheet-week-row-and-team-session-banner), [Streak Cromo photo, Club crest, and vivid tiers](https://linear.app/jesus-guti-workspace/issue/JES-113/streak-cromo-photo-club-crest-and-vivid-tiers).

## Destination

In `apps/player`, an always-visible Recoverable Streak header pill opens a tall «Racha» sheet (flame + count, Monday–Sunday Team Session week chrome, short week banner, Streak Cromo with photo / Club crest / optional Playing Position and vivid player-local tiers). Staff can set optional Playing Position. Recoverable Streak math, Geist, shared DS sage brand, and Age Band chrome stay unchanged.

## Notes

- Domain: root `CONTEXT.md` (**Recoverable Streak**, **Streak Cromo**, **Playing Position**, **Session**). Grill locked 2026-08-17/18 (round 4 assumed recommended). Do not reopen streak math, Age Band forks, Headway display font, shared DS second brand hue, Team logo crest, or staff Wellness tarjetas.
- Skills / rules: Wayfinder (this map), autonomy matrix, `loadzone-design-system.mdc`, Phosphor via `@phosphor-icons/react` (`/ssr` in RSC).
- Prior art: `packages/database/recoverable-streak.ts`, `apps/player/.../streak-cromo.tsx`, bottom `Sheet` in install-prompt / session-page, `Team.timezone`, `Club.logoUrl`, `Player.imageUrl`.
- Delivery graph: wave 1 = Playing Position + Racha sheet shell; wave 2 = week row + cromo identity (blocked by sheet shell). Epic closes when children land — no fifth implementation PR.
- If `origin/dev` still lacks the grill glossary lines for **Session** / **Playing Position** / streak–week split, the first shipping child that needs the term lands those English `CONTEXT.md` updates.

## Decisions so far

### Grill locked (do not reopen) — tagged for implementers

1. **[auto] Recoverable Streak engine unchanged** — Expected day = non-cancelled **Session** the **Player** is on + PRE/POST **DailyEntry**; gaps without that Session neither increment nor break; attendance GPS out; injury/excuse freeze unchanged; season-scoped `currentStreak` / `longestStreak` / `streakSeasonId` unchanged.
2. **[auto] Header pill always visible** — Including streak 0; tappable; opens sheet (not a new route).
3. **[auto] Tall Headway-style sheet** — Title «Racha», close returns to check-in; composition top→bottom: close+title; flame + «Racha de N días»; L–D week row; short week banner; Streak Cromo.
4. **[auto] Week chrome ≠ streak expected days** — Week marks = all Team **Sessions** that civil week (team timezone, Monday start); CANCELLED omitted; multiple Sessions same day → one mark; no DailyEntry done/miss on letters; today underlined.
5. **[auto] Playing Position** — Optional enum `POR` | `DEF` | `MED` | `DEL` on **Player**; staff create/edit; cromo shows codes only when set; no «Sin posición»; no fine pitch slots. Owned by Playing Position child.
6. **[auto] Crest = Club.logoUrl only** — No Team logo crest in this epic.
7. **[auto] Typography Geist** — No Headway-like second display family.
8. **[auto] Cromo tiers stay 0 / 3 / 7 / 14+** — Keep Spanish labels (Calentamiento / En racha / En forma / Leyenda). Vivid shells via **player-local** tokens only — not a second brand hue in `@repo/design-system` / staff.
9. **[auto] Same Streak Cromo** — Sheet + today’s completion celebration + `prototype-dd-05` share one component; Age Bands share chrome; Guardian is not an operator of this sheet.
10. **[auto] Test seams** — Keep recoverable-streak + `streakCount→tier` tests; add one pure week-projection module (`Sessions` + timezone + Monday week + as-of → seven `{ weekday, hasSession, isToday }`); no Headway screenshot tests; no Sheet RTL unless behaviour cannot live in the helper.

### Resolved this planning pass

11. **[auto] Sheet primitive** — Reuse shared bottom `Sheet` / `SheetContent` (player install-prompt pattern: `side="bottom"`, large radius). Client island beside existing session-page header.
12. **[auto] Flame / today underline / pill chrome colour** — Brand sage (`brand` tokens), per grill flame-accent. Replace the current premium-tint streak pill with brand-tinted pill so header and sheet flame match. Cromo vivid tiers remain separate (decision 8 / 16).
13. **[auto] Week projection module home** — Pure helper under `apps/player` (e.g. `app/[token]/lib/racha-week.ts` + colocated test). Not `@repo/database` — week chrome is player UI projection, not habit engine.
14. **[auto] Has-session mark** — Compact mark under the weekday letter (Headway-like dot/bar). Letters stay L M X J V S D.
15. **[auto] Flame icon** — Phosphor `Flame` (fill or bold in hero; regular/bold ok in pill). Client entry from `@phosphor-icons/react` inside the sheet client component; `/ssr` only if rendered from RSC.
16. **[auto] Pill copy** — Keep compact `${n} días` via existing focus-copy helper; sheet hero uses «Racha de N días». Calm / invitational at 0 (no guilt).
17. **[auto] Playing Position schema shape** — Prisma optional enum field on `Player` (e.g. `playingPosition`), Spanish staff labels POR/DEF/MED/DEL; clearable. Schema change lives in Playing Position child (grill already locked product contract).
18. **[auto] Photo** — `Player.imageUrl` via existing staff upload; no new media pipeline. Missing → calm silhouette (evolve current placeholder, no photo-or-bust).
19. **[auto] Child ownership** — Playing Position owns enum + staff form + cromo line prop; Racha sheet shell owns always-on pill + sheet shell + flame hero + existing cromo embed; week row owns helper + L–D row + banner; cromo identity owns photo/crest/vivid tokens (consumes Playing Position if merged, does not hard-block).
20. **[assume] Sheet height** — Near-full bottom sheet (~90dvh / tall scrollable content), not a short peek.  
    Revert: use default Sheet height / shorter peek if thumb reach suffers on small phones.
21. **[assume] Week banner content** — One calm Spanish line for the **same** Monday–Sunday week: session **count** when N > 0 (e.g. invitational «N sesiones esta semana»); calm empty when N = 0. Not a per-session title list (grill rejected list chrome). Week **row marks** carry the calendar; banner stays Headway-compact.  
    Revert: switch to a compact title list for that week only, still capped to the civil week.
22. **[assume] Missing Club crest** — If `Club.logoUrl` is null, omit the crest affordance (quiet). Never fall back to Team logo.  
    Revert: add a neutral geometric crest placeholder (still not Team logo).
23. **[assume] Cromo identity layout** — Keep tier label + streak line + claim; add centered photo/silhouette, Club crest badge (e.g. top leading), optional Playing Position line when set. Do **not** add player name or dorsal.  
    Revert: add first-name line under the photo if identity feels anonymous.
24. **[assume] Vivid tier palette** — In `apps/player` `globals.css`, named CSS variables for tiers 1–4: cool/neutral → amber → saturated warm → high (habit psychology, not FUT ratings). Wire `CROMO_TIER_SHELL` (or successor) to those vars instead of sage-only `color-mix` on `--brand`.  
    Revert: restore sage-mix shells in `streak-cromo.ts` / drop the new CSS vars.

## Not yet specified

- Exact OKLCH values for the four vivid tier tokens (assume #24 sets the story; polish can iterate in the cromo-identity child without a new epic decision).
- Microcopy polish for banner plurals / zero-week wording beyond the assume pattern (ship invitational Spanish; refine only if playtest flags guilt or noise).
- Whether CONTEXT glossary from the grill is already on the merge base when children land (procedural: land missing English glossary lines with the first related PR).

## Out of scope

- Changing Recoverable Streak to attendance or “scheduled is enough”.
- Guardian excused-request workflow.
- Fine playing positions, dorsals, FUT attributes, share/export of cromo.
- Team logo as crest; staff Wellness tarjeta redesign ([Team Wellness player cards as vertical cromos](https://linear.app/jesus-guti-workspace/issue/JES-88/team-wellness-player-cards-as-vertical-cromos)); new player font; shared design-system brand hue fork.
- New player routes; Headway bottom nav; floating session player bar from reference shots.
- Recutting tier thresholds (3 / 7 / 14).
- Public streak leaderboards / shame boards.
- Aligning staff overview streak chips with the new player pill (unless a one-line display reuse is trivial).
- Implementation PRs under this epic id — children only.
