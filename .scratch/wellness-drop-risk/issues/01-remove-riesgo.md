# 01 — Remove Riesgo from Team Wellness

**Status:** ready-for-agent
**Labels:** Improvement · plan:direct · risk:low
**Blocked by:** None — can start immediately

`plan:direct` · `risk:low` · area: apps/app/wellness

## What Jesús asked

> quitar riesgo

## What I understand

Team Wellness still shows a Riesgo metric: the player card (`team-wellness-player-card.tsx`), the comparison list, the comparison table, and `RiskScale`. Staff should not see it. The short grill was cancelled; this ticket takes the recommended reading: hide the metric in the staff Wellness surfaces, leave stored stats alone.

**Assumptions taken**
- Remove the visible Riesgo label, scale, and "Riesgo alto" chip from tarjetas, the mobile list, and the desktop table.
- Do not drop `riskLevel` from the database or stop computing it in this ticket.
- `getDailyPlayerState` must not treat HIGH/CRITICAL risk as ALERT once the metric is gone; wellness alerts and physio alert still count.
- Player-app check-in is unchanged.

## What to build

On Team Wellness, tarjetas, Lista móvil, and the comparison table no longer show Riesgo. A high stored risk level alone does not mark the player as Alerta. Recovery, energy, soreness, sleep, RPE, and physio alert stay as they are.

## No-goals

- Do not delete risk columns or the risk calculation job.
- Do not remove other wellness metrics.
- Do not change the player app.
- Do not redesign the card layout beyond the gap left by Riesgo.

## Acceptance criteria

- [ ] Tarjetas show no "Riesgo" label, risk scale, or "Riesgo alto" chip.
- [ ] The comparison table and the mobile list have no Riesgo column or cell.
- [ ] A player whose only signal is `riskLevel` HIGH or CRITICAL is not shown as Alerta.
- [ ] A player with a wellness or physio alert is still shown as Alerta.
- [ ] A regression test covers the state rule without risk.

## Blocked by

None — can start immediately.
