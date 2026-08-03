# Player age bands and parental supervision

Resolution for [Define player age bands and parental supervision](../issues/02-define-player-age-bands-and-parental-supervision.md).  
Source of truth for locked decisions: `.scratch/dd-02-age-bands/map.md` (orchestrator `DD-02: ok`, 2026-08-03).

**Scope of this artifact:** product vocabulary and interaction rules for design direction. No app code, no Guardian account/auth model, no schema/DOB persistence design, no full parent portal.

---

## Age Bands

Capability tiers for `apps/player`. Indicative ages guide assignment; the product rule is the tier’s autonomy, not a hard legal age cut alone.

| Age Band | Indicative ages | Autonomy |
|---|---|---|
| **Assisted** | ~under 10 | An adult is expected present for check-in (**Assisted Check-in**). Routine DailyEntry submit is **not** gated on Guardian approval. |
| **Guided** | ~10–15 | Player may complete check-in alone. **Parental Supervision Layer** applies post-hoc (see / notify / escalate). |
| **Independent** | 16+ | Player operates alone. Parental Supervision Layer is **off by default at 18+**. For **16–17**, Guardian escalation remains **optional by club policy**. |

**Primary operator:** across all bands the **Player** remains the daily operator. The Guardian helps or supervises; they are never the default daily user of `apps/player`.

---

## Guardian see / receive / approve

Boundaries for the Parental Supervision Layer **without** a parent-portal product:

| Capability | Rule |
|---|---|
| **See** | Check-in **completion status** and **wellness / injury alerts** (care-relevant signals). |
| **Receive** | Miss and escalation **notifications**. Channels, timing, consent, and anti-nag rules are **deferred to DD-06**. |
| **Approve** | **Nothing** on the routine DailyEntry path. Supervision is post-hoc — a layer, not a co-operator. Soft approval of each check-in is out of design-direction scope. |

Account/auth for Guardians, dedicated parent IA, and multi-child household product remain fog (parent map / later backlog).

---

## Staff vs Guardian visibility (care slice)

For the same check-in / DailyEntry data:

| Audience | Visibility |
|---|---|
| **Staff** (`apps/app`) | Full DailyEntry, load, and injury context needed for coaching and wellness operations. |
| **Guardian** | **Care slice** only: completed status, escalated flags, and injury-relevant signals. **No** load ratios, staff notes, or peer comparison. |

Exact field allow-lists may graduate after DD-06 escalation rules; the boundary above is the product rule.

---

## Spanish copy strategy

**One adaptive strategy**, not separate copy products per band.

- Same component tree and check-in flow for all Age Bands.
- Age Band drives reading level:
  - **Assisted:** short sentences, concrete labels, no load jargon.
  - **Guided:** plain Spanish.
  - **Independent:** may use slightly denser wellness labels.
- Product UI stays **Spanish** per repo convention.

**Revert trigger:** introduce per-band copy catalogs only if DD-05 prototyping shows Guided/Independent need a distinct voice that adaptive strings cannot cover.

---

## Anti-patterns (explicit rejects)

- Co-experience-as-default UI (family co-app as primary model).
- Teen-only autonomy assumptions.
- Guilt / punishment copy for missed check-ins.
- Parents / Guardians as primary daily operators.
- Childish competitive leaderboards / badge spam.
- Building a full parent-portal product in this design-direction effort.
- Soft-approval of routine DailyEntry submits (unless a later effort explicitly reopens that assume).

---

## Glossary terms

Safe to promote into root `CONTEXT.md` when domain docs are updated:

| Term | Meaning |
|---|---|
| **Age Band** | Capability tier (Assisted / Guided / Independent) that drives autonomy and copy register; indicative ages support assignment. |
| **Guardian** | Adult who may help (Assisted) or receive post-hoc supervision signals; not the default daily operator of `apps/player`. |
| **Assisted Check-in** | Check-in mode for the Assisted Age Band where an adult is expected present; still Player-operated, not Guardian-as-primary. |
| **Parental Supervision Layer** | Separate product layer for Guardian see / receive / escalate boundaries — visibility and notification, not a co-experience app or routine approval gate. |

**Avoid in product vocabulary:** “parent portal,” “family mode,” “teen app,” or “User” when the meaning is **Player** or **Guardian**.

---

## Explicit deferrals to DD-06

The following are **not** decided here; [Define reminders, streaks, and health escalation](../issues/06-define-reminders-streaks-and-health-escalation.md) owns them, using Age Band × autonomy from this resolution:

- Reminder **consent** (who consents).
- Notification **channels** and timing / anti-nag.
- Streak recovery rules.
- Health **escalation thresholds** and who is notified when.

---

## Deferred beyond this ticket (still fog)

- Guardian auth / account linkage; whether notification-only contacts need login.
- Exact care-slice field allow-lists (refine with DD-06 escalation).
- Legal / jurisdictional consent copy for minors’ wellness data (policy).
- How Age Band is assigned in staff admin (DOB auto-suggest vs manual tier) and persistence schema.
- Soft-approval workflows as a product (rejected for design-direction routine path).
