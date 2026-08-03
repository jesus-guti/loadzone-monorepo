# DD-02 — Define player age bands and parental supervision

Planning map for wayfinder grilling ticket
`.scratch/design-direction-wayfinder/issues/02-define-player-age-bands-and-parental-supervision.md`.
Parent effort: [LoadZone Design Direction](../design-direction-wayfinder/MAP.md).

## Destination

Decide age bands (capability tiers), autonomy rules, Spanish copy register, and parental-supervision boundaries for `apps/player` — vocabulary and product rules safe to feed DD-03 / DD-05 / DD-06 / DD-08 — without shipping code or designing a full parent portal.

## Notes

- **Domain:** root `CONTEXT.md`. Current player reality (read-only skim): token-link check-in, progressive question cards, pre/post + injury, streaks; **no** birth date, Age Band, or Guardian in schema today.
- **Standing preferences (effort-locked):** player-first age-adaptive; parental supervision as a **separate layer**; not joint family co-experience as primary; not teen-only autonomy; destination is **spec + backlog**; no full parent-portal architecture in this ticket.
- **Skills:** `/grilling`, `/domain-modeling`; design rules in `.cursor/rules/loadzone-design-system.mdc` (`apps/player` Airbnb density, large soft surfaces).
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not live-grill; do not close the wayfinder ticket from this planning wave.
- **Downstream:** hard-blocks DD-03 (player visual divergence), DD-05 (check-in prototype), DD-06 (reminders/streaks/escalation), and thus DD-08 synthesis.

## Decisions so far

### Auto

1. **[auto] Primary operator remains the Player** — Standing preference: check-in UX is player-first across all bands; Guardian helps or supervises, never becomes the default daily user.
2. **[auto] Anti-patterns (explicit rejects)** — Co-experience-as-default UI; teen-only autonomy assumptions; guilt/punishment copy for missed check-ins; parents as primary daily operators; childish competitive leaderboards / badge spam (parent MAP Out of scope); full parent-portal product build in this effort.
3. **[auto] Parental Supervision is a layer, not a co-app** — Scope for this ticket: visibility + notification + escalation boundaries. Account/auth model for Guardians, dedicated parent IA, and soft-approval product surfaces stay in parent-map fog until this answer sharpens them — not designed here.
4. **[auto] Reminder consent, anti-nag, streak recovery, and escalation thresholds** — Deferred to [Define reminders, streaks, and health escalation](../design-direction-wayfinder/issues/06-define-reminders-streaks-and-health-escalation.md) (DD-06); this ticket only supplies Age Band × autonomy so DD-06 can ask “who consents / who is notified.”
5. **[auto] Glossary candidates (English, for CONTEXT.md on resolution)** — Propose: **Age Band**, **Guardian**, **Assisted Check-in**, **Parental Supervision Layer**. Avoid “parent portal,” “family mode,” “teen app,” or “User” when meaning **Player** / **Guardian**.
6. **[auto] Persistence / DOB schema** — Out of this ticket’s deliverable (spec rules only). How Age Band is stored (DOB vs staff field) is implementation backlog after the design-direction map — not a blocker for DD-05 fidelity.

### Assume

7. **[assume] Spanish copy register = one adaptive strategy, not N copy products** — Same component tree and flow; Age Band drives reading level (Assisted: short sentences, concrete labels, no load jargon; Guided: plain Spanish; Independent: may use slightly denser wellness labels). Product UI stays Spanish per repo convention.  
   **Revert:** introduce separate per-band copy catalogs if DD-05 prototype shows Guided/Independent need a distinct voice that adaptive strings cannot cover.
8. **[assume] No per-check-in soft approval in the design-direction scope** — Routine DailyEntry submit is never gated on Guardian approval; supervision is post-hoc (see / notify / escalate).  
   **Revert:** add a soft-approval path only if HITL on parent boundaries chooses approval; otherwise keep deferred beyond this map.

### Hitl (locked 2026-08-03 — orchestrator `DD-02: ok`)

9. **[hitl→locked] Age Bands + autonomy:** three tiers — **Assisted** (~under 10: adult present / Assisted Check-in, no approval gate), **Guided** (~10–15: solo check-in + post-hoc supervision), **Independent** (16+: Parental Supervision Layer off by default at 18+; 16–17 Guardian escalation optional by club policy).
10. **[hitl→locked] Guardian see / receive / approve (no portal):** see check-in completion status + wellness/injury alerts; receive miss/escalation notifications (channels in DD-06); approve nothing in the routine path — supervision layer, not co-operator.
11. **[hitl→locked] Staff vs parent visibility:** staff = full DailyEntry + load + injury; Guardian = “care slice” (completed, escalated flags, injury) without load ratios, staff notes, or peer comparison.

### Human review (2026-08-03)

- **Orchestrator:** `DD-02: ok` — accept all auto/assume decisions and HITL recommendations A–C.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Age bands / capability tiers + indicative ages | `hitl` | Changes what end users can do; minors |
| 2 | Autonomy: alone vs adult present vs confirmation | `hitl` | Bundled with #1 — same product/privacy fork |
| 3 | Spanish copy register strategy | `assume` | Contained product pattern; reversible |
| 4 | Parent see / receive / approve (no portal) | `hitl` | Product capability + privacy/minors |
| 5 | Staff vs parent visibility for same check-in data | `hitl` | Privacy/minors + product |
| 6 | Anti-patterns + glossary terms | `auto` | Locked by MAP Notes / vocabulary hygiene |

## Not yet specified

- Guardian auth / account linkage and whether notification-only contacts need login.
- Exact field allow-lists for parent “care slice” vs staff full DailyEntry (graduates after HITL C + DD-06 escalation rules).
- Legal/consent copy and jurisdictional rules for processing minors’ wellness data (policy, not interaction spec).
- How Age Band is assigned in staff admin (DOB auto-suggest vs manual tier) at implementation time.
- Whether 16–17 Independent players keep optional Guardian escalation by club policy (nuance after HITL A).

## Out of scope

- Shipping age-adaptive UI or parent surfaces in app code during this wayfinder map.
- Full parent-portal IA, billing, or multi-child household product.
- Soft-approval workflows as a default (unless HITL explicitly reopens assume #8).
- Mapping FUT attributes to medical/performance scores; geolocation attendance; punishment UX (parent MAP).
- Implementing push, streaks, or escalation engines (DD-06 decides rules; later effort builds).
