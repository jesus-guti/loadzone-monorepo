# Decide shared visual language and app divergence

Status: closed
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee: orchestrator
Blocked by:
- ./01-define-admin-experience-principles.md
- ./02-define-player-age-bands-and-parental-supervision.md

## Question

How should LoadZone’s visual system diverge between admin and player while staying one product family?

Decide at least:

1. Whether admin and player keep a shared sage hue family or split brand hues.
2. Radius, density, border, and elevation rules per app (building on current `globals.css` splits).
3. Typography: keep Geist everywhere, or give player a friendlier stack while admin stays dense/neutral.
4. Icon weight defaults and touch-target minima per app.
5. Motion: duration caps, allowed properties (`transform`/`opacity`), and `prefers-reduced-motion` behavior.
6. Light/dark defaults per app.
7. What to keep from today’s semantic tokens (`bg-*`, `text-*`, `brand`, `premium`, `danger`) vs what to rename or retire.
8. Explicit rejects: mandatory `#080A0A`, contradictory spacing lists, structural shadows on ordinary cards, legacy shadcn color tokens in product UI.

Output should be rule-ready language for `.cursor/rules/loadzone-design-system.mdc` and both apps’ token files — still without implementing CSS.

## Comments

### 2026-08-03 — Resolution (orchestrator)

**Answer:** One product family with a **shared sage hue** (~OKLCH 160–162). Apps diverge via density, radius, border presence, motion, and type scale/weight only — not split brand hues. Geist everywhere; Phosphor `fill` (admin) vs `regular`/`bold` (player); motion caps 200/300/500ms on transform/opacity with reduced-motion; admin light default and player light-first; keep semantic LoadZone tokens and retire legacy shadcn as product authoring; `--surface-*` stays internal; no per-Age-Band visual chrome forks.

**Artifact:** [shared-visual-language-and-app-divergence.md](../artifacts/shared-visual-language-and-app-divergence.md)

**Locked HITL:** Human `ok a todo` accepted recommendation A — shared sage family; diverge density/radius/motion only. Planning map: [dd-03-visual-language/map.md](../../dd-03-visual-language/map.md). All auto/assume decisions from that map are accepted without reopen.
