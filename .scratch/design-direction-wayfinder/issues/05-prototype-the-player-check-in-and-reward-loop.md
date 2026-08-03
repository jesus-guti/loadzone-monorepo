# Prototype the player check-in and reward loop

Status: done
Labels: wayfinder:prototype
Type: prototype
Parent: ../MAP.md
Assignee:
Blocked by:
- ./02-define-player-age-bands-and-parental-supervision.md

## Question

Does the age-adaptive player experience feel calm, fast, and motivating when applied to a concrete check-in + reward-loop prototype?

Build a low-fidelity prototype (via `/prototype`) that shows:

1. One-question-at-a-time (or progressive) check-in suitable for the youngest supported band and a note on how older bands differ.
2. Large touch targets, plain Spanish, 1–3 minute total path.
3. Completion feedback and a **calm** streak/reward moment — no punishment for a missed day.
4. Where parental supervision surfaces (banner, silent escalation, or deferred) without making the parent the primary operator.
5. Optional football-identity teaser (card silhouette or attribute hint) that does **not** claim real medical/performance scoring.

Link the prototype as an asset. Resolve when the human accepts, rejects, or amends the player principles after reacting to the artifact.

## Artifact (2026-08-03)

Throwaway in-app lab on `apps/player` `[token]` route (production `SessionPage` when `?variant=` is absent).

### Files

- `apps/player/app/[token]/prototype-dd-05/` — lab components (`VariantAFocus`, `VariantBTimeline`, `VariantCReward`, switcher, stub copy)
- `apps/player/app/[token]/page.tsx` — gates on `?variant=`
- `apps/player/app/[token]/layout.tsx` — allows reserved lab token without DB
- Planning map: `.scratch/dd-05-player-prototype/map.md`

### How to view (one command)

```bash
pnpm --filter player dev
```

Then open (no seed DB required — reserved lab token):

- Focus: http://localhost:3003/cprototype000000000000001?variant=A&band=assisted
- Quiet timeline: http://localhost:3003/cprototype000000000000001?variant=B&band=guided
- Reward-forward: http://localhost:3003/cprototype000000000000001?variant=C&band=independent

Switcher (dev only): bottom bar cycles `A/B/C`; band chips + “Simular día perdido”. Keyboard `←` / `→`.

Indicative ages in the UI are **example / staff-configurable defaults**, not hard law.

### Resolve gate

Human accepts / rejects / amends player principles after reacting to the artifact. Prototype does **not** ship production behavior.

## Comments

### 2026-08-03 — implementer handoff

**Run**

```bash
pnpm --filter player dev
# → http://localhost:3003/cprototype000000000000001?variant=A&band=assisted
```

**Variants:** `A` Focus frame · `B` Quiet timeline · `C` Reward-forward. **Bands:** `assisted` (default) · `guided` · `independent`. In-memory stubs only — no `save-entry`, push, or streak backend.
