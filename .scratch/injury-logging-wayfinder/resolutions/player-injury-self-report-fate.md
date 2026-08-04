# Fate of player injury self-report

**Ticket:** [JES-33](https://linear.app/jesus-guti-workspace/issue/JES-33/decide-fate-of-player-injury-self-report)  
**Accepted:** `JES-33: A → pain alert` (2026-08-04)

## Answer

Keep the player path as a **non-period pain alert** (intake signal for staff).

- Does **not** open/close an official **Injury**, derive `INJURED`, or exempt wellness/reminders.
- Keep the existing session-footer Sheet + aviso framing (“Enviar aviso”) in v1.
- Staff triage (e.g. `/injuries` or successor); **promote to Injury** is an explicit staff action.
- Care Alerts (DD-06) may still fire for guardians when Parental Supervision Layer is on.
- `FormFillMoment.INJURY_REPORT` remains dormant hygiene for synthesis — not the product surface.

## Rejected alternatives

- Remove from v1  
- Defer (would leave a half-dead path)
