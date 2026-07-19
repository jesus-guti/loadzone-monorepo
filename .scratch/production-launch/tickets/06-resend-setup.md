---
title: "Set up Resend for transactional email"
status: open
labels: wayfinder:task
blocked-by: ["03-domain-strategy"]
---

## Question

Configure Resend for transactional emails (registration, password reset via NextAuth).

Tasks:
1. Register at [resend.com](https://resend.com)
2. Verify your domain — add the required TXT record in your DNS provider
3. Create an API key
4. Save as `RESEND_API_KEY` env var in Vercel (project `loadzone-app`)

Note: Resend needs a verified domain for sending. If you don't have domains yet (ticket 03), do this after buying and configuring DNS.
