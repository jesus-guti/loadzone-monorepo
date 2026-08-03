# LoadZone Design Direction — Implementation backlog

Status: ready for `/to-issues`  
Date: 2026-08-03  
Parent: [MAP.md](MAP.md) · Spec: [SPEC.md](SPEC.md)  
Source waves: DD-07 governance + DD-06 adherence seeds · Planning: [DD-08 map](../dd-08-synthesize/map.md)

Independently grabbable **tracer-bullet** slices. Markdown sketches only — **no Linear IDs**. Do not start implementation from this file alone without promoting via `/to-issues` (or manual tracker create).

Each bullet: title + acceptance cues. Prefer one vertical slice per future issue.

---

## Wave 0 — Rules & docs hygiene

- **W0a — Rewrite design-system Cursor rules from SPEC**  
  Port SPEC §§2–4,7 (+ ADR 0001 cite) into `.cursor/rules/loadzone-design-system.mdc`. Acceptance: semantic tokens / sage / elevation / no app kits / promotion gates summarized; no production CSS edits in the same PR unless scoped separately.

- **W0b — Update admin-shell rules from DD-01**  
  Rewrite `.cursor/rules/loadzone-admin-shell.mdc` for team-centric IA, primary vs secondary destinations, invisible data surfaces, cards-as-exceptions. Acceptance: rule text matches [admin-experience-principles.md](artifacts/admin-experience-principles.md).

- **W0c — Update player-PWA rules for age-adaptive calm check-in**  
  Update `.cursor/rules/loadzone-player-pwa.mdc` for Assisted OQAT, calm streak (no guilt), ≥48px preferred targets, thinned adaptive Spanish voice, parental see-only (not Guardian-as-primary). Acceptance: aligns with SPEC §§3,5–6.

- **W0d — Promote glossary proposals into root CONTEXT.md**  
  Domain follow-up: add SPEC §10 terms (Age Band, Guardian, Assisted Check-in, Parental Supervision Layer, Reminder Consent, Anti-nag Policy, Recoverable Streak, Excused Absence, Health Escalation, Care Alert). Acceptance: terms live in `CONTEXT.md`; avoid rejected vocabulary.

---

## Wave 1 — Screen pilots

- **W1a — Admin shell: larger sidebar icons only**  
  Bump Phosphor / nav icon size in `apps/app` sidebar (the sole liked change from DD-04). **Do not** restyle Wellness toward the DD-04 throwaway list chrome — keep current production data surfaces. Acceptance: sidebar icons visibly larger; Wellness/list layouts unchanged unless separately requested.

- **W1a-deferred — Admin Wellness invisible-list restyle**  
  ~~Former W1a (clone DD-04 Wellness invisible list + risk callout).~~ **Deferred / cancelled as DD-04 layout winner** after human reject. Revisit only on explicit staff ask; baseline remains live `apps/app`.

- **W1b — Player check-in toward Focus-frame (A)**  
  Production path toward Focus frame: Assisted one-question-at-a-time, calm streak chip, parental see-only affordances, thinned adaptive Spanish. Soft: final A visual accept may still be pending. Acceptance: B/C not primary; no guilt miss UX; Player remains operator.

- **W1c — Staff-configurable Age Band cutoffs + Guardian settings**  
  Team/Club settings surfaces for Age Band cutoffs and Guardian receive/escalation options (policy defaults, never fixed-only constants). Acceptance: staff can retune without code changes to doctrine; Independent 16–17 supervision opt exposed as policy.

---

## Wave 2 — On-touch hygiene

- **W2a — Strip legacy shadcn authoring on touched screens**  
  When a screen is restyled, replace `bg-card` / `bg-muted` / `text-muted-foreground` / similar with semantic tokens. Acceptance: no new legacy authoring on touched files; no big-bang restyle of untouched screens.

- **W2b — Audit bevel-card / card wrappers against DD-01 exceptions**  
  On touched admin screens, remove or retain `bevel-card` / framed cards only where DD-01 exceptions allow. Acceptance: invisible lists/toolbars stay frameless; floating/exception callouts documented if kept.

---

## Wave 3 — Package hygiene

- **W3a — Quarantine decorative DS exports**  
  Mark decorative shared exports (`noise-background`, `moving-border`, hover-border-gradient, …) as no-new-usage / quarantine; align with shadcn-migration. Acceptance: no forced mass delete in one PR; contribution guide or rules note rejects new call sites.

---

## Adherence / domain (after doctrine — implementation)

- **A1 — Reminder Consent × band defaults as staff-configurable settings**  
  Team/Club settings for consent×band defaults + PushSubscription UX for Player. Acceptance: defaults match SPEC §5 table; staff can retune; no hard-coded fixed-only consent.

- **A2 — Anti-nag scheduler bounds**  
  At most one auto Player reminder + one staff re-nudge per expected window; quiet hours. Acceptance: caps enforced; invitational Spanish; miss path distinct from Care Alert.

- **A3 — Season-scoped Recoverable Streak + Excused Absence freeze**  
  Persist Season-scoped `currentStreak`; Excused Absence freezes (staff-marked first). Acceptance: no guilt UI on break; calm restart; Season reset behavior documented.

- **A4 — Care Alert pipeline**  
  Injury / care-relevant flags → Guardian Care Alert distinct from miss path; rate limits (one per class per day per Player). Acceptance: never load ratios in Guardian slice; Player calm confirm only.

- **A5 — Numeric red-flag wellness thresholds in form config**  
  Classes locked in SPEC; ship numeric thresholds via form/config. Acceptance: thresholds configurable; ACWR anomalies stay staff-only.

- **A6 — Care-slice field allow-list graduation**  
  Boundary locked (no load ratios / staff notes / peer comparison); graduate exact field allow-list. Acceptance: documented allow-list reviewed; staff vs Guardian visibility tests.

---

## Explicitly not in this backlog wave set

- Guardian auth / parent portal product  
- FUT-as-scores; geo attendance; competitive boards  
- Promoting `QuestionCard` / PlayerCard into `@repo/design-system`  
- Figma ceremony  
- Dark OKLCH ladder polish as a first pilot  
- Soft-approval of routine DailyEntry  

Fog items without a slice above remain deferred in [SPEC.md §9](SPEC.md) until a later effort opens them.
