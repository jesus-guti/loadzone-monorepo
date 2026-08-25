# Streak Cromo — team rank seal + dorsal overprint

**Status:** product reversal from ticket `01-player-shirt-number.md` (that ticket put the dorsal in the ink seal).  
**Date:** 2026-08-25

## Layout (production)

| Surface | Source | Treatment | Empty |
|---|---|---|---|
| Footer **ink seal** (lab **variant A**) | Team Recoverable Streak **rank** | `#` + position, 25° tilt, arcs `RACHA DEL EQUIPO` / `DE N` | Omit when this Player’s streak is 0 |
| Portrait **overprint** (lab **variant C** — “Sobreimpreso”) | `Player.shirtNumber` | Oversized hollow numeral on the photo, 25° tilt, bottom-left of the well | Omit when null — no «Sin dorsal» |
| Footer **LOADZONE pill** | This Player’s streak days | Unchanged | — |
| Footer **bottom-left** | `Team.name` | xs cromo serif; wrap or shrink so it stays under the pill, not over it | Omit when empty |

`#1` = longest **Recoverable Streak** among non-archived Players on the same **Team** (competition ranking: ties share the best place). Rank is identity teaser, not a public shame board.

## Variant C reminder (do not re-open `prototype-rank-stamp`)

Lab C printed the **rank** as a giant hollow stroke numeral on the portrait (`text-[4.5rem]`, `WebkitTextStroke`, `text-white/25`, rotated). Production reuses **that numeral treatment** for the **dorsal**, not for rank. Rank stays in the A seal. Do not bring back the C caption `RACHA · EQUIPO` / `de N` beside the overprint — that copy belongs on the seal.

Closed lab path (deleted): `apps/player/app/[token]/prototype-rank-stamp/variant-c-overprint.tsx`.
