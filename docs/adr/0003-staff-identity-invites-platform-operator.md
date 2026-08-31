# Staff identity: invites, not self-signup; Super Admin is a platform operator

Staff Users join a Club only via **Staff Invitation** (one-time email link, then they set a password). There is no public staff sign-up and no temporary-password / `mustChangePassword` path. A Coordinator of that Club (or a Super Admin) invites Coordinator or Staff; accepting an invite on an existing email attaches another Membership (one User, many Clubs). Super Admin is a platform flag on User, not a Membership: they create Clubs, invite the first Coordinator, revoke/repair, and may change a User’s email, all inside the staff app without impersonating another session. Forgot-password is self-service email; logged-in Users change password in settings. Public “first Coordinator creates the Club” signup is deferred until a sales motion.

## Considered options

- **Self-signup or mixed onboarding now** — rejected until we sell Clubs; operator creates the Club and invites.
- **Temporary password + forced change** — rejected; the invite and reset links already choose the password.
- **Impersonation for support** — rejected; the operator acts on the Club, not inside someone else’s session.
- **Super Admin as implicit Coordinator of every Club** — rejected; platform axis stays separate from Membership.
