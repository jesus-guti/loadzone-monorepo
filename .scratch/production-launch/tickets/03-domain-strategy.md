---
title: "Decide domain strategy"
status: open
labels: wayfinder:grilling
blocked-by: []
---

## Question

What domains / subdomains should we buy for production?

Things to decide:
1. **Root domain**: `loadzone.com`? `loadzone.app`? `loadzonefc.com`? `getloadzone.com`?
2. **Subdomain structure**: `app.tudominio.com` for staff app, `player.tudominio.com` for player app?
3. **Root domain destination**: Should `tudominio.com` go nowhere for now, redirect to app, or show a landing page later?

Recommendation:
- `loadzone.app` is clean and available for most TLDs
- `app.loadzone.app` → staff
- `player.loadzone.app` → players
- Alternative: `.com` TLD with a prefix like `getloadzone.com` if the short name is taken
