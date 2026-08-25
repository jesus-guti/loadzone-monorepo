# 01 — Player shirt number on Streak Cromo seal

**Status:** superseded for cromo layout — see `cromo-rank-and-dorsal.md` (seal = Team streak rank; dorsal = variant C overprint). Column + staff forms from this ticket remain.
**Labels:** Feature · plan:hitl · risk:med
**Blocked by:** None — can start immediately

`plan:hitl` · `risk:med` · area: packages/database + apps/player + apps/app

## What Jesús asked

> Cerramos esto. Mantenemos variante A y la variante. Vamos a guardar un ticket aparte para transformar ese número como número del jugador y añadiríamos una fila, una columna a la base de datos de jugador para añadir el número y que quede chulo. Es decir, guarda ese prototipo.
>
> leave in scratch

## What I understand

The rank-stamp lab is closed. **Variant A** (ink seal, 36px, 25° tilt, circular `RACHA DEL EQUIPO` / `DE N`, `#` + numeral in the centre) is the visual to keep. The numeral is **not** Team streak rank in product — it becomes the Player’s **shirt number**. Persist that as a new Player column. Do not fold the lab into production cromo until this ticket ships.

**Assumptions taken**
- Column name `shirtNumber` (`Int?`) on `Player` — optional so existing roster rows stay valid.
- Staff set it on the Player profile; the public check-in cromo only reads it.
- When `shirtNumber` is null, omit the seal (same empty state as “Sin puesto todavía” in the lab).
- Unique-per-Team is **not** enforced in v1 — amateur squads reuse numbers; uniqueness can wait.

**Open questions**
- Unique `@@unique([teamId, shirtNumber])`? → recommendation: **no** in v1; optional later if staff want collisions blocked.

## What to build

Staff can store a Player shirt number. After check-in, the Streak Cromo footer (replacing the duplicate fire disc) shows the Variant A rubber seal with that number, rotated 25°, hairline rings and circular copy. Source of truth is `Player.shirtNumber`, not streak rank.

## No-goals

- Do not ship Team streak ranking (`#1` = longest racha) on the cromo.
- Do not promote prototype variants B/C.
- Do not put the player token in any shirt-number URL or log.
- Do not add shirt number to staff wellness tables unless needed to *set* the field.

## Prototype capture (primary source)

- Path: `apps/player/app/[token]/prototype-rank-stamp/`
- Winner: **A — Sello de tinta** (`variant-a-ink-seal.tsx`)
- Lab URL: `/{token}?stamp=A&rank=1&rot=25`
- Losers: B plate, C overprint — keep in the lab folder until this ticket folds A into `streak-cromo.tsx`.

## Acceptance criteria

- [ ] Prisma `Player` has optional `shirtNumber` (`Int?`); migrate existing rows as null.
- [ ] Staff can set and clear the number on the Player they already edit.
- [ ] Production Streak Cromo uses Variant A seal with `#` + `shirtNumber` when set; no seal when null.
- [ ] Fire disc is not duplicated on the cromo (header pill + LOADZONE pill remain the streak count).
- [ ] Lab tree `prototype-rank-stamp/` is removed from the player app after A is rewritten into production (not copy-pasted as throwaway).

## Blocked by

- None — can start immediately
