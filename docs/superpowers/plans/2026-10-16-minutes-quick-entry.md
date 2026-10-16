# Minutes quick entry (staff shell)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** Replace the top minutes banner with a mobile floating pill and desktop sidebar reminder that open the same fast minutes dialog, keeping PR #104 data rules.

**Architecture:** Server loader reuses `shouldPromptMinutes` and pending-session selection from the banner. Client `MinutesPromptProvider` shares dialog state between the mobile pill and sidebar panel. Training sessions use synchronized Tabata-style steppers (one `sharedMinutes` value). Match sessions link to `/sessions/[id]/minutos`.

**Tech Stack:** Next.js RSC, server actions, Dialog/Sheet from design system, Vitest for any extracted helpers.

## Global Constraints

- No DB migrations. Reuse `saveSharedMinutes`, `shouldPromptMinutes`, banner visibility rules.
- Spanish UI. Semantic tokens. Phosphor icons.
- Mobile pill above bottom nav; desktop panel styled like Primeros pasos.

## Tasks

- [ ] Extract `loadMinutesPromptState` from banner query logic
- [ ] Build Tabata stepper + quick dialog + provider
- [ ] Wire layout (remove banner) and sidebar panel
- [ ] Run vitest on minutes derive + typecheck app
- [ ] Screenshots and PR against `dev`
