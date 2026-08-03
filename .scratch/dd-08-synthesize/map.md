# DD-08 — Synthesize the design direction specification

Planning map for wayfinder exit ticket
`.scratch/design-direction-wayfinder/issues/08-synthesize-the-design-direction-specification.md`.
Parent: [LoadZone Design Direction](../design-direction-wayfinder/MAP.md).

**Status:** done · **plan:** `auto` · **HITL count:** 0 · implemented (SPEC + BACKLOG written; MAP closed)

## Destination

Assemble the map’s exit deliverables — **spec + backlog**, not shipped product code:

1. One English **implementation-ready** specification covering admin principles, player age-adaptive experience, visual divergence, adherence (reminders / streaks / escalation), and DS governance / migration.
2. A backlog of independently grabbable **tracer-bullet** implementation issues for a later `/to-issues` (or manual) handoff — **do not** start those issues here.
3. Explicit **CONTEXT.md glossary proposals** for a follow-up domain write (do not edit `CONTEXT.md` in this ticket unless the implement wave is told to).
4. Clear restatement of what remains **deferred** after this map closes.

Closing this ticket (+ updating MAP **Decisions so far**) should leave no open decision tickets and allow `MAP.md` to close.

## Notes

- **Locked parents (read, do not reopen):** MAP Decisions so far; `artifacts/*`; `resolutions/*`; [ADR 0001](../../docs/adr/0001-design-system-package-boundary.md); human override — Age Band / Guardian always staff-configurable; DD-05 keep **variant A** + thinned Spanish copy.
- **Soft visual accepts:** DD-04 admin prototype principles held pending human visual accept; DD-05 thinned A awaiting final visual accept. Spec treats locked doctrine as binding; layout winners / pixel chrome may stay soft-noted — **do not** block synthesis or reopen product forks.
- **Prototypes (evidence only):** `.scratch/dd-04-admin-prototype/`; `.scratch/dd-05-player-prototype/map.md` (+ in-app `prototype-dd-05` lab).
- **Effort rule:** destination remains docs under this wayfinder; no Wave 0 rule edits, no production restyles, no `/to-issues` Linear create in this ticket’s implement wave unless human expands scope.
- **Language:** SPEC / backlog / map English; product UI copy Spanish (cited, not authored as catalogs here).
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Prefer **0 hitl**. Max 3.

## Proposed artifact paths

| Deliverable | Path |
|---|---|
| **Specification** | `.scratch/design-direction-wayfinder/SPEC.md` |
| **Implementation backlog** | `.scratch/design-direction-wayfinder/BACKLOG.md` |
| **This planning map** | `.scratch/dd-08-synthesize/map.md` |
| **ADR (already shipped)** | `docs/adr/0001-design-system-package-boundary.md` — cite; do not rewrite |
| **Glossary write** | Root `CONTEXT.md` — **proposals only** in SPEC/BACKLOG appendix; domain follow-up edits separately |

**Revert (paths):** move SPEC/BACKLOG under `.scratch/dd-08-synthesize/` only if the parent MAP prefers effort-local artifacts; keep wayfinder-root for map exit discoverability.

## SPEC outline (implement wave — assemble, do not invent doctrine)

Single English doc. Each section **synthesizes** locked artifacts; link sources; no new product forks.

1. **Purpose & standing locks** — map destination; Age Band / Guardian always configurable; Spanish UI / English docs; outcomes over clones.
2. **Admin experience (`apps/app`)** — from `artifacts/admin-experience-principles.md` (+ DD-04 evidence soft note).
3. **Player age bands & parental supervision** — from `resolutions/player-age-bands-and-parental-supervision.md`.
4. **Shared visual language & app divergence** — from `artifacts/shared-visual-language-and-app-divergence.md`.
5. **Adherence: reminders, streaks, health escalation** — from `artifacts/reminders-streaks-and-health-escalation.md`.
6. **Player check-in & reward direction** — DD-05: keep variant A (Focus frame); bands OK; thinned calm Spanish; soft: final visual accept may still be pending.
7. **Design-system governance & migration** — from `artifacts/design-system-governance-and-migration.md` + ADR 0001; waves 0–3 as backlog seeds.
8. **Explicit rejects** — union of MAP Out of scope + per-artifact rejects.
9. **Deferred after map close** — restatement (see below).
10. **Glossary proposals** — terms for later `CONTEXT.md` (see below).
11. **Source index** — table of artifacts / resolutions / prototypes / ADR.

## BACKLOG outline (tracer bullets for later `/to-issues`)

Independently grabbable slices. Order roughly matches DD-07 waves; each bullet = one future issue sketch (title + 1–3 acceptance cues). **Do not** create Linear issues in this ticket.

### Wave 0 — Rules & docs hygiene

- W0a — Rewrite `.cursor/rules/loadzone-design-system.mdc` from SPEC §§3–4,7 (+ ADR 0001 cite).
- W0b — Update `.cursor/rules/loadzone-admin-shell.mdc` from admin principles / IA.
- W0c — Update `.cursor/rules/loadzone-player-pwa.mdc` for Assisted OQAT, calm streak, ≥48px, thin Spanish voice.
- W0d — Domain follow-up: promote glossary proposals into root `CONTEXT.md`.

### Wave 1 — Screen pilots

- W1a — Admin Wellness data surface → invisible list + one risk callout (DD-04 evidence; exercise library remains pattern reference). Soft: visual accept.
- W1b — Player check-in toward Focus-frame (A): Assisted one-question-at-a-time, calm streak chip, parental see-only affordances, thinned adaptive Spanish. Soft: final A accept.
- W1c — Staff-configurable Age Band cutoffs + Guardian receive/escalation settings surfaces (policy defaults, not hard-coded constants).

### Wave 2 — On-touch hygiene

- W2a — On touched screens: strip legacy shadcn authoring classes; prefer semantic tokens.
- W2b — Audit `bevel-card` / card wrappers against DD-01 exception list (admin).

### Wave 3 — Package hygiene

- W3a — Quarantine / no-new-usage for decorative DS exports (`noise-background`, `moving-border`, …); align with shadcn-migration — no forced mass delete.

### Adherence / domain (implementation — after doctrine)

- A1 — Reminder Consent × band defaults as staff-configurable Team/Club settings (+ PushSubscription UX).
- A2 — Anti-nag scheduler bounds (one auto + one staff re-nudge; quiet hours).
- A3 — Season-scoped Recoverable Streak + Excused Absence freeze (staff-marked first).
- A4 — Care Alert pipeline (injury / care-relevant flags) distinct from miss path; rate limits.
- A5 — Numeric red-flag wellness thresholds in form config (classes locked; numbers backlog).
- A6 — Care-slice field allow-list graduation (boundary locked).

### Explicitly not in this backlog wave set

Guardian auth / parent portal product; FUT-as-scores; geo attendance; competitive boards; promoting `QuestionCard` / PlayerCard into DS; Figma ceremony; dark OKLCH ladder polish as a first pilot.

## CONTEXT.md glossary proposals (follow-up domain write)

Do **not** edit `CONTEXT.md` in the synthesis implement wave unless explicitly expanded. List in SPEC appendix:

| Term | Source | Short meaning |
|---|---|---|
| **Age Band** | DD-02 | Assisted / Guided / Independent capability tier; indicative ages are configurable defaults. |
| **Guardian** | DD-02 | Adult helper / receive target; not default daily `apps/player` operator. |
| **Assisted Check-in** | DD-02 | Adult expected present; still Player-operated. |
| **Parental Supervision Layer** | DD-02 | See / receive / escalate — not co-app, not routine approve. |
| **Reminder Consent** | DD-06 | Who opts in for Player reminders and Guardian miss / Care Alert receives; staff-configurable defaults. |
| **Anti-nag Policy** | DD-06 | Caps, quiet hours, invitational tone; miss ≠ Care Alert. |
| **Recoverable Streak** | DD-06 | Season-scoped expected-day habit; no guilt UI; Excused freeze. |
| **Excused Absence** | DD-06 | Day that freezes streak (neither increments nor breaks). |
| **Health Escalation** | DD-06 | Care path distinct from miss reminders. |
| **Care Alert** | DD-06 | Guardian-facing care-slice signal (injury / care-relevant); never load ratios. |

**Avoid promoting:** “parent portal,” “family mode,” “teen app,” “streak punishment,” “attendance GPS,” “FUT health score.”

## Deferred after map close (restatement)

Carry forward MAP **Not yet specified** + artifact fog — synthesis records them; does not decide them:

- Guardian auth / account linkage; delivery mechanism (email / SMS / push).
- Exact care-slice field allow-lists (boundary locked).
- Legal/jurisdictional consent copy for minors’ wellness data.
- How Age Band is assigned/persisted (DOB vs manual tier).
- Football-identity / player-card depth before it becomes scoring.
- Exact numeric red-flag wellness thresholds.
- Excused Absence: staff-only vs Assisted Guardian-request workflow.
- Dark OKLCH ladder polish; player `ThemeProvider` light vs system wiring.
- Soft visual accept of DD-04 / thinned DD-05 A (layout winners only — doctrine stays).

## Soft notes (do not block SPEC)

| Item | Status | How SPEC treats it |
|---|---|---|
| DD-04 admin prototype | Principles held; human visual accept may still be pending | Cite as evidence; structural invisible-list rules binding from DD-01 |
| DD-05 player prototype | Keep **A** + thinned copy; final visual accept may still be pending | Binding direction: Focus frame, bands, calm thin Spanish; pixel chrome soft |

## Decisions so far

### Auto

1. **[auto] Spec + backlog docs only** — No production app/DS code, no Wave 0 rule file edits, no Linear `/to-issues` create in this ticket. Reason: MAP destination + ticket deliverables.
2. **[auto] Paths** — `SPEC.md` + `BACKLOG.md` under `.scratch/design-direction-wayfinder/`. Reason: map exit discoverability beside `MAP.md`.
3. **[auto] Synthesize locked doctrine only** — Sections mirror DD-01…07 artifacts/resolutions/ADR; no new product forks. Reason: exit ramp, not re-grill.
4. **[auto] Configurable Age Band / Guardian** — Restate as standing lock in SPEC purpose + settings backlog slice. Reason: human MAP override.
5. **[auto] DD-05 direction** — Keep variant A + thinned Spanish; B/C lab-only. Soft-note final visual accept. Reason: human reaction + MAP Decisions.
6. **[auto] Soft visual accepts do not block synthesis** — Record pending accepts; do not invent layout winners as hard doctrine. Reason: DD-07 graduation table + human “soft” instruction.
7. **[auto] Glossary = proposals list** — Aggregate DD-02 + DD-06 terms in SPEC; `CONTEXT.md` edit is a follow-up domain ticket (W0d). Reason: ticket deliverable 3; avoids drive-by domain write.
8. **[auto] Deferred list** — Restate MAP + artifact fog in SPEC §Deferred; do not decide fog items. Reason: ticket deliverable 4.
9. **[auto] Backlog shaped as tracer waves 0–3 + adherence slices** — Matches DD-07 migration + DD-06 implementation seeds; titles only. Reason: ticket deliverable 2; `/to-issues` later.
10. **[auto] On close** — Update MAP Decisions so far with SPEC/BACKLOG links; clear open decision tickets; allow MAP close. Reason: ticket exit ramp.
11. **[auto] Cite ADR 0001** — Do not rewrite package boundary. Reason: already Accepted.

### Assume

12. **[assume] SPEC is a synthesis narrative with source links, not a dump of full artifact verbatim** — Keep readable; authoritative detail remains in artifacts when SPEC points there for tables.  
    **Revert:** inline full artifact text into SPEC if handoff readers refuse to follow links.
13. **[assume] BACKLOG issue sketches stay Markdown bullets (no Linear IDs yet)** — `/to-issues` owns tracker publishing.  
    **Revert:** add provisional `DD-IMPL-*` local IDs if orchestrator wants stable cross-refs before Linear.
14. **[assume] Do not edit `.cursor/rules` or `CONTEXT.md` in the implement wave** — Spec/backlog only; W0 tickets execute later.  
    **Revert:** if human expands DD-08 to include Wave 0 rule diffs in the same PR.

### Hitl

None. All product decisions closed in DD-01…07. Remaining choices are assembly shape (`auto`/`assume`). Soft visual accepts are notes, not planning HITL.

## Decision ledger

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Docs-only synthesis | `auto` | MAP destination |
| 2 | SPEC/BACKLOG paths under wayfinder | `auto` | Exit discoverability |
| 3 | No new doctrine | `auto` | Exit ramp |
| 4 | Configurable bands/guardian restated | `auto` | Human lock |
| 5 | Keep A + thin copy | `auto` | DD-05 human |
| 6 | Soft accepts non-blocking | `auto` | DD-07 + instruction |
| 7 | Glossary proposals only | `auto` | Ticket #3 |
| 8 | Deferred restatement | `auto` | Ticket #4 |
| 9 | Tracer backlog waves | `auto` | Ticket #2 + DD-07 |
| 10 | MAP close hygiene | `auto` | Ticket exit |
| 11 | Cite ADR 0001 | `auto` | Precedent |
| 12 | Synthesis vs verbatim dump | `assume` | Reversible readability |
| 13 | Markdown backlog pre-Linear | `assume` | `/to-issues` later |
| 14 | No rules/CONTEXT edit this wave | `assume` | Contained; reversible |

**HITL count: 0** (under cap of 3). Ready to implement.

## Implement wave checklist

1. ~~Write `.scratch/design-direction-wayfinder/SPEC.md`~~ — done.
2. ~~Write `.scratch/design-direction-wayfinder/BACKLOG.md`~~ — done.
3. ~~Soft-note DD-04 / DD-05 visual accepts in SPEC~~ — done.
4. ~~Update parent `MAP.md` Decisions so far + link SPEC/BACKLOG; restated deferred; MAP Status closed~~ — done.
5. ~~Mark issue `08-…md` Status closed, Assignee orchestrator, Comments linking SPEC + BACKLOG~~ — done.
6. Commit + push this branch (implementer deliverable).

## Out of scope for this ticket

- Starting Wave 0–3 production work or creating Linear issues.
- Reopening DD-01…07 product HITLs.
- Guardian auth, parent portal, FUT scoring, geo attendance.
- Rewriting ADR 0001.
- Committing/pushing unless planning-map-only was already the ask (this map file is the planning deliverable).

## Human review (2026-08-03)

- **Orchestrator:** `DD-08: ok` — accept all auto/assume; proceed to write SPEC.md + BACKLOG.md and close the map exit ticket.
