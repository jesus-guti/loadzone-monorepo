---
title: "Decide domain strategy"
status: closed
labels: wayfinder:grilling
blocked-by: []
---

## Question

What domains / subdomains should we buy for production?

## Resolution

- **Root domain**: `loadzone.app` (already owned, Cloudflare)
- **Staff app**: `app.loadzone.app`
- **Player app**: `player.loadzone.app`
- **Root redirect**: `loadzone.app` → `app.loadzone.app` (temporary; landing page later when `apps/web` is developed)
