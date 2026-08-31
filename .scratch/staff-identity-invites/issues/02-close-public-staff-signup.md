# 02 — Close public staff sign-up

**What to build:** Nobody on the public internet can create a staff User via sign-up or register. Sign-in stays. Marketing and sign-in should not offer “crear cuenta” for staff. The only ways in are Staff Invitation (01) and existing Super Admin bootstrap.

**Blocked by:** 01 — Coordinator invites; invitee joins the Club

**Status:** ready-for-agent

- [ ] Register/sign-up HTTP and pages reject or are removed; tests that expected a successful public register now expect refusal.
- [ ] Sign-in and invite-accept still work.
- [ ] No leftover sign-up entry from the marketing site into staff register.
