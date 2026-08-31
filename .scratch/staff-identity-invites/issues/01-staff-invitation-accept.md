# 01 — Coordinator invites; invitee joins the Club

**What to build:** A Coordinator of a Club can send a Staff Invitation (Coordinator or Staff) by email. The person opens a one-time link, and either sets a password (new User) or keeps their password (existing User) while gaining a Membership on that Club with all Teams. Pending invites expire, can be resent (new token, old link dies) or cancelled; at most one pending invite per email per Club. Hashed tokens; mail is an intent the app sends. Invalid/expired links fail clearly. Staff cannot invite. Spanish UI for invite + accept. Super Admin bootstrap unchanged.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [x] Coordinator can invite Coordinator or Staff to their Club only; Staff cannot.
- [x] New invitee sets password, signs in, sees the Club (all Teams).
- [x] Existing User accepting attaches a Membership and does not create a second User or force a new password.
- [x] Duplicate Membership for the same Club is refused with a clear message.
- [x] Pending invite expires; resend rotates the token; cancel prevents accept; one pending per email per Club.
- [x] Seam tests cover issue/accept/resend/cancel/expiry/multi-club without SMTP.
