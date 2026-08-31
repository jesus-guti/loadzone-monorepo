# 04 — Forgot password and change password in settings

**What to build:** A User who forgot their password gets a one-time email link and sets a new one (single-use, hashed token). A signed-in User changes password in account settings. Email in settings stays read-only for the owner. No mustChangePassword and no temporary passwords.

**Blocked by:** 01 — Coordinator invites; invitee joins the Club

**Status:** ready-for-agent

- [x] Forgot-password from sign-in sends a reset intent and completes with a new password.
- [x] Used or expired reset links fail; replay does not work.
- [x] Signed-in change password in Cuenta succeeds; email is not editable there.
- [x] Seam tests cover request/complete reset and change password without SMTP.
