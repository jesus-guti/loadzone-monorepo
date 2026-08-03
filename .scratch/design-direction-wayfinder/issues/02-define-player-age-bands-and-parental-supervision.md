# Define player age bands and parental supervision

Status: closed
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee: orchestrator
Blocked by:

## Question

Given the standing preference that `apps/player` is **player-first and age-adaptive** with parental supervision as a separate layer, what are the age bands, autonomy rules, language register, and parent boundaries?

Decide at least:

1. Age bands (or capability tiers) the product will recognize.
2. What each band can do alone vs what requires an adult present or adult confirmation.
3. Tone and reading level of Spanish UI copy per band (or a single adaptive strategy).
4. What parents can see, receive, or approve — without designing a full parent-portal architecture yet (that remains fog until this answer sharpens it).
5. How staff visibility differs from parent visibility for the same check-in data.
6. Explicit anti-patterns: co-experience-as-default, teen-only assumptions, guilt/punishment copy, or treating parents as the primary daily user.

This ticket should produce vocabulary safe to add to `CONTEXT.md` if new domain terms emerge (e.g. Guardian, Assisted Check-in).

## Comments

### 2026-08-03 — Resolution (orchestrator)

Closed from locked planning map `.scratch/dd-02-age-bands/map.md` (`DD-02: ok`). Full artifact:

→ [resolutions/player-age-bands-and-parental-supervision.md](../resolutions/player-age-bands-and-parental-supervision.md)

**Answers to Question bullets:**

1. **Age bands:** three capability tiers — **Assisted** (~under 10), **Guided** (~10–15), **Independent** (16+; Parental Supervision Layer off by default at 18+; 16–17 Guardian escalation optional by club policy).
2. **Autonomy:** Assisted expects an adult present (Assisted Check-in) but no approval gate; Guided may check in alone with post-hoc supervision; Independent operates alone. Player remains primary operator in all bands. Routine DailyEntry is never gated on Guardian approval.
3. **Spanish copy:** one adaptive strategy on the same component tree — Assisted (short/concrete, no load jargon), Guided (plain Spanish), Independent (slightly denser wellness labels). Not N copy products.
4. **Guardian see / receive / approve:** see completion + wellness/injury alerts; receive miss/escalation notifications (channels → DD-06); approve nothing on the routine path. No parent-portal architecture in this effort.
5. **Staff vs Guardian:** staff = full DailyEntry + load + injury; Guardian = care slice (completed, escalated flags, injury) without load ratios, staff notes, or peer comparison.
6. **Anti-patterns:** co-experience-as-default; teen-only autonomy; guilt/punishment copy; parents as primary daily users; childish leaderboards/badge spam; full parent-portal build here.

**Glossary proposed:** Age Band, Guardian, Assisted Check-in, Parental Supervision Layer.

**Deferred to DD-06:** reminder consent, notification channels, streak recovery, escalation thresholds.
