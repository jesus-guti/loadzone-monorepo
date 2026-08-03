# LoadZone Design Direction — Specification

Status: accepted (map exit)  
Date: 2026-08-03  
Parent: [MAP.md](MAP.md)  
Planning: [DD-08 map](../dd-08-synthesize/map.md) (human `DD-08: ok`)  
Implementation handoff: [BACKLOG.md](BACKLOG.md)

This document is the **implementation-ready** design and interaction specification for LoadZone’s two product apps. It **synthesizes** locked wayfinder doctrine; it does not invent new product forks. Authoritative detail for tables and edge cases remains in the linked artifacts, resolution, ADR, and prototype maps.

**Language:** English (this doc). Product UI copy remains **Spanish**.

---

## 1. Purpose & standing locks

### Destination

An implementation-ready design/interaction direction for:

- `apps/app` — dense, calm staff workspace (Linear/Attio as density references, not clones)
- `apps/player` — calm, age-adaptive player check-in with a separate Parental Supervision Layer

plus a tracer-bullet backlog for later `/to-issues` handoff. This wayfinder’s destination is **spec + backlog**, not shipped product code.

### Standing locks (do not reopen)

| Lock | Meaning |
|---|---|
| **Outcomes over clones** | Linear and Headway inform density / calm motivation — not pixel specs or issue-tracker metaphors. |
| **Player-first, age-adaptive** | Player is the daily operator of `apps/player` across all Age Bands. Parental Supervision is a separate layer, not a joint family co-app. |
| **Age Band / Guardian always staff-configurable** | Indicative ages and consent×band defaults are **policy defaults only**. Clubs/teams may retune Age Band cutoffs and Guardian receive/escalation options without changing product doctrine. Never hard-code fixed-only constants. |
| **Shared primitives, app divergence** | `@repo/design-system` stays app-agnostic; each app injects identity via `globals.css` and app-local compositions. |
| **Spanish UI / English docs** | Product copy Spanish; repo docs, ADRs, specs English. |
| **Soft visual accepts** | DD-04 layout **rejected** (keep current admin UI; only larger sidebar icons). DD-05 Focus-frame (A) + thinned Spanish may still await final human pixel accept. **Doctrine stays binding** where locked. |

### Soft visual-accept notes (non-blocking)

| Prototype | Doctrine status | Soft note |
|---|---|---|
| **DD-04** admin Wellness list | DD-01 invisible-surface doctrine unchanged | **Layout rejected (2026-08-03).** Do not clone throwaway. Keep production chrome. **Amend only:** larger sidebar icons. |
| **DD-05** player check-in | Keep **variant A (Focus frame)** + thinned calm Spanish; B/C lab-only | Final visual accept of A’s pixel chrome may still be pending — binding: Focus frame, bands, calm thin Spanish |

---

## 2. Admin experience (`apps/app`)

Source: [admin-experience-principles.md](artifacts/admin-experience-principles.md) · evidence: [DD-04 prototype](../dd-04-admin-prototype/)

### Jobs (priority order)

1. Monitor team wellness and risk day to day  
2. Operate sessions and training content  
3. Manage roster, season, and configuration  

**Impeccable** = dense, calm, predictable operational clarity — not sports-marketing chrome or issue-tracker bureaucracy.

### Shell & IA

- Team-centric shell around a single `activeTeam`.
- **Primary nav:** Inicio, Wellness, Sesiones, Configuración (desktop sidebar ≡ mobile bottom-nav config).
- **Secondary:** Jugadores, Ejercicios, Lesiones, Temporadas, Análisis IA — contextual, not primary chrome growth without evidence.

### Data surfaces (default)

**Invisible horizontal lists and tables:**

- No four-sided enclosing box around the whole list/table  
- Row separation primarily horizontal; no vertical list-frame borders  
- Group/column labels: small, uppercase, wide tracking, secondary text  
- Toolbars: underline language (`border-b border-border-secondary`), no card chrome, no structural shadow  
- Canonical reference: exercise library (**live product**). DD-04 throwaway is **not** a layout winner (rejected 2026-08-03); optional Wellness restyle later only if requested, baseline = current UI.

Elevation only on **floating** surfaces (dialogs, popovers, menus, tooltips).

### Cards (exceptions only)

Allowed for: (1) floating elevated UI, (2) a single interactive decision widget where removing frame hurts interaction, (3) a compact risk/status callout that does **not** wrap a list/table. Not for libraries, tables, or multi-row operational lists.

### Interaction

- Progressive, not Linear-clone: predictable nav, dense keyboard-friendly controls, search/filter/sort on library/list surfaces, clear focus + pending feedback.
- Bulk actions **opt-in per surface** when a concrete multi-item workflow exists — not global multi-select doctrine.
- Refuse Linear product metaphors (issues, cycles, ticket IDs) in staff UX.

### Theme, color, icons

- Default **light**; dark remains a preference.  
- Color for **state, risk, affordance** — semantic tokens (`brand`, `premium`, `danger`, text/bg/border scales).  
- Phosphor; admin dense chrome default weight **`fill`**.

---

## 3. Player age bands & parental supervision

Source: [player-age-bands-and-parental-supervision.md](resolutions/player-age-bands-and-parental-supervision.md)

### Age Bands (capability tiers)

Indicative ages guide assignment; the product rule is the tier’s autonomy. **Cutoffs are always staff-configurable defaults.**

| Age Band | Indicative default ages | Autonomy |
|---|---|---|
| **Assisted** | ~under 10 | Adult expected present (**Assisted Check-in**); routine DailyEntry submit is **not** gated on Guardian approval |
| **Guided** | ~10–15 | Player may complete alone; Parental Supervision Layer applies post-hoc |
| **Independent** | 16+ | Player operates alone; layer **off by default at 18+**; for **16–17** Guardian escalation optional by club policy |

**Primary operator:** the **Player** across all bands. Guardian helps or supervises — never the default daily user of `apps/player`.

### Parental Supervision Layer (see / receive / approve)

| Capability | Rule |
|---|---|
| **See** | Check-in completion status + wellness / injury (care-relevant) alerts |
| **Receive** | Miss and Care Alert notifications (channels/timing: §5; delivery mech still deferred) |
| **Approve** | **Nothing** on the routine DailyEntry path |

### Visibility: staff vs Guardian

- **Staff:** full DailyEntry, load, injury context for coaching/ops  
- **Guardian:** **care slice** only — completed status, escalated flags, injury-relevant signals; **no** load ratios, staff notes, or peer comparison  

Exact field allow-lists remain deferred; the boundary is locked.

### Spanish copy

**One adaptive strategy** (same component tree): Assisted = short concrete, no load jargon; Guided = plain Spanish; Independent = slightly denser wellness labels. Not separate copy products per band.

---

## 4. Shared visual language & app divergence

Source: [shared-visual-language-and-app-divergence.md](artifacts/shared-visual-language-and-app-divergence.md)

| Concern | Rule |
|---|---|
| **Brand hue** | Shared **sage** family (~OKLCH hue **160–162**) for both apps — diverge via density/radius/border/elevation/motion/type scale, **not** a second brand hue |
| **`apps/app`** | Dense: `--radius: 0.25rem`; visible borders where structure needs them; invisible list frames |
| **`apps/player`** | Airier: `--radius: 1rem`; minimal borders in check-in chrome; thumb-friendly |
| **Elevation** | Floating surfaces only — no structural shadows on ordinary cards/lists/toolbars |
| **Typography** | Geist Sans + Mono both apps; Age Band friendliness via copy register, not a second typeface |
| **Icons** | Phosphor only; admin `fill`; player `regular`/`bold`; player touch **44×44** required, **48×48** preferred |
| **Motion** | Prefer `transform`/`opacity`; micro ≤200ms, UI ≤300ms, rare celebration ≤500ms; honor `prefers-reduced-motion` |
| **Light/dark** | Both apps light-first; mandatory dark-first / `#080A0A` rejected; exact dark OKLCH ladders deferred |
| **Tokens** | Author with `bg-bg-*`, `text-text-*`, `border-border-*`, `brand` / `premium` / `danger` / `success`; retire legacy shadcn authoring (`bg-card`, `bg-muted`, `text-muted-foreground`, …); `--surface-*` internal aliases only |
| **No per-band chrome** | One player tree; adapt copy/register only — Age Band / Guardian settings stay staff-configurable policy |

Spacing stays **4px multiples** only (reject contradictory 5/11/13/19 scales).

---

## 5. Adherence: reminders, streaks, health escalation

Source: [reminders-streaks-and-health-escalation.md](artifacts/reminders-streaks-and-health-escalation.md)

**Configurability override:** Age Band cutoffs and Guardian / Parental Supervision settings (consent who opts in, miss/Care Alert receives, Independent 16–17 supervision, escalation toggles) are **always staff-configurable**. Tables below are defaults.

### Channels (logical)

| Audience | Channels |
|---|---|
| **Player** | Web Push when subscribed; calm in-app reminder state (not modal spam). No SMS-to-Player as default. |
| **Guardian** | Receive-only miss + Care Alert via Parental Supervision Layer (delivery mech fog with auth). |
| **Staff** | In-app wellness ops + optional bounded player re-nudge — not “reminded as Guardians.” |

### Anti-nag Policy

Per expected check-in window: at most **one** automated Player reminder + at most **one** staff re-nudge; quiet hours; invitational Spanish (“cuando puedas”); Guardian miss notify at most one per missed window. **Miss reminders ≠ Care Alerts.**

### Reminder Consent × Age Band (defaults)

| Age Band | Player reminders | Guardian miss + Care Alert receives |
|---|---|---|
| Assisted | Guardian consents | On (Guardian consents at setup) |
| Guided | Player may opt in; Guardian can revoke Player push | On when layer active |
| Independent 16–17 | Player consents | Only if club enables layer; then Guardian consents |
| Independent 18+ | Player consents | Off by default |

### Recoverable Streak

Season-scoped expected-day habit: increments on completing expected DailyEntry obligations; breaks on miss without Excused Absence (calm restart, no guilt UI); **Excused Absence** freezes (neither increments nor breaks). Never public shame boards. Aligns with wellness completion, not geo presence.

### Health Escalation / Care Alert

| Trigger | Staff | Guardian | Player |
|---|---|---|---|
| Injury / pain flag | Full context | Care Alert (care slice) when layer on | Calm confirm only — no shame framing |
| Immediate red-flag wellness (care-relevant) | Full | Care Alert if care-relevant | Same calm confirm if fired |
| Sustained load / ACWR | Staff only | **Never** | **Never** |
| Missed check-in | Pending / re-nudge | Miss notify (not Care Alert) | Calm pending only |

Rate-limit: at most one Care Alert per trigger class per calendar day per Player (unless later staff manual escalate). Numeric red-flag thresholds and exact care-slice field lists are backlog.

### Motivation

**In scope:** calm recoverable streaks; optional football-identity teaser that does **not** claim real scoring.  
**Deferred:** ambient audio; FUT-as-health/performance scores; high-res card export before habit validated; competitive boards / badge spam.

---

## 6. Player check-in & reward direction

Sources: [DD-05 map](../dd-05-player-prototype/map.md) · MAP Decisions · thinned Spanish (`8d60394`)

| Decision | Binding direction |
|---|---|
| **Layout winner** | Keep **variant A — Focus frame**: full-bleed one question per step; big answer targets; thin progress; dedicated calm reward screen (streak + optional non-scoring card silhouette) |
| **Bands** | Assisted OQAT; Guided/Independent via same tree + adaptive copy; parental see-only affordances (never Guardian-as-primary) |
| **Copy** | Thinned calm Spanish; adaptive reading level per band |
| **Variants B/C** | Lab-only evidence; do not ship as primary path |
| **Soft** | Final human visual accept of A’s pixel chrome may still be pending — does not reopen Focus-frame / band / thin-copy doctrine |

---

## 7. Design-system governance & migration

Sources: [design-system-governance-and-migration.md](artifacts/design-system-governance-and-migration.md) · [ADR 0001](../../docs/adr/0001-design-system-package-boundary.md)

### Package boundary (ADR 0001 — Accepted)

- `@repo/design-system` = app-agnostic shared primitives + infrastructure only  
- **No** `components/admin/*` or `components/player/*` kits; no split `@repo/ui-admin` / `@repo/ui-player`  
- Promotion requires **all five intentional gates** (never use-count alone): app-agnostic contract; same interaction need across ≥2 product boundaries; token-driven appearance; intentional move PR; prefer regenerable registry primitives  
- Admin utilities (`bevel-card`, `glass-surface`, …) and player compositions (`QuestionCard`, streak chrome, …) stay **app-local** until gates pass  
- Shared primitives must **not** fork chrome per Age Band  

### Migration waves (after this map)

| Wave | Intent |
|---|---|
| **0 — Rules** | Rewrite Cursor rules from this SPEC + artifacts; promote glossary via domain follow-up; ADR already shipped |
| **1 — Pilots** | Admin Wellness invisible list + one risk callout; player Focus-frame check-in; staff-configurable Age Band / Guardian settings surfaces |
| **2 — On-touch** | Strip legacy shadcn authoring; audit card/`bevel-card` against DD-01 exceptions |
| **3 — Package hygiene** | Quarantine / no-new-usage for decorative DS exports; align with shadcn-migration — no forced mass delete |

Prototype → rule: locked doctrine becomes rule text in Wave 0; throwaway prototype trees never promote into DS. Soft visual accepts gate layout winners in pilots, not doctrine.

ADRs stay rare (package boundary, public token vocabulary, base component library). Ordinary principle updates → `.cursor/rules` + wayfinder artifacts.

---

## 8. Explicit rejects

Union of MAP **Out of scope** and per-artifact rejects:

- Implementing design changes as production code inside this map (destination was spec + backlog)
- Mandatory dark-first / `#080A0A` industrial theme; contradictory non-4px spacing scales
- FUT attributes as medical / on-pitch performance scores; geolocation attendance as default
- Ambient audio; triangular mouse-intent menus; high-res card export before habit validated
- Use-count auto-promote; app kits inside DS; Figma dual-kit ceremony
- Co-experience / parent-portal as primary model; teen-only autonomy; Guardian as daily `apps/player` operator
- Soft-approval of routine DailyEntry; guilt/punishment miss UX; competitive adherence boards / badge spam
- Mixing miss-reminder severity with health-escalation framing; Care Alerts as adherence spam
- Per-Age-Band visual chrome forks; split brand hues between apps
- Structural shadows on ordinary cards/list frames; legacy shadcn as product authoring vocabulary

---

## 9. Deferred after map close

Recorded for later efforts — **not decided** by this synthesis:

- Guardian auth / account linkage; delivery mechanism (email / SMS / push)
- Exact care-slice field allow-lists (boundary locked in §5)
- Legal/jurisdictional consent copy for minors’ wellness data
- How Age Band is assigned/persisted (DOB vs manual tier)
- Football-identity / player-card depth before it becomes scoring
- Exact numeric red-flag wellness thresholds (classes locked)
- Excused Absence: staff-only vs Assisted Guardian-request workflow
- Dark OKLCH ladder polish; player `ThemeProvider` light vs system wiring
- Soft visual accept of DD-04 / thinned DD-05 A (layout winners only — doctrine stays)
- Push permission UX copy and browser-permission recovery

See also [BACKLOG.md](BACKLOG.md) for which deferred items have implementation seeds vs remain fog.

---

## 10. Glossary proposals (for later `CONTEXT.md`)

Do **not** edit root `CONTEXT.md` in the DD-08 implement wave. Promote these in a domain follow-up (BACKLOG W0d).

| Term | Source | Short meaning |
|---|---|---|
| **Age Band** | DD-02 | Assisted / Guided / Independent capability tier; indicative ages are configurable defaults |
| **Guardian** | DD-02 | Adult helper / receive target; not default daily `apps/player` operator |
| **Assisted Check-in** | DD-02 | Adult expected present; still Player-operated |
| **Parental Supervision Layer** | DD-02 | See / receive / escalate — not co-app, not routine approve |
| **Reminder Consent** | DD-06 | Who opts in for Player reminders and Guardian miss / Care Alert receives; staff-configurable defaults |
| **Anti-nag Policy** | DD-06 | Caps, quiet hours, invitational tone; miss ≠ Care Alert |
| **Recoverable Streak** | DD-06 | Season-scoped expected-day habit; no guilt UI; Excused freeze |
| **Excused Absence** | DD-06 | Day that freezes streak (neither increments nor breaks) |
| **Health Escalation** | DD-06 | Care path distinct from miss reminders |
| **Care Alert** | DD-06 | Guardian-facing care-slice signal (injury / care-relevant); never load ratios |

**Avoid promoting:** “parent portal,” “family mode,” “teen app,” “streak punishment,” “attendance GPS,” “FUT health score.”

---

## 11. Source index

| Kind | Path |
|---|---|
| Parent map | [MAP.md](MAP.md) |
| DD-08 planning | [../dd-08-synthesize/map.md](../dd-08-synthesize/map.md) |
| Admin principles | [artifacts/admin-experience-principles.md](artifacts/admin-experience-principles.md) |
| Age bands / Guardian | [resolutions/player-age-bands-and-parental-supervision.md](resolutions/player-age-bands-and-parental-supervision.md) |
| Visual language | [artifacts/shared-visual-language-and-app-divergence.md](artifacts/shared-visual-language-and-app-divergence.md) |
| Adherence | [artifacts/reminders-streaks-and-health-escalation.md](artifacts/reminders-streaks-and-health-escalation.md) |
| Governance / migration | [artifacts/design-system-governance-and-migration.md](artifacts/design-system-governance-and-migration.md) |
| Package boundary ADR | [docs/adr/0001-design-system-package-boundary.md](../../docs/adr/0001-design-system-package-boundary.md) |
| Admin prototype | [../dd-04-admin-prototype/](../dd-04-admin-prototype/) |
| Player prototype map | [../dd-05-player-prototype/map.md](../dd-05-player-prototype/map.md) |
| Implementation backlog | [BACKLOG.md](BACKLOG.md) |
