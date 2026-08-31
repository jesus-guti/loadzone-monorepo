# Staff identity: invitations, Club membership, platform operator

Domain: [CONTEXT.md](../../CONTEXT.md). Shape: [ADR 0003](../../docs/adr/0003-staff-identity-invites-platform-operator.md).

## Problem Statement

The staff app cannot be opened to real Clubs. There is public sign-up that creates a User with no Club Membership, no Staff Invitation flow, no forgot-password, and no way for a Coordinator to add coaches. “Admin” is not a role: Coordinators run a Club; Super Admin is a platform operator who must create Clubs and repair stuck Clubs without impersonating people. Until staff Users can be invited, join, reset a password, and leave a Club safely, LoadZone is not launchable.

## Solution

Staff Users exist only through Staff Invitation (email, one-time link, they set a password) or through existing Super Admin bootstrap. Coordinators invite Coordinator or Staff into their Club; Super Admin does the same for any Club and is the only one who creates Clubs. One User (one email) can hold Memberships in several Clubs. Memberships see all Teams of that Club. A Club always keeps a Last Coordinator. Forgot-password and in-settings password change exist; there is no temporary password and no must-change flag. Super Admin may change a User’s email and grant Super Admin to another User. Public register/sign-up is closed.

## User Stories

1. As a Super Admin, I want to create a Club in the staff app, so that a real organisation exists before anyone is invited.
2. As a Super Admin, I want to send a Staff Invitation for the first Coordinator of that Club, so that the Club can run without me holding a Membership.
3. As a Super Admin, I want to pick which Club I am operating, so that I can invite or revoke without being that Club’s Coordinator.
4. As a Super Admin, I want to invite Coordinator or Staff into any Club, so that a Club that cannot invite itself can be unblocked.
5. As a Super Admin, I want to revoke a Membership in any Club (except breaking Last Coordinator), so that I can remove access when support requires it.
6. As a Super Admin, I want to change STAFF ↔ COORDINATOR on an existing Membership, so that I can fix roles without a new invite.
7. As a Super Admin, I want to change a User’s login email, so that a mistyped or dead mailbox does not trap the account.
8. As a Super Admin, I want to grant Super Admin to an existing User, so that another operator can exist without a new bootstrap.
9. As a Super Admin, I do not want Coordinators to grant Super Admin, so that Club staff cannot escalate to the platform.
10. As a Super Admin, I want to act as operator rather than impersonate a User session, so that support never shares someone else’s login.
11. As a Coordinator, I want to invite a person by email as Staff, so that another coach can use the staff workspace.
12. As a Coordinator, I want to invite a person by email as Coordinator, so that the Club can have more than one person who invites.
13. As a Coordinator, I want the invitee to receive a one-time link and choose their own password, so that I never handle their password.
14. As a Coordinator, I want a pending invitation to expire, so that a leaked old link stops working.
15. As a Coordinator, I want to resend a pending invitation (new token), so that a lost email is recoverable.
16. As a Coordinator, I want to cancel a pending invitation, so that a wrong address never joins.
17. As a Coordinator, I want at most one pending invitation per email per Club, so that I am not managing duplicate links.
18. As a Coordinator, I want inviting an email that already has a User to attach a Membership on accept, so that a physio who works two Clubs uses one login.
19. As a Coordinator, I want invited staff to see every Team in the Club, so that I am not assigning Teams in this wave.
20. As a Coordinator, I want to see current Memberships and pending invitations for my Club, so that I know who has access.
21. As a Coordinator, I want to revoke a Staff Membership, so that someone who left the Club cannot open the workspace.
22. As a Coordinator, I want to revoke another Coordinator Membership when they are not the Last Coordinator, so that leadership can change.
23. As a Coordinator, I want revoke of the Last Coordinator to be refused, so that the Club cannot lose the ability to invite.
24. As a Coordinator, I want to promote Staff to Coordinator in place, so that I do not revoke and re-invite.
25. As a Coordinator, I want to demote a Coordinator to Staff in place when they are not the Last Coordinator, so that privileges can shrink.
26. As a Coordinator, I do not want Staff to invite, revoke, or change roles, so that only Coordinators govern access.
27. As Staff, I want to sign in with email and password after accepting an invite, so that I can work in the Club.
28. As Staff, I want my User to remain if my Membership is revoked, so that I can still use another Club or accept a later invite.
29. As Staff, I want “forgot password” to email me a one-time link, so that I can set a new password without a Coordinator.
30. As a signed-in User, I want to change my password in account settings, so that I can rotate credentials while logged in.
31. As a signed-in User, I do not want to change my own email in this wave, so that identity changes stay with Super Admin.
32. As an invitee, I want an invalid or expired link to fail clearly, so that I am not stuck on a blank page.
33. As an invitee who already has a User, I want accepting to add the Club Membership and keep my existing password unless the accept flow is “set password” only for new Users, so that I am not forced to reset when joining a second Club.
34. As a new invitee (no User yet), I want the accept page to set password (and name if missing), so that I can sign in afterwards.
35. As anyone on the public internet, I want staff sign-up and open register to be gone, so that I cannot create an orphan User.
36. As a Super Admin minted at bootstrap, I want that path to remain, so that a fresh environment still has a platform operator.
37. As a Coordinator, I want product copy in Spanish for invite/member UI, so that staff language matches the rest of the app.
38. As a Super Admin, I want Club creation and member administration in the same staff app, so that I do not run a separate console.
39. As Staff with only a STAFF Membership, I want team creation to stay forbidden (unless Super Admin), so that existing workspace rules still hold.
40. As a Coordinator, I want creating Teams to remain allowed, so that invitation work does not weaken current Coordinator powers.
41. As a User with Memberships in two Clubs, I want the existing Club/Team switcher to keep working, so that multi-club is not a new shell.
42. As a Super Admin without a Membership in the Club I created, I still want to invite into it, so that operator privilege is not Membership-shaped.
43. As a Coordinator, I want resend to invalidate the previous invite token, so that only the latest link works.
44. As security-conscious staff, I want invite and reset tokens stored hashed, so that a database leak is not live login links.
45. As a User resetting password, I want the reset token to be single-use, so that replay does not work.
46. As a Coordinator, I want inviting my own Club only, so that I cannot add people to another organisation.
47. As Staff, I want a revoked Membership to stop the staff shell for that Club on the next session refresh, so that access ends promptly.
48. As a Super Admin changing email, I want the new email to be unique, so that I cannot collide with another User.
49. As an invitee, I want the accept page to work while signed out, so that a new coach does not need an account first.
50. As a signed-in User opening an invite for a Club I already belong to, I want a no-op or clear message, so that duplicate Memberships are not created.
51. As a Super Admin, I want listing Clubs I can operate (all Clubs), so that I can find a tenant to repair.
52. As a Coordinator, I do not want a self-signup “create Club” button in this wave, so that sales onboarding stays deferred.

## Implementation Decisions

- Follow ADR 0003: invite-only staff, link-then-set-password, no mustChangePassword, Super Admin as platform axis, no impersonation, deferred public first-Coordinator signup.
- Add a Staff Invitation record (Club, email, MembershipRole Coordinator or Staff, expiry, hashed token, issuer User, status pending/accepted/cancelled/expired). Do not reuse ad-hoc public register for this.
- Password reset uses a similar one-time hashed token on the User (or a dedicated reset record), not a Coordinator-issued temporary password.
- Accept invite: if no User, create User with passwordHash from the form; if User exists, attach Membership and do not require a new password. Always `hasAllTeams: true` for this wave; do not collect Team subsets.
- Unique pending invite per (Club, email). Resend rotates token and expiry and marks the previous token unusable.
- Last Coordinator: refuse Membership revocation or demotion that would leave the Club with zero Coordinator Memberships.
- Super Admin Club create: creates Club (slug/name) without requiring the operator to gain a Membership; then they invite the first Coordinator.
- Close public `registerUser` / sign-up page and marketing/header links into staff sign-up. Sign-in remains. Bootstrap Super Admin unchanged.
- Authorization: Coordinator only for their Club Membership; Super Admin for any Club and for create Club, change User email, grant Super Admin. Staff Membership cannot invite/revoke/change roles.
- Grant Super Admin: only callers who already have platform role Super Admin.
- Change email: Super Admin only; User settings keep name/photo/password, email read-only for the account owner.
- Outbound mail is an adapter (invite + reset). Domain module returns an email intent; the app sends. Tests assert intents, not SMTP.
- Session: NextAuth JWT already reloads Memberships on token refresh; revocation takes effect on that refresh. No impersonation APIs.
- UI (Spanish): Club settings (or equivalent) for Coordinators — members + pending invites; Super Admin overlay to pick/create Club and the same member operations; accept-invite and forgot-password/reset pages next to sign-in; account settings password change.
- Password policy stays aligned with current auth (minimum length already used at register/sign-in).

## Testing Decisions

- **Seam (one):** a staff-identity module (database package, Prisma-shaped client + clock) that exposes issue invite, resend, cancel, accept, revoke membership, change role, create club, change email, grant Super Admin, request/complete password reset, change password. Callers in auth/app are thin. Tests inject a fake client and clock; they assert results, Membership/User/Invitation rows, Last Coordinator refusals, and email intents. Do not assert React or NextAuth wiring in this seam.
- Good tests: observable outcomes (Membership exists, invite not pending, error code for Last Coordinator, no second pending invite, accept of existing email does not create a second User). Not token hashing internals except “unknown token fails / used token fails”.
- Prior art: domain tests with a mocked Prisma client (`promote-pain-alert`, injury actions); rule tests like `staffCanCreateTeam`; thin HTTP tests like register-route (replace register-success with register-rejected once sign-up is closed).
- Keep `staffCanCreateTeam` behavior; add sibling rules for invite/revoke/role-change/create-club if they stay pure functions, or fold those rules into the staff-identity module so there is still a single behavior seam.
- Do not add E2E as the primary seam for this spec.

## Out of Scope

- Player and Guardian Users; player public token remains the player-app path.
- Impersonation.
- Temporary passwords and mustChangePassword.
- Public self-signup or “first Coordinator creates Club”.
- Per-Team Membership on invite (`hasAllTeams` false / MembershipTeam picking).
- User self-serve email change; deleting Users; disabling a User globally (revocation is Membership-only).
- Invalidating all other sessions on password change (not chosen).
- A separate platform console app.

## Further Notes

- Product “admin” in conversation maps to Coordinator; do not add a MembershipRole named Admin.
- Linear publish: if MCP is available, this spec is the issue body; in-repo copy is `.scratch/staff-identity-invites/spec.md`.
- Implementation may split UI tickets later; this spec is the full behavior contract for one AFK agent or a sequenced PR.
