# 01 — Minimal create-Session form with Match Day title

**Status:** needs-info
**Labels:** Feature · plan:hitl · risk:med
**Blocked by:** None — can start immediately. Related: JES-118 (Match Day labels when the week has no match). Do not block on it; the create form uses the Saturday assumption below until JES-118 settles the microcycle headers.

`plan:hitl` · `risk:med` · area: apps/app/sessions

## What Jesús asked

> Formulario de crear session:
> titulo fuera pasas a rellenarse solo con el matchday -2 o lo que sea
> tipo, ubicacion?, contrincante, local visitante, hora de inicio
> el resto de campos se eliminan, que hacemos cuando no hay partido puesto y no sabemos lo match day? una idea es asumir que es el sabado pero recordar que no hay partido puesto esa semana

## What I understand

The create-Session screen (`apps/app/features/sessions/components/session-form.tsx`) asks the preparador to type a title and then fill visibility, notes, start and end, recurrence, reminders, and exercises. Product direction wants a minimal create form and Match Day language. The title should leave the form body and fill itself from the session's Match Day offset (for example `MD-2`). The body keeps type and location, plus opponent, home/away, and start time. Everything else leaves the create screen.

`TeamSession` today has `title`, `type`, `location`, `startsAt`, `endsAt`, and the fields this ticket removes from the form. It has no opponent and no home/away. The short grill was cancelled; the forks below are the recommended reading, still open for the one product decision.

**Assumptions taken**
- "Título fuera" means the title is no longer a field inside the form: it is filled with the Match Day label for the session's civil day (`MD`, `MD-1`, `MD-2`, …) and the preparador can still edit it before save.
- Opponent, home/away, and start time show only when type is match (`MATCH`). Training, recovery, and other keep type, location, and start time.
- Location stays (the "?" in the ask reads as uncertainty, not as "drop it").
- Removed from **create** only: visibility, notes, end time, recurrence, pre/post reminders, the exercise builder, and "Guardar y crear ejercicio". Edit Session (`edit-session-form.tsx`) is unchanged. Persistence of removed fields keeps today's defaults so existing sessions and edit still work.
- Start time replaces the datetime pair as the only clock the preparador sets. End time is derived from the existing default duration already passed into the form, not typed.
- A week that already has a match Session uses that match as MD and titles the new session from its offset.

**Open questions** (plan:hitl)
- Week with no match Session, so MD is unknown. Jesús's idea: treat Saturday as MD and surface that no match is scheduled that week. → recommendation: do that. Title prefills as if Saturday were MD, and the create screen states in Spanish that no match is set that week. Revisit only the label rule if JES-118 chooses a different empty-week header; do not wait on JES-118 to ship the form.

## What to build

On create Session, the preparador sees a title already filled with the Match Day label for the day they are scheduling, outside the field group, and can overwrite it. The form asks for type and location, and the start time. When type is match, it also asks for opponent and whether the match is home or away. Saving creates the Session with that title and those facts. Visibility, notes, end, recurrence, reminders, and exercises are not on this screen. If the Monday–Sunday week of the start date has no match, the title still prefills from a Saturday MD and the screen says that no match is scheduled that week.

## No-goals

- Do not change the edit-Session form.
- Do not add staff "create Exercise" on this screen.
- Do not redesign microcycle / Carga headers (that is JES-118).
- Do not invent a season-long fixture calendar; the Saturday assumption is only a create-form fallback.
- Do not remove `endsAt`, visibility, notes, recurrence, or reminders from the database.

## Acceptance criteria

- [ ] Opening create Session shows a title prefilled with the Match Day label (for example `MD-2`) for the chosen day, editable, outside the rest of the fields.
- [ ] The create form shows type, location, and start time. Opponent and home/away appear only when type is match.
- [ ] Visibility, notes, end time, recurrence, reminders, exercise builder, and "Guardar y crear ejercicio" are absent from create.
- [ ] Saving a training session persists title, type, location, and start; end is stored without the preparador typing it.
- [ ] Saving a match session also persists opponent and home/away.
- [ ] On a Monday–Sunday week with no match Session, the title prefills against Saturday as MD and the screen shows that no match is set that week.
- [ ] On a week that has a match Session, the title offset counts from that match, not from Saturday.
- [ ] Edit Session still shows its current fields.

## Blocked by

None — can start immediately.
