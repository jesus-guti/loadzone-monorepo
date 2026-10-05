# 01 — Session-day duration step

**Status:** ready-for-agent
**Labels:** Feature · plan:auto · risk:med
**Blocked by:** None — can start immediately

`plan:auto` · `risk:med` · area: apps/app/sessions

## What Jesús asked

> importante retomar el tema del tiempo de session, necestiamo un interfaz sencilla en admin para que el dia de la sesion o partido se puedan rellenar estos datos, yo opto por un floating botom banner o algo asi que te aparezca cuando termine la session y que al clickar se abra un dialog y con un field de un numero para poner el tiepo estilo la aplicacion de player, es decir con maxima ux y mobile first, ya que se hara casi siempre desde el movil, lo mismo para los partidos con el tema de poner los cambios y los minutos, en ambos campos default a 80 y 95 y luego unos inconos grandes de mas y menos para aumnetar y disminuir miunutos

Grill: the number step should follow the player check-in step-by-step format. The banner appears only after the session end time. This ticket is duration only; substitutions are a later ticket.

## What I understand

On the staff session screen, after `endsAt`, a bottom banner offers the preparador one duration for that day. Training, recovery, and other non-match sessions edit **Shared session minutes** (default 80). A match edits **Full match length** (default 95). Tapping the banner opens one full-screen step in the same spirit as the player check-in: one value, large type, large plus and minus, mobile first. Saving stores that single number for the Session. **Minutes played** stay derived later from the **Match lineup** and each **Substitution**; this step does not type them.

There is no shared-minutes column today. `TeamSession` only has `startsAt` / `endsAt`. Match attendance still has hand-typed `minutesPlayed` / `startedMinute`, and **Carga** does not read them.

**Assumptions taken**
- The banner lives on the session detail screen, and only once the current time is past that session’s `endsAt`.
- One step is enough: the only field is the duration. Copy and controls are Spanish, thumb-sized, and the preparador can type the number as well as step it.
- Non-match default 80 is **Shared session minutes**. Match default 95 is **Full match length** (a flat regulation-plus-stoppage total for this wave), not per-player minutes.
- Persist one integer on the Session, separate from `startsAt` / `endsAt` and from check-in duration. Unset stays the default until the preparador saves.
- Do not change **Team daily load** math in this ticket. Storing the number is enough.

## What to build

After a Session’s scheduled end, the preparador on that session screen sees a floating bottom banner. Tapping it opens one step: a large minute count with large plus and minus controls, starting at 80 for a non-match Session and 95 for a match. Confirming saves that Session’s duration. Reopening the step shows the saved value. Before `endsAt`, the banner is absent.

## No-goals

- Do not build **Substitution**, **Match lineup**, or per-player **Minutes played** (see 02).
- Do not replace the attendance form.
- Do not collect this on the player check-in. Player duration stays unused.
- Do not recompute **Carga**, **Team daily load**, or **PlayerDailyStats** from the new number.
- Do not add a shared design-system primitive; keep the step in `apps/app`.

## Acceptance criteria

- [ ] On a non-match session detail, before `endsAt`, no duration banner is visible.
- [ ] After `endsAt`, a bottom banner is visible on a phone-width viewport; tapping it opens one step whose value starts at 80 if nothing was saved.
- [ ] Plus and minus change the value by one minute; the preparador can also set the number directly; confirm persists it and a later open shows the saved value.
- [ ] A match session uses the same banner and step, starting at 95, and does not ask for substitutions or per-player minutes.
- [ ] `startsAt` / `endsAt` and attendance `minutesPlayed` are unchanged by saving this duration.

## Blocked by

None — can start immediately
