# JES-47 — Deliver rate-limited Guardian Care Alerts

Status: implemented  
Ticket: [Deliver rate-limited Guardian Care Alerts](https://linear.app/jesus-guti-workspace/issue/JES-47/deliver-rate-limited-guardian-care-alerts)  
Parent: [JES-37](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction)  
Blocks: [JES-49](https://linear.app/jesus-guti-workspace/issue/JES-49/graduate-the-guardian-care-slice-field-allow-list)  
Blocked by: [JES-43](https://linear.app/jesus-guti-workspace/issue/JES-43/configure-age-band-cutoffs-and-guardian-policy), [JES-45](https://linear.app/jesus-guti-workspace/issue/JES-45/configure-reminder-consent-by-age-band), [JES-41](https://linear.app/jesus-guti-workspace/issue/JES-41/configure-numeric-wellness-red-flag-thresholds)

**Route:** `plan:hitl` · **Risk:** alto · **HITL count:** 3

## Destination

A Care Alert pipeline that turns eligible injury/pain and immediate care-relevant wellness flags into rate-limited Guardian-facing Care Alert events when the Parental Supervision Layer (and Guardian Care Alert receive policy) is active — distinct from miss reminders, with calm Player confirmation only, provisional payload exclusions (no load ratios / ACWR / staff notes / peer comparison), and tests for policy, rate limits, trigger classes, timezone, and exclusions. No Guardian auth or parent portal. Delivery transport may be stubbed until contacts exist.

## Notes

- **Doctrine:** SPEC §§5–6 · [reminders-streaks-and-health-escalation.md](../design-direction-wayfinder/artifacts/reminders-streaks-and-health-escalation.md) (DD-06 HITL B locked) · [player-age-bands-and-parental-supervision.md](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md) · BACKLOG A4.
- **Injury logging (main-repo scratch, not copied into this worktree):** JES-33 Pain Alert fate — Care Alerts may fire when Parental Supervision is on; official Injury remains staff-authored. JES-32 wellness exemption — civil day clock = `Team.timezone` (default `Europe/Madrid`).
- **Sibling planners (align, do not reopen):**
  - JES-43 owns Age Band / Parental Supervision Layer / Guardian miss+Care Alert **receive** policy substrate (no contacts).
  - JES-45 owns Reminder Consent × band + Player push UX; Guardian receive knobs are policy only — **send is this issue**.
  - JES-41 owns numeric red-flag thresholds + distinguishing care-relevant immediate flags from staff-only load/ACWR.
  - JES-49 graduates the exact care-slice allow-list from this issue’s provisional payload builder.
- **Code reality (this worktree):** Player Web Push via `@repo/push-notifications` + `PushSubscription`; idempotent miss/session reminders via `PushDispatch` (`PRE_SESSION` / `POST_SESSION`) in `apps/api` cron + staff `remindPendingWellnessPlayers`. No Guardian entity, contact, or Care Alert table. Player Pain Alert path: footer Sheet → `saveInjuryReport` → `InjuryReport` (`reportedByPlayer: true`). Staff wellness ALERT mixes `physioAlert`, `wellnessLimits` thresholds, and `riskLevel` HIGH/CRITICAL — Care Alerts must **not** reuse ACWR/`riskLevel` as Guardian triggers.
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Planning only — no product code, no commit.

## Decisions so far

### Auto

1. **[auto] Miss path never enters Care Alert pipeline** — Missed check-ins, PRE/POST reminder cron, and staff re-nudge stay on the adherence path (`PushDispatch` / pending ops). Care Alert evaluation must not accept miss signals as inputs. Reason: SPEC §5 / DD-06 locked; AC.

2. **[auto] Two trigger classes (locked vocabulary)** — `INJURY_PAIN` and `CARE_RELEVANT_WELLNESS`. Rate-limit key is `(playerId, triggerClass, civilDate)`. Sustained load / ACWR / AI anomaly / `PlayerDailyStats.riskLevel` never become Care Alert classes. Reason: DD-06 HITL B; JES-49 provisional class names.

3. **[auto] Policy gate = layer on ∧ Care Alert receive on** — Fire only when Parental Supervision Layer is active for the Player (JES-43 resolver) **and** Guardian Care Alert receive is permitted (JES-43/JES-45 policy). Unassigned Age Band / layer off / receive off → no Care Alert. Reason: SPEC §5 + sibling maps.

4. **[auto] Civil day + timezone** — Calendar day for rate limits uses `Team.timezone` (default `Europe/Madrid`), same clock as injury wellness exemption (JES-32). Tests must cover timezone boundary (e.g. late-evening local vs UTC). Reason: AC + injury precedent.

5. **[auto] Permanent payload exclusions** — Guardian Care Alert payloads must never include load ratios, ACWR / acute-chronic fields, `staffNotes`, peer comparison, or AI anomaly payloads. Build via allow-list-shaped provisional object (not strip-a-staff-DTO). Exact field graduation → JES-49. Reason: SPEC §3/§5; AC; JES-49 auto #1/#3/#5.

6. **[auto] Player confirmation is calm and staff-analysis-free** — When a care flag fires on the Player path, show calm Spanish confirm only (SPEC example register: “Tu equipo ya lo tiene”). No severity labels, no “avisamos a tus padres”, no peer comparison, no load jargon. Reason: SPEC §5–6; DD-06 HITL B.

7. **[auto] No Guardian auth / portal** — Do not invent Guardian login, magic-link portal, or co-app. Reason: SPEC rejects + issue What-to-build.

8. **[auto] Consume JES-41 care-relevant markers** — Immediate wellness Care Alerts use only flags JES-41 marks care-relevant. Do not map today’s staff `getDailyPlayerState` ALERT (which includes `riskLevel`) wholesale into Guardian Care Alerts. Reason: blocked-by JES-41; SPEC staff-only load.

9. **[auto] Staff already has ops visibility** — Do not re-notify staff as if they were Guardians. Staff continues full context via wellness / injury surfaces. Care Alert product object is Guardian-facing. Reason: DD-06 channels table.

10. **[auto] Tests required** — Policy off/on; receive off/on; rate limit 1/class/day/Player; both trigger classes; timezone civil-day boundary; miss inputs rejected; payload exclusion assertions; Player confirm does not leak staff-only fields. Reason: AC.

11. **[auto] Soft-stack blockers before implement** — Implementation waits for (or soft-merges tips of) JES-43, JES-45, JES-41. Reason: Linear blocked-by.

12. **[auto] Manual staff escalate later** — “Unless staff manually escalates” from DD-06 is **out of this issue**; no staff “force Care Alert” control in JES-47. Reason: fog / later ops product.

### Assume

13. **[assume] Delivery mechanism deferred — durable event + stub transport** — Persist a Care Alert ledger event when policy + rate-limit allow; call a transport adapter that is a **no-op / log stub** until Guardian contact channels exist (email/SMS/push remain SPEC §9 fog). Acceptance of “deliver” for this slice = durable rate-limited Care Alert event + provisional payload + Player calm confirm + policy gates — not a live Guardian inbox.  
    **Revert:** swap stub for email/SMS/push adapter when contacts land; ledger and rate-limit keys stay.

14. **[assume] Ledger mirrors `PushDispatch` idiom** — Feature-local Prisma model (e.g. `CareAlertDispatch`) with unique `(playerId, triggerClass, civilDate)` (or equivalent), `createdAt`, and JSON provisional payload snapshot. Distinct enum/kinds from `PushDispatchKind` so miss and care never share a table path.  
    **Revert:** rename/split table; or move payload snapshot out if JES-49 prefers rebuild-on-read only.

15. **[assume] Evaluation hooks on successful Player writes** — Invoke Care Alert evaluation after successful Pain Alert / injury-aviso persist and after successful DailyEntry (or form submission) persist that yields care-relevant flags — synchronous in the server action / API path for v1 (same process as write). Not on cron miss sweeps.  
    **Revert:** move to async queue/outbox worker if latency or failure isolation demands it.

16. **[assume] Provisional payload aligns with JES-49 recommendation (pre-graduation)** — Shape roughly: `playerDisplayName`, `date` (civil), `triggerClass`, `checkInCompleted` (bool), `careFlags[{ code, labelKey }]`, optional structured injury location fields **without** free-text title/description, severity, raw wellness numbers, staff notes, or load metrics. Projector is feature-local; JES-49 hardens and may tighten.  
    **Revert:** drop optional injury location fields if JES-49 HITL excludes them; never widen into excluded staff fields without a new HITL.

17. **[assume] Both classes may fire the same civil day** — One Care Alert per class per day: a Pain Alert and a care-relevant wellness flag on the same day may produce two ledger rows (different `triggerClass`). Same class re-trigger same day is a no-op after the first.  
    **Revert:** collapse to a single combined Care Alert per day if clubs find dual notifies noisy.

18. **[assume] Module locus** — Care Alert evaluate/emit/projector lives feature-local under parental-supervision / care-alert (app or small package-adjacent module). Do not promote to `@repo/*` until a second boundary consumes it (JES-49 may keep projector co-located).  
    **Revert:** extract shared package if miss-notify + Care Alert + Guardian see all need one boundary earlier.

### HITL (pending human)

19. **[hitl] INJURY_PAIN source set** — Which concrete product events count as `INJURY_PAIN`. Recommendation A.
20. **[hitl] Quiet hours vs Care Alerts** — Whether Anti-nag quiet hours suppress Care Alert creation/send. Recommendation B.
21. **[hitl] Official staff Injury open → Care Alert?** — Whether staff-authored official Injury create/open (injury-logging domain) fires `INJURY_PAIN` for Guardians. Recommendation C.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Miss ≠ Care Alert pipeline | `auto` | SPEC / DD-06 locked |
| 2 | Two classes + rate-limit key | `auto` | DD-06 HITL B |
| 3 | Layer ∧ receive gate | `auto` | SPEC + JES-43/45 |
| 4 | Team.timezone civil day | `auto` | AC + JES-32 precedent |
| 5 | Permanent exclusions + allow-list shape | `auto` | SPEC + JES-49 |
| 6 | Calm Player confirm | `auto` | SPEC §5–6 |
| 7 | No Guardian auth/portal | `auto` | SPEC reject |
| 8 | JES-41 care-relevant only (not riskLevel) | `auto` | Blocked-by + safety |
| 9 | Staff not Care Alert audience | `auto` | DD-06 channels |
| 10 | Tests per AC | `auto` | Issue AC |
| 11 | Soft-stack blockers | `auto` | Linear graph |
| 12 | No manual escalate in v1 | `auto` | Deferred ops |
| 13 | Durable event + stub transport | `assume` | Delivery fog; reversible |
| 14 | CareAlertDispatch ledger | `assume` | PushDispatch precedent; reversible |
| 15 | Sync hooks on Player writes | `assume` | Contained; reversible |
| 16 | Provisional payload ≈ JES-49 rec | `assume` | Contained; JES-49 graduates |
| 17 | Two classes same day OK | `assume` | Contained; reversible |
| 18 | Feature-local module | `auto`/`assume` | Repo promote rule |
| 19 | INJURY_PAIN sources | `hitl` | Product — what Guardians get notified about |
| 20 | Quiet hours | `hitl` | Product — care vs sleep tradeoff |
| 21 | Staff Injury → Care Alert | `hitl` | Product — injury-logging intersection |

## HITL recommendations (for orchestrator → human)

### A. INJURY_PAIN source set

**Question:** Which events create an `INJURY_PAIN` Care Alert (subject to policy + rate limit)?

**Recommend: Option 2**

| Option | Sources |
|---|---|
| 1 | Player Pain Alert (`reportedByPlayer` aviso) only |
| **2 (recommend)** | Pain Alert **+** explicit check-in injury/pain flags (e.g. `physioAlert` / JES-41-mapped injury-pain codes on DailyEntry) |
| 3 | Option 2 **+** staff-created official Injury open (see HITL C — prefer keep C separate; if choosing 3, answer C yes) |

**Why 2:** DD-06 table is “injury report / explicit injury or pain flag **on check-in**”; JES-33 keeps Pain Alert as intake and explicitly allows Care Alerts. Option 1 drops check-in pain flags. Option 3 conflates staff ops with Guardian notify (staff already has full context; Guardians need player-originated care signals first).

### B. Quiet hours vs Care Alerts

**Question:** Do Anti-nag quiet hours (JES-48 / DD-06) suppress Care Alert ledger creation or transport?

**Recommend: Option 1 — Care Alerts ignore quiet hours**

| Option | Behavior |
|---|---|
| **1 (recommend)** | Care Alerts **bypass** quiet hours; still rate-limited 1/class/civil-day/Player |
| 2 | Suppress creation during quiet hours; flush at quiet-hours end |
| 3 | Create ledger immediately but delay transport until quiet hours end |

**Why 1:** Miss anti-nag must not dilute health escalation; SPEC separates miss from Care Alert. Rate limit already caps spam. Option 2/3 add scheduler complexity and delay care signals overnight. Transport is stubbed anyway (assume #13); when a real channel lands, still prefer immediate care over sleep unless legal review forces otherwise.

### C. Staff official Injury open → Care Alert?

**Question:** When staff registers/opens an official **Injury** (injury-logging staff path), should Guardians get an `INJURY_PAIN` Care Alert?

**Recommend: Option 2 — No in JES-47**

| Option | Behavior |
|---|---|
| 1 | Yes — staff Injury open fires Care Alert (same class/rate limit) |
| **2 (recommend)** | **No** — only player-originated Pain Alert / check-in injury-pain flags (HITL A). Staff Injury stays staff ops; Guardians are not auto-notified of staff logging in this slice |
| 3 | Defer hook stub only (no fire) documented for a later injury-logging issue |

**Why 2:** DD-06 trigger language is check-in / injury-or-pain **flag**; injury SPEC says Care Alerts may consume **Pain Alert**, not that every staff Injury is a Guardian notify. Staff Injury create already puts staff in the loop. Adding Guardian notify for staff logging is a new product behavior (household dynamics, timing) — keep out of this design-direction implement slice; Option 3 is fine only if you want an explicit empty hook for a follow-up issue.

## Not yet specified

- Guardian contact model / auth / email-SMS-push adapter (SPEC §9; assume #13 stub).
- Exact Spanish notification strings for Guardian transport (after channel exists).
- Staff “manual escalate” Care Alert ops control (DD-06 footnote).
- Whether future Guardian “see” UI reuses the same projector before JES-49 lands (JES-49 owns graduation).
- Numeric threshold values themselves (JES-41).

## Out of scope

- Guardian authentication, parent portal, co-experience app.
- Miss reminder / anti-nag scheduler work (JES-48).
- Exact care-slice allow-list graduation (JES-49).
- Age Band cutoffs / layer policy UI (JES-43); Reminder Consent + Player push UX (JES-45).
- Using Care Alerts as adherence spam; soft-approval of DailyEntry; SMS-to-Player default.
- Reopening DD-06 trigger classes or mixing ACWR into Guardian payloads.

## Implementation sketch (after HITL lock + blockers)

1. Soft-merge or land JES-43 / JES-45 / JES-41 tips for policy resolver, receive toggles, care-relevant flag codes.
2. Add `CareAlertDispatch` (or equivalent) + `triggerClass` enum; unique per player/class/civilDate in team timezone.
3. Feature-local `evaluateAndEmitCareAlert(...)`: resolve policy → classify triggers → rate-limit → write provisional payload → stub transport.
4. Hook Pain Alert save + DailyEntry/care-flag persist paths; explicitly no hook from miss cron / staff re-nudge.
5. Player calm confirm UI when emit succeeds (or would have emitted absent rate-limit — product: confirm on care flag presence, not on Guardian delivery success).
6. Tests per AC; leave exact allow-list hardening to JES-49.

## Human review

- **Orchestrator:** awaiting answers for HITL A/B/C (recommendations above).
- Suggested accept phrase: `JES-47: ok` (accept all auto/assume + A/B/C as recommended) or `JES-47: A → <option>`, etc.

### Human review (2026-08-04)
- **JES-47: ok** — accept HITL recommendations:
  - A → Pain Alert + injury/pain check-in flags as INJURY_PAIN sources
  - B → Care Alerts ignore quiet hours (rate-limit still applies)
  - C → no Care Alert from staff-opened Injury in this issue (player-originated only)
- Blocked by JES-43, JES-45, JES-41.
