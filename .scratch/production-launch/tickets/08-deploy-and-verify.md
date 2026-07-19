---
title: "Deploy, verify, and production checklist"
status: open
labels: wayfinder:task
blocked-by: ["01-cleanup-dead-packages", "02-audit-env-vars", "04-provision-neon-db", "05-vercel-projects-setup", "07-buy-domains-and-dns"]
---

## Question

Final deployment and verification that everything works end-to-end.

Tasks:
1. Push to Git `main` branch → Vercel auto-deploys both apps
2. Verify builds succeed:
   - `app` builds without errors
   - `player` builds without errors
3. Verify core flows:
   - [ ] Staff can log in (auth)
   - [ ] Staff can view teams/players (DB connection)
   - [ ] Player check-in page loads with token URL
   - [ ] Player can submit daily entry (DB writes)
   - [ ] Image uploads work (Vercel Blob / storage)
   - [ ] Push notification prompt appears (VAPID)
4. Check Sentry dashboard for any errors
5. Set `AUTH_TRUST_HOST=true` in production
6. Verify SSL certificates are valid (auto-provisioned by Vercel)
7. **[Post-launch]** Clean up: remove any placeholder env vars, update `.env.example` files
