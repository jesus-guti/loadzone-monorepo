# Map — Coordinator invites; invitee joins the Club (SI-01)

Local markdown map (this effort does not use Linear). Product is closed; this file is implementation routing, not a grill.

## Destination

A Coordinator of a Club can issue, resend, and cancel a Staff Invitation; the invitee accepts via a one-time hashed-token link, becoming a User (new password) or attaching a Membership (existing User, same password), always `hasAllTeams: true`. Staff cannot invite. Super Admin bootstrap is untouched. Mail is an email intent, not SMTP. Seam tests in `@repo/database` cover issue/accept/resend/cancel/expiry/multi-club.

## Notes

- Skills: wayfinder (this map), orchestrator autonomy matrix, LoadZone core (`pnpm`, `@repo/*`, Spanish UI / English repo docs, no player-token exposure).
- Constraints: do not re-grill product; do not close public sign-up (SI-02); do not revoke/role-change/Last Coordinator UI (SI-03); do not forgot-password (SI-04); do not Super Admin Club picker/create/invite-any-club (SI-05).
- Prior art: `promote-pain-alert` (injected Prisma-shaped client); `staffCanCreateTeam`; `registerUser` password min 8 / email lowercasing; unused NextAuth `VerificationToken` — do not reuse it.
- UI: existing primitives only; no new design-system components.

## Decisions so far

- **[auto] Dedicated `StaffInvitation` model, not `VerificationToken`** — Spec/ADR: Club, email (normalized lowercase), `MembershipRole` COORDINATOR|STAFF only, hashed token, expiry, issuer User, status pending/accepted/cancelled/expired. `VerificationToken` stays unused NextAuth leftover.
- **[auto] Staff-identity seam in `@repo/database`** — Spec testing decision: Prisma-shaped client + injected clock; issue/resend/cancel/accept (this unit). Auth/app callers stay thin. Tests inject fakes and assert rows + email intents, not React/NextAuth/SMTP. Pattern: `promote-pain-alert.ts`.
- **[auto] `staffCanInvite` sibling of `staffCanCreateTeam`** — True iff actor has COORDINATOR Membership on that Club. STAFF false. Super Admin bypass is SI-05, not this unit (ticket: Super Admin bootstrap unchanged).
- **[auto] Issue invite: Coordinator of that Club only** — Email + role. Refuse if pending invite already exists for (clubId, email). Refuse if a Membership already exists for that email’s User on that Club. Do not create User at issue time.
- **[auto] One pending per (Club, email)** — Partial unique index `@@unique([clubId, email])` is not enough (historical accepted rows). Enforce in the seam: at most one `PENDING` row per (clubId, normalized email). Unique on `tokenHash`.
- **[auto] Token: random secret, store SHA-256 hex, return raw once** — Link uses the raw token. Lookup hashes the presented token. Tests assert unknown/used/expired fail, not the hash algorithm.
- **[auto] Email is an intent** — Domain returns `{ kind: "staff_invitation", to, clubName, acceptUrl }` (or equivalent). App adapter sends later; SI-01 may no-op/log. Tests never call SMTP.
- **[auto] Accept: new User vs existing User** — No User: create User with `passwordHash` from form (min 8, max 128, same as `registerSchema`), optional name if missing. Existing User: attach Membership, do not require or change password. Always `hasAllTeams: true`; no MembershipTeam rows. Mark invite ACCEPTED (single-use).
- **[auto] Duplicate Membership refused** — If User already has any Membership on that Club (any role), accept/issue fails with a clear Spanish message. Do **not** change `Membership @@unique([userId, clubId, role])` in this unit; enforce in the seam so SI-03 can tighten the unique later.
- **[auto] Multi-club existing User** — Accept on a second Club creates a second Membership on the same User; no second User.
- **[auto] Resend** — Only PENDING, not expired (or treat expired as fail). Rotate token hash + expiry; previous raw token fails. Same email intent.
- **[auto] Cancel** — PENDING → CANCELLED; accept of that token fails. Do not delete the row.
- **[auto] Expiry** — `expiresAt < clock.now()` is expired: accept/resend fail clearly; optional lazy status flip to EXPIRED on those paths. No cron in this unit.
- **[auto] Password hashing injected** — Database package does not take bcrypt; accept receives `hashPassword: (plain) => Promise<string>` from `@repo/auth` (bcrypt cost 12). Keeps the seam fakeable.
- **[auto] Public accept page** — Unauthenticated route next to sign-in, e.g. `/invite/[token]`. Invalid/expired/cancelled/used: Spanish error, not a blank page. New invitee: password (+ name if empty). Existing User: confirm join, no password field. After success, point to sign-in (do not auto-session unless already wired cheaply; session wiring is not the seam).
- **[auto] Staff UI in Club settings** — Coordinator-only section: email, role, send; list **pending** invites with resend/cancel. Full Membership roster is SI-03. Staff Membership: hide/disable; server still rejects. Spanish copy. Existing settings primitives (`SettingsSection` / `SettingsRow`).
- **[auto] Super Admin bootstrap unchanged** — No change to minting platform operators; no Club-create; no invite-as-operator.
- **[auto] Close public register is SI-02** — Leave `registerUser` and sign-up page in place so this unit can land independently.
- **[assume] Invite TTL = 7 days from issue/resend** — Spec requires expiry, not a duration. Seven days matches common invite links. Revert: change a named constant (e.g. `STAFF_INVITATION_TTL_MS`) and tests that freeze the clock.
- **[assume] Session vs token identity** — Accept is bound to the invite email, not the browser session. If the signed-in User already has that Club Membership, show the duplicate/no-op message (story 50). A signed-in User whose email differs from the invite does not steal the Membership; the Membership still attaches to the invite email’s User. Revert: reject accept when `session.email !== invite.email` with an explicit “cierra sesión” message.
- **[assume] No Membership `(userId, clubId)` unique migration in SI-01** — Avoid a data-bearing unique change while dual-role rows are still theoretically allowed by Prisma. Revert: N/A (no migration); add `@@unique([userId, clubId])` in a later unit if SI-03 wants DB-level Last Coordinator safety.
- **[human] 2026-08-31 `ok todo`** — All SI-01 assumes stand. Implement.

## Not yet specified

None for this destination. SI-02–05 have their own maps.

## Out of scope

- Close public staff sign-up / `registerUser` (SI-02; spec stories 35, 77).
- Membership list of accepted members, revoke, Last Coordinator, in-place role change (SI-03).
- Forgot-password, in-settings password change, User self email edit (SI-04; stories 29–31).
- Super Admin create Club, operate any Club, change email, grant Super Admin, Club picker (SI-05).
- Player/Guardian Users; player public tokens.
- Impersonation; temporary passwords; `mustChangePassword`.
- Public “first Coordinator creates Club”.
- Per-Team Membership (`hasAllTeams: false` / MembershipTeam picking).
- Deleting or globally disabling Users.
- Invalidating other sessions on password change.
- Separate platform console.
- Real SMTP provider wiring (intent only).
- E2E as the primary test seam.
- New `@repo/design-system` primitives.
