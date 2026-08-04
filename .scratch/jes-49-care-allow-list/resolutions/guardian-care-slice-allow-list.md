# Guardian care-slice field allow-list

Resolution for [JES-49](https://linear.app/jesus-guti-workspace/issue/JES-49/graduate-the-guardian-care-slice-field-allow-list).  
Source of truth for locked decisions: `.scratch/jes-49-care-allow-list/map.md` (human **JES-49: ok**, 2026-08-04).

**Scope:** exact fields that may cross the Guardian care-slice boundary for Care Alerts (and future Guardian “see” reads). Staff visibility is unchanged. Miss-check-in notifies use a separate, narrower allow-list (not this type).

**Implementation:** feature-local `@repo/database/care-alerts` — `GuardianCareSlice` + `toGuardianCareSlice` + Zod `.strict()`. Promote to a shared package only when a second real boundary consumes it.

---

## Boundary (unchanged)

| Audience | Visibility |
|---|---|
| **Staff** (`apps/app`) | Full DailyEntry, load, InjuryReport (including free text, severity, `staffNotes`), PlayerDailyStats |
| **Guardian** | **Care slice only** — fields below. Never load ratios, ACWR, staff notes, peer comparison, AI anomaly payloads, or session RPE/duration as load context |

---

## Allow-list: `GuardianCareSlice`

| Field | Notes |
|---|---|
| `playerDisplayName` | Notification-safe roster display name |
| `date` | Civil calendar date (`YYYY-MM-DD`) of the alert |
| `checkInCompleted` | Completion status |
| `triggerClass` | `INJURY_PAIN` \| `CARE_RELEVANT_WELLNESS` |
| `careFlags[].code` | Stable flag code (care-relevant only) |
| `careFlags[].labelKey` | Spanish UI string indirection — **no** numeric scale value (HITL C) |
| `injury.bodyPart` | Structured location when injury class |
| `injury.side` | `LEFT` \| `RIGHT` \| `BILATERAL` \| `CENTRAL` |
| `injury.injuryType` | Structured type string when present — not free-form narrative |
| `injury.reportedAt` | ISO timestamp of the report signal |

### Explicitly excluded (HITL B + permanent)

- `InjuryReport.title` / `description` / `severity` / `staffNotes`
- Raw wellness metrics (`recovery`, `energy`, `soreness`, sleep, etc.) and flag `value`
- Raw `physioAlert` boolean (represented via `careFlags` / trigger class)
- All `PlayerDailyStats` load / ACWR / `riskLevel` fields
- Peer comparison / `AiSuggestion` payloads

### Miss notify (separate type — not Care Alert)

`playerDisplayName`, `date` (or window id), `missed: true` — no wellness/injury fields.

---

## Enforcement

1. **Allow-list projection** — `toGuardianCareSlice(source)` builds only allow-listed keys; never strip-a-staff-DTO.
2. **Zod `.strict()`** — `guardianCareSliceSchema` rejects unknown keys (including staff-only fields).
3. **Tests** — golden payloads, strict reject of staff keys, staff fixtures still expose excluded fields.
