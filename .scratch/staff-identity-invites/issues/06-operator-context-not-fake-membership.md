# 06 — Super Admin operates via operator context, not a fake Membership

**Status:** ready-for-agent
**Labels:** Improvement · plan:auto · risk:med · agent-forged
**Blocked by:** 05 — Super Admin creates Clubs and operates without impersonation (shipped as PR #97)

`plan:auto` · `risk:med` · area: apps/app/auth-context

## Parent

Staff identity invites — [spec.md](../spec.md) · [ADR 0003](../../../docs/adr/0003-staff-identity-invites-platform-operator.md)

## What Jesús asked

> prepara issue de follow-up y mergea esta

Follow-up from review of PR #97 (SI-05): the platform domain is acceptable; the shell coupling is not.

## What I understand

SI-05 shipped a working operator path by stuffing Super Admin into `StaffContext` with a synthetic Membership (`operatorMembership`: empty `id`, `role: "STAFF"`, `hasAllTeams: true`) and a sentinel Club named `"Plataforma"` with `club.id === ""`. Layout then special-cases empty club id for recommended-setup facts. Email change and grant Super Admin take raw User UUIDs.

The follow-up keeps the same operator capabilities (create Club, pick operating Club via cookie, invite/revoke/roles, change email, grant Super Admin, no impersonation) but gives the operator an explicit operating-club slot instead of pretending they are Club staff.

**Assumptions taken**
- Behaviour of SI-05 stays: Super Admin with zero Memberships can enter the app; Last Coordinator still applies; `staffCanCreateTeam` rule unchanged for real Memberships.
- User picker for email/grant can be a Club-scoped list (operating Club’s `listClubAccess`) plus email search — not a new global User directory product.
- Empty operating Club (zero Clubs in the system) is a first-run state: product routes that need a Club redirect to Settings → Plataforma, not a fake Club.

## What to build

A Super Admin session has `platformRole` plus optional `operatingClub` (from `loadzone_active_club`, validated against `listOperableClubs`). They do **not** get a Membership row in context unless they actually hold one for that Club. Product chrome that requires a Club (teams, seasons, onboarding, recommended setup) only runs when `operatingClub` is a real Club. Settings → Plataforma remains the place to create a Club and pick the operating Club. Change-email and grant Super Admin use email or a member list, not pasted User ids.

## No-goals

- No impersonation session.
- No Super Admin as implicit Coordinator of every Club.
- No public first-Coordinator signup.
- No new operator console app.
- No change to Coordinator/Staff Membership rules or Last Coordinator.

## Acceptance criteria

- [ ] Super Admin with no Memberships can sign in; `StaffContext.membership` is absent unless they have a real Membership for the operating Club.
- [ ] There is no sentinel Club with empty id / name `"Plataforma"`. Zero Clubs → platform settings only; product routes redirect there.
- [ ] Layout does not branch on `club.id.length === 0` dummy facts; recommended-setup and team/season assembly skip when there is no operating Club.
- [ ] Cookie `loadzone_active_club` still selects the Club used for invite/revoke/roles; actor remains `{ kind: "platform" }` when they are not a Coordinator of that Club.
- [ ] Change email and grant Super Admin do not require typing a User UUID (search by email or pick from the operating Club’s access list).
- [ ] Coordinator still cannot grant Super Admin; Last Coordinator still refused for operator revoke/demote.
- [ ] Existing tests for create Club, list Clubs, change email, grant Super Admin, and platform actor on member ops still pass; assembly tests cover operator-without-membership.

## Blocked by

- None after #97 is on `dev` — can start immediately.
