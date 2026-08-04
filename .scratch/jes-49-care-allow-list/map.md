# JES-49 — Graduate the Guardian care-slice field allow-list

Planning map for [Graduate the Guardian care-slice field allow-list](https://linear.app/jesus-guti-workspace/issue/JES-49/graduate-the-guardian-care-slice-field-allow-list).  
Parent: [Implement LoadZone design direction](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction) (JES-37).  
Blocked by: [Deliver rate-limited Guardian Care Alerts](https://linear.app/jesus-guti-workspace/issue/JES-47/deliver-rate-limited-guardian-care-alerts) (JES-47).  
Route: `plan:hitl` · Risk: `alto`.

## Destination

Document and enforce the exact fields that may cross the Guardian care-slice boundary: an explicit **allow-list projection** (not a deny-list strip of a staff object). Staff keeps full authorized operational visibility. Guardian-facing Care Alert reads/notifications are built only from the allow-list. Contract and visibility tests fail if a staff-only field appears on a Guardian payload.

## Notes

- **Domain:** root `CONTEXT.md`; Age Band / Guardian vocabulary in [player-age-bands-and-parental-supervision.md](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md); Care Alert rules in [reminders-streaks-and-health-escalation.md](../design-direction-wayfinder/artifacts/reminders-streaks-and-health-escalation.md); SPEC §3 visibility + §5 escalation + §9 deferred allow-list ([SPEC.md](../design-direction-wayfinder/SPEC.md)); backlog seed A6 ([BACKLOG.md](../design-direction-wayfinder/BACKLOG.md)).
- **Boundary already locked (not reopenable here):** Guardian = care slice only (completion status, escalated flags, injury-relevant signals). **Never** load ratios, ACWR, staff notes, or peer comparison. Staff = full DailyEntry + load + injury. Miss notify ≠ Care Alert.
- **Dependency:** JES-47 lands the Care Alert pipeline with provisional payload exclusions. This issue **graduates** the exact field list and hardens the shared projection those payloads (and any future Guardian “see” reads) must use.
- **Still fog (out of this ticket):** Guardian auth / delivery mechanism; parent portal; legal consent copy; numeric red-flag threshold values ([Configure numeric wellness red-flag thresholds](https://linear.app/jesus-guti-workspace/issue/JES-41/configure-numeric-wellness-red-flag-thresholds) / JES-41); Excused Absence Guardian-request workflow.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not implement. Do not commit.
- **Current schema anchors (read-only):** `DailyEntry` (incl. `physioAlert`, wellness scales, RPE/duration); `InjuryReport` (incl. `staffNotes`, `severity`, free-text `title`/`description`, `bodyPart`/`side`); `PlayerDailyStats` (`acwr`, loads, `riskLevel`) — staff load surface.

## Decisions so far

### Auto

1. **[auto] Allow-list projection, never deny-list** — Guardian payloads are built by projecting onto a closed type (e.g. Zod `.strict()` / exhaustive object). Do not start from a staff DTO and strip keys. Matches issue AC and SPEC privacy intent.
2. **[auto] Staff visibility unchanged** — `apps/app` continues to receive full DailyEntry, InjuryReport (including `staffNotes`, severity, free text), PlayerDailyStats, and AI suggestion context. No staff field removal in this ticket.
3. **[auto] Permanent exclusions (cannot graduate into the allow-list without a new HITL)** — `PlayerDailyStats.acwr` / `acuteLoad` / `chronicLoad` / `srpe` / `tqrAvg7d` / `rpeAvg7d` / `riskLevel`; any load-ratio or ACWR-derived signal; `InjuryReport.staffNotes`; peer comparison / team ranking aggregates; `AiSuggestion` payloads and anomaly heuristics; session RPE/`duration` as load context; raw staff coaching notes on TeamSession.
4. **[auto] One canonical care-slice type for Care Alert + future Guardian “see”** — Same allow-list backs notification payloads and any later Guardian read surface. Miss-check-in notifies remain a **separate, narrower** allow-listed type (player display + date + miss window) and never reuse Care Alert fields or framing (DD-06).
5. **[auto] Scope vs JES-47** — Implement after JES-47: extract/harden the pipeline’s Guardian payload builder to the graduated contract; add contract + visibility tests. Do not rebuild rate-limits, trigger classes, or delivery in this ticket.
6. **[auto] Feature-local contract until a second consumer exists** — Keep the Zod/type + projector next to the Care Alert / parental-supervision feature. Promote to a shared `@repo/*` package only if a second real boundary consumes it (repo rule).
7. **[auto] Tests required** — (1) golden Guardian payloads contain only allow-listed keys; (2) constructing/projecting with a staff-only field fails typecheck and/or test; (3) staff mapper fixtures still expose excluded fields. Spanish product copy for alerts stays out of English docs.
8. **[auto] Documentation deliverable** — Persist the locked allow-list as a resolution under this scratch folder and clear the SPEC §9 / DD-06 fog line that says exact fields remain deferred (boundary stays; list graduates).

### Assume

9. **[assume] Projector module shape** — Single pure function `toGuardianCareSlice(source) -> GuardianCareSlice` (name flexible) used by Care Alert emit paths; no ORM models returned across the boundary.  
   **Revert:** inline projection in the notifier only if a second read path never appears — still keep the Zod schema as the contract.
10. **[assume] Guardian-facing player identity** — Allow-list may include a **display name** suitable for a notification (roster / first name as staff already show parents), plus opaque internal ids only for server-side routing (never player public token, never email by default).  
    **Revert:** drop display name from payload and resolve name only inside the delivery adapter if privacy review requires it.
11. **[assume] Care-flag presentation** — Allow-listed `careFlags[]` carry a stable `code` plus a `labelKey` for Spanish UI strings; do not embed staff free-text notes as the label.  
    **Revert:** code-only + hard-coded Spanish map in the delivery layer if i18n keys prove premature.

### Hitl (locked 2026-08-04 — JES-49: ok)

12. **[hitl → locked] Exact allow-list membership** — Recommended table accepted (see Destination / resolution).
13. **[hitl → locked] Injury free-text and severity** — **No** title / description / severity on Guardian; structured location only.
14. **[hitl → locked] Care-relevant wellness values** — **code + labelKey only**; no raw wellness numbers.

## Recommended allow-list (HITL A — for approval)

Canonical type name (implementation may rename): **`GuardianCareSlice`**.

| Field | Include | Notes |
|---|---|---|
| `playerDisplayName` | yes (assume #10) | Notification-safe roster name |
| `date` | yes | Check-in / alert calendar date |
| `checkInCompleted` | yes | Completion status (DD-02 / SPEC §3) |
| `triggerClass` | yes | `INJURY_PAIN` \| `CARE_RELEVANT_WELLNESS` (JES-47 classes) |
| `careFlags[].code` | yes | Only flags marked care-relevant by policy / JES-41 config |
| `careFlags[].labelKey` | yes (assume #11) | Spanish copy indirection |
| `injury.bodyPart` | yes when injury class | Structured location |
| `injury.side` | yes when injury class | Existing `InjurySide` enum |
| `injury.injuryType` | yes when present | Structured type string if player/staff set it — not free-form narrative |
| `injury.reportedAt` | yes when injury class | Timing of the report signal |
| `injury.title` / `description` | **HITL B → recommend no** | Free text stays staff-only |
| `injury.severity` | **HITL B → recommend no** | Clinical framing / staff ops |
| `injury.staffNotes` | never | Permanent exclusion |
| Raw `recovery` / `energy` / `soreness` / sleep metrics | **HITL C → recommend no** | Flag code only |
| `physioAlert` boolean | no as raw field | Represent via `careFlags` / trigger class |
| RPE / `duration` / all `PlayerDailyStats` load fields | never | Permanent exclusion |
| Peer comparison / AI anomaly payloads | never | Permanent exclusion |

Miss-notify allow-list (separate type, not Care Alert): `playerDisplayName`, `date` (or window id), `missed: true` — no wellness/injury fields.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Allow-list vs deny-list projection | `auto` | Locked by issue AC + privacy precedent |
| 2 | Staff full visibility preserved | `auto` | Locked DD-02 / SPEC |
| 3 | Permanent exclusion set (load, notes, peers, AI) | `auto` | Locked SPEC §3 / §5 |
| 4 | One slice for Care Alert + future see; miss separate | `auto` | DD-06 miss ≠ Care Alert |
| 5 | Land after JES-47; harden builder + tests | `auto` | Linear blocked-by + AC |
| 6 | Feature-local contract until 2nd consumer | `auto` | Repo package rule |
| 7 | Contract/visibility tests | `auto` | Issue AC |
| 8 | Docs clear SPEC fog line | `auto` | Destination of this ticket |
| 9 | Pure `toGuardianCareSlice` projector | `assume` | Contained; reversible |
| 10 | Display name on payload | `assume` | Contained privacy choice; reversible |
| 11 | Flag `labelKey` not staff prose | `assume` | Contained; reversible |
| 12 | Exact allow-list table | `hitl` | Product + shared contract + minors |
| 13 | Injury free-text + severity | `hitl` | Product/privacy — not settled by doctrine |
| 14 | Raw wellness numbers vs flag codes | `hitl` | Product/privacy — “signals” ambiguous |

## Not yet specified

- Final TypeScript module path and export names (implementer chooses within assume #6/#9).
- Exact Spanish notification strings (product UI; after allow-list lock).
- Whether JES-47’s provisional payload already matches the recommendation (diff at implement time).

## Out of scope

- Guardian authentication, delivery channel (email/SMS/push), or parent-portal IA.
- Changing Care Alert rate limits, trigger-class policy, or Parental Supervision Layer toggles (JES-47 / JES-43 / JES-45).
- Numeric threshold configuration (JES-41).
- Soft-approval of DailyEntry; making Guardian the daily `apps/player` operator.
- Excusing ACWR/load anomalies onto the Guardian path.

## Implementation sketch (after HITL lock + JES-47)

1. Add `GuardianCareSlice` schema (strict) + `toGuardianCareSlice` next to Care Alert feature.
2. Point JES-47 emit path at the projector; delete any deny-list stripping.
3. Add unit/contract tests for allow-list keys and forbidden staff fields.
4. Write resolution doc; update SPEC §9 fog bullet to “graduated in JES-49” with link.
5. Do not change staff query shapes except to ensure they do not accidentally reuse the Guardian type.

### Human review (2026-08-04)
- **JES-49: ok** — accept HITL recommendations:
  - A → close recommended allow-list table (playerDisplayName, date, checkInCompleted, triggerClass, careFlags[], injury.bodyPart|side|injuryType|reportedAt)
  - B → no title/description/severity of injury to Guardian (structured location only)
  - C → red-flag as code + labelKey only (no numeric value)
- Blocked by JES-47 until Care Alert pipeline lands.
