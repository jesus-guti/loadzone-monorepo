# 03 — List members, revoke, Last Coordinator, promote/demote

**What to build:** A Coordinator sees Memberships and pending invitations for their Club on Configuración → Club → pestaña Usuarios (same surface as SI-01 invite/list), can revoke a Membership (User remains), and can change STAFF ↔ COORDINATOR in place. The Last Coordinator cannot be revoked or demoted. Staff cannot run these actions. After revoke, that Club is gone from the person’s staff workspace on the next session refresh.

**Blocked by:** 01 — Coordinator invites; invitee joins the Club

**Status:** ready-for-agent

- [ ] Coordinator lists members and pending invites for their Club only.
- [ ] Revoke removes the Membership, not the User.
- [ ] Last Coordinator revoke/demote is refused.
- [ ] In-place role change works when it would not leave zero Coordinators.
- [ ] Staff callers are rejected; seam tests cover Last Coordinator and revoke.
