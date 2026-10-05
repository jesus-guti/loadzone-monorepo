# 02 — Match substitutions

**Status:** needs-info
**Labels:** Feature · plan:hitl · risk:med
**Blocked by:** None — can start immediately. Related to 01; not blocked by it.

`plan:hitl` · `risk:med` · area: apps/app/sessions

## Parent

None. Sibling of `.scratch/session-day-minutes/issues/01-session-day-duration-step.md`.

## What Jesús asked

> lo mismo para los partidos con el tema de poner los cambios y los minutos

Grill: duration (default 95) ships in 01. This ticket is the match changes. **Minutes played** are not typed by hand.

## What I understand

After a match, staff record each **Substitution** (who leaves, who enters, at which minute; a sending-off is an exit with no entry). **Minutes played** are derived from the **Match lineup**, those events, and stoppage. The glossary already fixes that model. The mobile step-by-step surface for entering a change is not designed yet, and there is no lineup or substitution persistence — only hand-typed `minutesPlayed` / `startedMinute` on attendance, unused by **Carga**.

**Open questions** (plan:hitl)
- What the preparador taps, in order, to record one change on a phone (who off, who on, minute, or sending-off). → recommendation: one player check-in-style step per fact, large targets, only after the match `endsAt`, on the match session screen. Do not start until that sequence is confirmed.

## What to build

On a match session, after the match has ended, the preparador records substitutions on the phone. Each change names the player leaving, the minute, and the player entering, or marks a sending-off with no entry. **Minutes played** update from those events. The preparador never types a player’s final minutes.

## No-goals

- Do not implement the shared-minutes / full-match-length step (01).
- Do not keep hand-typed “Min. jugados” / “Min. entrada” as the way to set **Minutes played** once this ships.
- Do not add a formation editor beyond what a change needs if the lineup is still missing — call that out rather than inventing a pitch UI.
- Do not wire **Carga** to the derived minutes in this ticket.

## Acceptance criteria

- [ ] Blocked until the step sequence in the open question is confirmed. After that: a preparador can record a substitution and a sending-off on a phone-width match session, and each involved player’s **Minutes played** follow the glossary (bench stays 0 until they enter; a sending-off stops that player and credits nobody else with the rest).

## Blocked by

None — can start immediately. Do not implement until the open question is answered.
