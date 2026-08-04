# JES-41 — Configure numeric wellness red-flag thresholds

Planning map for Linear [JES-41](https://linear.app/jesus-guti-workspace/issue/JES-41/configure-numeric-wellness-red-flag-thresholds).  
Parent: [JES-37 Implement LoadZone design direction](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction).  
Route: `plan:hitl` · Risk: medio · Blocks: [JES-47](https://linear.app/jesus-guti-workspace/issue/JES-47/deliver-rate-limited-guardian-care-alerts) · Blocked by: none.

## Destination

Staff can change **numeric thresholds** for the locked **immediate wellness red-flag** classes without a code deploy, via the existing team policy / form-settings surface. Player submissions and staff wellness views evaluate the **same active config**. Immediate care-relevant flags are distinguishable from staff-only load / ACWR anomalies. Care Alert delivery, Guardian auth, and care-slice field allow-list graduation stay out of this issue (JES-47 / JES-49).

## Notes (read-only context)

- **SPEC §5 / DD-06 artifact:** trigger **classes** are locked — Injury / pain; Immediate red-flag wellness (care-relevant); Sustained load / ACWR (staff-only); Missed check-in (not a Care Alert). Exact **numbers** and care-slice field lists were backlog fog; this issue ships the numbers.
- **Code precedent — already ships half of A5:**
  - `Team.wellnessLimits` (`Json?`) holds `recovery | energy | soreness | sleepHours | sleepQuality`.
  - Staff **Configuración** UI + `updateTeamSettings` already persist thresholds (sleepQuality in schema/parser, missing from settings inputs).
  - `getWellnessAlerts` compares with fixed directions: recovery/energy ≤, soreness ≥, sleepHours <.
  - Staff ALERT state today **mixes** wellness-limit hits with ACWR `riskLevel` HIGH/CRITICAL and `physioAlert` — JES-41 must make care-relevant vs staff-only **distinguishable** for JES-47 without moving ACWR into Guardian path.
- **ACWR:** `RISK_THRESHOLDS` in `@repo/database/risk-thresholds` stays **code constant**, staff-only. Not part of `wellnessLimits`. AI `detectAnomalies` multi-day patterns stay staff-only (not immediate single-entry Care Alert class).
- **DD-05 prototype:** only `soreness` marked `careRelevant` with `careThreshold: 4` — useful precedent, not doctrine until HITL A locks.
- **Form templates:** `FormQuestion` has min/max/step/mappingKey only — no threshold or care flags. System wellness form maps recovery, energy, soreness, sleepHours, sleepQuality.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not implement or commit from this planning wave.

## Decisions so far

### Auto

1. **[auto] Classes stay locked; this issue ships numbers only** — Do not invent new escalation classes or reopen SPEC §5 / DD-06 HITL B. Injury remains a separate Care Alert class (JES-47). Miss ≠ Care Alert. Sustained load / ACWR / multi-day AI anomalies remain staff-only.
2. **[auto] Reuse `Team.wellnessLimits` + team settings as the policy config surface** — Precedent already meets “configurable without deploy.” Do not move thresholds onto `FormQuestion` for v1 (system templates are shared; policy is team-scoped today). Form template assignment stays orthogonal (which questions exist); thresholds apply to mapped DailyEntry fields.
3. **[auto] ACWR / sustained-load thresholds stay out of wellness policy config** — Keep `RISK_THRESHOLDS` and anomaly heuristics staff-only; never write them into `wellnessLimits` or Guardian care slice.
4. **[auto] Comparison directions stay as today’s staff alerts** — recovery ≤, energy ≤, sleepQuality ≤ (when configured), soreness ≥, sleepHours <. Align validation bounds with form min/max (recovery 0–10, energy/soreness/sleepQuality 1–5, sleepHours 0–24).
5. **[auto] Care-relevant membership is product-locked, not staff-toggleable** — SPEC: classes locked; staff retunes **numeric** values only. Which metrics are care-relevant is HITL A; once locked, code encodes membership — settings UI does not offer a “notify Guardian” checkbox per field.
6. **[auto] Shared evaluation module + boundary tests** — Extract (or introduce) a pure function used by staff wellness utils and player DailyEntry submit path: input entry metrics + active limits → list of fired flags with `{ metric, careRelevant }`. Invalid parsed config cannot activate (existing `parseWellnessLimits` → null; tighten with range checks). Business-rule tests cover boundaries and invalid values (AC).
7. **[auto] Out of scope for implement wave** — Care Alert rate limits / delivery / Guardian payload (JES-47); Age Band / Guardian policy (JES-43); Reminder Consent (JES-45); care-slice allow-list graduation (JES-49); Prisma migration unless a later decision forces a typed column (JSON shape evolve in place).

### Assume

8. **[assume] Extend wellnessLimits shape only if needed for clarity; keep JSON on Team** — Prefer keeping flat numeric map (current) plus a code-side care-relevant set from HITL A. If implement needs explicit direction metadata, version the JSON with a small `version` / per-metric object — still `Team.wellnessLimits`, no new Prisma model.  
   **Revert:** flatten back to today’s five nullable numbers; drop any version wrapper.
9. **[assume] Expose sleepQuality in settings UI** — Field already in parser/schema; add input next to other limits so config matches DailyEntry.  
   **Revert:** leave UI as four fields; keep sleepQuality parser-only until a later settings polish.
10. **[assume] Evaluate against active limits at DailyEntry write; no retroactive Care Alerts on threshold edits** — Staff views may recompute display alerts from current limits; Care Alert eligibility for JES-47 should key off flags computed at submit (or equivalent stable event) so changing thresholds does not spam Guardians for historical entries.  
    **Revert:** pure recompute-on-read for Care Alerts if JES-47 later prefers “current policy always wins” (document rate-limit interaction).
11. **[assume] Empty / null metric = disabled for that metric** — Preserve today’s semantics: unset threshold does not fire. Invalid payloads fail closed (reject save / keep previous valid config — implement chooses reject-on-save to match AC “invalid cannot activate”).  
    **Revert:** seed hard defaults on every team create if pilots under-configure (see HITL B).

### Hitl (pending human)

12. **[hitl] Care-relevant metric set** — Which immediate wellness metrics may feed Guardian Care Alerts vs staff-only ops alerts. Recommendation A.
13. **[hitl] Recommended default numbers** — What values to show as placeholders / optional team-create seed so pilots are not blank. Recommendation B.
14. **[hitl] Staff UI labeling of care vs staff-only** — Whether settings copy must distinguish “alerta de cuidado (Guardian)” vs “alerta solo staff” in this issue, or defer labeling polish to JES-47. Recommendation C.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Classes locked; numbers only | `auto` | SPEC §5 / issue AC; DD-06 locked |
| 2 | Reuse Team.wellnessLimits + settings | `auto` | Code precedent; team-scoped policy |
| 3 | ACWR out of wellnessLimits | `auto` | Safety boundary SPEC §5 |
| 4 | Comparison directions + ranges | `auto` | Adjacent `getWellnessAlerts` + form min/max |
| 5 | careRelevant not staff-toggleable | `auto` | Classes locked; numbers via config |
| 6 | Shared evaluator + tests | `auto` | AC; convention |
| 7 | Out of scope neighbors | `auto` | Issue boundaries / blockers graph |
| 8 | Stay on Team JSON | `assume` | Contained; reversible |
| 9 | Add sleepQuality settings input | `assume` | Contained UI; reversible |
| 10 | Evaluate at write; no retro Care Alerts | `assume` | Contained; reversible for JES-47 |
| 11 | Null metric = disabled | `assume` | Matches today; reversible via HITL B |
| 12 | Care-relevant metric membership | `hitl` | Product — changes Guardian notifications |
| 13 | Default / suggested numbers | `hitl` | Product — pilot safety vs under-alert |
| 14 | Settings copy care vs staff | `hitl` | Product / minors-facing escalation clarity |

## HITL recommendations (for orchestrator → human)

### A. Care-relevant metric set

**Recommend:** **soreness only** is care-relevant for immediate red-flag wellness (pain / muscular distress adjacency; matches DD-05 prototype). **recovery, energy, sleepHours, sleepQuality** remain **staff-only** immediate flags (ops surfaces in `apps/app`, never Guardian Care Alert). Injury / explicit pain report stays the other Care Alert class (unchanged). ACWR / sustained anomalies never join either care path.

**Reject:** marking all wellnessLimits hits care-relevant (over-notifies Guardians; blurs care slice). Reject staff-editable careRelevant toggles in this wave (classes locked).

### B. Recommended default numbers

**Recommend:** keep **null = disabled** for activation safety; document and pre-fill **placeholders** (not forced writes) as:

| Metric | Direction | Suggested default | Notes |
|---|---|---|---|
| recovery | ≤ | 4 | Settings placeholder today; AI sustained uses ≤4 |
| energy | ≤ | 2 | Settings placeholder |
| soreness | ≥ | 4 | DD-05 careThreshold; care-relevant if A accepted |
| sleepHours | < | 6 | Settings placeholder; AI poor-sleep uses <6 |
| sleepQuality | ≤ | 2 | New UI field; conservative |

Optional seed on **new team create:** only **soreness: 4** if A locks soreness as care-relevant — so Care Alerts can fire without requiring a settings visit; other metrics stay null until staff opts in.

### C. Settings copy: distinguish care vs staff-only

**Recommend:** **yes in this issue** — short Spanish labels on the limits form, e.g. soreness as “Alerta de cuidado (umbral)” vs recovery/energy/sleep as “Alerta solo staff (umbral)”, plus one-line helper that ACWR is not configured here. Avoids JES-47 inheriting an undifferentiated “Límites de alertas” that staff will misread as parent-facing.

**Defer** full Guardian pipeline copy / Player calm confirm to JES-47.

## Implementation sketch (for implement wave — not started)

1. Tighten `wellnessLimitsSchema` + settings zod (integer/step, in-range, reject invalid → no activate).
2. Shared `evaluateImmediateWellnessFlags(entry, limits) → { metric, careRelevant }[]` with locked care set from HITL A; refactor `getWellnessAlerts` to consume it; call from player save-entry path.
3. Settings UI: sleepQuality input; care vs staff labels (HITL C); placeholders (HITL B).
4. Ensure staff ALERT chrome can distinguish care-relevant wellness flags from ACWR risk (minimal: flag metadata; no Guardian send).
5. Tests: boundaries, invalid config, careRelevant vs staff-only split, ACWR never classified care-relevant.

## Not yet specified / fog (owned elsewhere)

- Care Alert rate limit, delivery, Player calm confirm, Guardian payload (JES-47).
- Age Band / Parental Supervision Layer persistence (JES-43).
- Reminder Consent × band (JES-45).
- Exact care-slice field allow-list beyond injury + care-relevant flags (JES-49).
- Club-level vs team-level policy inheritance.
- Medical-device / diagnostic claims (explicitly rejected by DD-06).

## Out of scope

- Implementing Care Alert pipeline or Guardian contacts.
- Changing ACWR `RISK_THRESHOLDS` or promoting ACWR into configurable wellness policy.
- Redesigning FormTemplate editor / per-question threshold authoring.
- Design-system primitive work; player Focus-frame restyle.

## Acceptance criteria mapping

| AC | Plan coverage |
|---|---|
| Thresholds changeable without deploy | Decisions 2, 8, 9 + settings surface |
| Invalid config cannot activate | Decisions 6, 11 + schema tighten |
| Submissions evaluated vs active config | Decisions 6, 10 |
| Care-relevant distinguishable from load/ACWR | Decisions 1, 3, 5 + HITL A/C |
| Business-rule tests | Decision 6 |

### Human review (2026-08-04)
- **JES-41: ok** — accept HITL recommendations:
  - A → soreness only care-relevant; recovery/energy/sleepHours/sleepQuality staff-only
  - B → placeholders recovery≤4, energy≤2, soreness≥4, sleepHours<6, sleepQuality≤2; optional seed soreness:4 on new teams
  - C → yes, Spanish settings copy distinguishes care vs staff-only (+ ACWR not here)
