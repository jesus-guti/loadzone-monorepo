# 01 — Order Team Wellness tarjetas by severity

**Status:** ready-for-agent
**Labels:** Improvement · plan:direct · risk:low
**Blocked by:** None — can start immediately. Related: `.scratch/wellness-drop-risk/issues/01-remove-riesgo.md` (severity must not use risk).

`plan:direct` · `risk:low` · area: apps/app/wellness

## What Jesús asked

> ordenar tarjetas por gravedad

## What I understand

Team Wellness tarjetas render `players` in roster order (`team-wellness-workspace.tsx`). The preparador should see the worst check-ins first. The short grill was cancelled; this ticket takes the recommended reading.

**Assumptions taken**
- Only the Tarjetas grid is reordered. Lista (table and mobile list) stays in its current order.
- Severity uses the day's wellness alerts (recovery, energy, soreness, and the other check-in signals already in `getWellnessAlerts`), then injury/illness status. It does not use `riskLevel` — Riesgo is being removed.
- More alerts sorts earlier. Same alert count: injured or ill before the rest, then name A–Z.
- A player with no entry and no injury sits after anyone with an alert or an injury.

## What to build

On Team Wellness with Tarjetas selected, player cards are ordered from most severe to least: more wellness alerts first, then injured or ill players, then everyone else, with name as the tie-break. Reloading the same day keeps that order. Switching to Lista does not apply this order.

## No-goals

- Do not sort the comparison table or the mobile list.
- Do not add a sort control.
- Do not use Riesgo / ACWR / `riskLevel` as the sort key.
- Do not change alert thresholds.

## Acceptance criteria

- [ ] A player with more wellness alerts appears before a player with fewer on the tarjeta grid.
- [ ] With equal alerts, an injured or ill player appears before a healthy one; remaining ties follow name.
- [ ] A player with no alerts and no injury appears after players who have either.
- [ ] Lista order is unchanged.
- [ ] A unit test locks the order (alerts, then injury, then name) and does not read `riskLevel`.

## Blocked by

None — can start immediately.
