---
title: "Buy domains and configure DNS for Vercel"
status: open
labels: wayfinder:task
blocked-by: ["03-domain-strategy"]
---

## Question

Purchase the chosen domains and configure DNS to point to Vercel.

Tasks:
1. Buy the root domain (e.g., `loadzone.app`) from a registrar (Cloudflare, Namecheap, etc.)
2. In Vercel dashboard for each project:
   - `loadzone-app` → Domains → add `app.tudominio.com`
   - `loadzone-player` → Domains → add `player.tudominio.com`
3. Vercel will provide DNS instructions (CNAME records or nameserver delegation)
4. Add the DNS records at your registrar
5. Wait for DNS propagation (5 min–24h)
6. Verify SSL certificates are provisioned automatically by Vercel
7. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_PLAYER_URL` in Vercel env vars to the real domains
