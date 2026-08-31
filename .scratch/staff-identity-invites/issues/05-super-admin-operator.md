# 05 — Super Admin creates Clubs and operates without impersonation

**What to build:** In the same staff app, a Super Admin creates a Club (no Membership required), picks any Club, and can invite, revoke, and change roles there (including the first Coordinator). They can change a User’s login email (unique) and grant Super Admin to another User. Coordinators cannot grant Super Admin. No impersonation.

**Blocked by:** 03 — List members, revoke, Last Coordinator, promote/demote

**Status:** ready-for-agent

- [x] Super Admin creates a Club and invites its first Coordinator without joining as Membership.
- [x] Super Admin can list Clubs and run member operations on a Club they do not belong to.
- [x] Super Admin can change a User email when the new address is free.
- [x] Super Admin can grant Super Admin; Coordinator cannot.
- [x] No impersonate-session capability ships.
