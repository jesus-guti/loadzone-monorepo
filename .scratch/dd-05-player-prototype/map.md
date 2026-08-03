# DD-05 — Prototype the player check-in and reward loop

Planning map for wayfinder prototype ticket
`.scratch/design-direction-wayfinder/issues/05-prototype-the-player-check-in-and-reward-loop.md`.
Parent effort: [LoadZone Design Direction](../design-direction-wayfinder/MAP.md).
Locked parent: [Player age bands and parental supervision](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md).

**Status:** built · awaiting human reaction · **plan:** `auto` · **HITL count:** 0

## Destination

A throwaway **low-fi UI prototype** that answers:

> Does the age-adaptive player experience feel calm, fast, and motivating when applied to a concrete check-in + reward-loop?

The artifact must show Assisted one-question-at-a-time check-in, calm streak/reward (no miss punishment), where Parental Supervision Layer surfaces without making Guardian the primary operator, Guided/Independent deltas as notes or band toggle, and an optional football-identity teaser that does **not** claim medical/performance scoring.

**Built (2026-08-03):** in-app lab under `apps/player/app/[token]/prototype-dd-05/` gated by `?variant=` / `?band=`. Ticket marked done with run URLs; **human reaction** still required before folding principles.

## Notes

- **Skills:** `/prototype` → **UI branch** (look/feel), not LOGIC. Design rules: `.cursor/rules/loadzone-design-system.mdc` (`apps/player` Airbnb density, soft radius, minimal borders), `.cursor/rules/loadzone-player-pwa.mdc` (≥44px / prefer 48px targets, thumb zone, ≤3 questions/screen — Assisted goes stricter: **one** active question).
- **Locked from DD-02:** Age Bands Assisted / Guided / Independent; Player is primary operator; Guardian care slice (see completion + wellness/injury; receive miss/escalation — channels DD-06; approve nothing on routine DailyEntry); one adaptive Spanish copy strategy; anti-patterns (no co-app default, no guilt, no badge spam, no parent-as-primary).
- **Current `apps/player` skim (read-only):** token route `app/[token]` → `SessionPage` with pre/post tabs, progressive `QuestionCard` stack (active + completed + upcoming on one scroll), Flame streak badge + celebration (“¡Racha activa!”), physio alert dialog on high soreness, injury sheet. No Age Band / Guardian surfaces today. Spanish labels already concrete-ish but not band-adaptive.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Prefer **0 hitl** (`plan:auto`). Max 3. Do not close the wayfinder ticket from planning; do not commit/push from this wave.
- **Downstream:** hard-blocks DD-07 (prototype learnings → rule text vs experiment) and DD-08 (synthesis). Soft-feeds DD-06 (calm streak UX evidence) but does **not** decide reminder consent, channels, streak recovery, or escalation thresholds.

## Prototype plan (for the build wave)

### Question + shape

| Item | Choice |
|---|---|
| Branch | **UI** — structural variants of check-in + reward loop |
| Sub-shape | **A (preferred)** — host on existing `apps/player/app/[token]` route; when `?variant=` is absent, keep today’s `SessionPage`; when present, render prototype subtree only |
| Variant count | **3** radically different structures (`A` / `B` / `C`) |
| Band control | `?band=assisted\|guided\|independent` (default **`assisted`**) — same component tree; copy/register + supervision chrome adapt |
| Data | **In-memory stubs only** — fake questions, fake streak count, no `save-entry` / no token mutation |
| Run | One command already known: package-level player `pnpm --filter player dev` (or monorepo equivalent); open `/<any-dev-token>?variant=A&band=assisted` |
| Switcher | Floating bottom bar per UI.md (`←` / label / `→`, keyboard arrows, `NODE_ENV !== 'production'` gate) |
| Copy | Product UI **Spanish**; adaptive reading level per band (DD-02) |

### What every variant must include

1. **Assisted primary path:** one-question-at-a-time (only one active step on screen; completed collapse to compact summary rows or step dots — not a full upcoming stack competing for attention).
2. **Large targets:** primary answer controls ≥48×48; full-width primary CTA where used.
3. **1–3 minute path:** stub **3–5** wellness questions max for the demo (e.g. energía / cómo te sientes / sueño / agujetas) — plain Spanish; Assisted: short sentences, no load jargon.
4. **Completion + calm streak:** soft positive moment after submit; show streak as calm continuity (“X días seguidos” or quiet chip). **Never** show broken-streak guilt, red “lost”, or punishment copy if a miss scenario is illustrated.
5. **Parental Supervision Layer (UI only):** surface *where* Guardian would see/receive — not a co-operator chrome and not a parent portal. Channels/timing stay deferred to DD-06 (label as “se avisará…” / silent care note).
6. **Optional football-identity teaser:** card silhouette or soft attribute hint after completion; explicit non-claim (no numbers as “score”, no medical/performance wording).
7. **Guided / Independent deltas:** via `?band=` and a short on-variant caption (or collapsed “Cómo cambia por banda” note) — not separate apps.

### Three structural variants (must disagree on layout)

| Key | Name | Structure thesis |
|---|---|---|
| **A** | **Focus frame** | Full-bleed single question per step; big pictogram/chip answers; thin progress dots; after last answer → dedicated calm reward screen (streak + optional card silhouette). Parental: soft **Assisted Check-in** presence cue at entry (“Está bien que un adulto te acompañe”) — Player still answers. |
| **B** | **Quiet timeline** | Vertical completed-row timeline + one oversized active step (evolution of today’s `QuestionCard`, but Assisted hides upcoming cards). Streak lives as a quiet header chip (no Flame celebration wall). Parental: on care-relevant answer (e.g. high soreness / pain), **silent escalation affordance** — small non-blocking note “Tu club / adulto puede ver una alerta de cuidado” without approval gate. |
| **C** | **Reward-forward close** | Compact step flow; completion centers a **football-identity teaser** (silhouette / attribute hint) as the emotional beat, with streak as secondary calm line underneath. Parental: **deferred** post-submit banner (“Cuando termines, un adulto puede ver que completaste el check-in”) — see-only, no approve. |

Variants must differ in **information hierarchy and primary affordance**, not only color. Shared primitives (`Button`, `Badge`, semantic tokens) are fine; do not share one layout wrapper that forces sameness.

### Guided / Independent deltas (document in prototype UI)

| Band | Check-in | Copy | Supervision chrome |
|---|---|---|---|
| **Assisted** | One active question; adult expected present | Short, concrete Spanish | Presence cue OK; never Guardian-as-primary controls |
| **Guided** | May show light progressive peek (completed + active) or slightly denser labels | Plain Spanish | Post-hoc care notes / deferred see banner; still no approve |
| **Independent** | Same tree; optional denser wellness labels | Slightly denser wellness vocabulary OK | Supervision **off** in UI for 18+ demo; for 16–17 show optional club-policy footnote only — no routine gate |

### Explicit non-goals for the build

- Real persistence, push, or Guardian notification delivery (DD-06).
- Soft-approval of DailyEntry (rejected by DD-02).
- Mapping FUT attributes to real scores (parent MAP out of scope).
- Shipping production path changes on main; fold only after human reaction + later implementation effort.
- Per-band copy catalog products (revert trigger remains DD-02’s adaptive-strategy assume).

## Decisions so far

### Auto

1. **[auto] UI prototype branch** — Ticket asks whether the experience *feels* calm/fast/motivating; UI.md applies. Not a state-machine LOGIC prototype.
2. **[auto] Primary demo band = Assisted** — Ticket requires youngest-band OQAT; Guided/Independent are deltas on the same tree (DD-02 adaptive strategy).
3. **[auto] Three structural variants A/B/C** — UI.md default; names and theses locked in the prototype plan table above.
4. **[auto] Stub / in-memory only** — Prototype skill: no persistence by default; do not call real `save-entry` / injury actions.
5. **[auto] Touch + time budget** — Enforce player PWA ≥48px preference and 1–3 minute path with ≤5 stub questions.
6. **[auto] Calm streak / anti-punishment** — DD-02 + parent MAP anti-patterns; Flame-wall celebration from current `SessionPage` is a contrast case to soften, not copy.
7. **[auto] Parental surfaces are UI affordances only** — Banner / silent note / deferred see — aligned with DD-02 see/receive/approve; channels owned by DD-06.
8. **[auto] Football-identity teaser is optional non-scoring** — Parent MAP forbids medical/performance scoring claims; teaser may appear in ≥1 variant (C primary, A optional).
9. **[auto] Spanish adaptive copy, one tree** — DD-02 locked; prototype is the revert probe for per-band catalogs.
10. **[auto] Floating `?variant=` switcher + `?band=`** — UI.md switcher contract; band param demonstrates adaptive register without N products.
11. **[auto] Asset handoff** — After build wave: link route + variant keys on the wayfinder issue; capture verdict when human reacts; throwaway branch keeps full variant set (skill capture rules).

### Assume

12. **[assume] Sub-shape A on `app/[token]` gated by `?variant=`** — Prefer in-context player chrome (token layout, mobile width) over a vacuum route; absent `variant` keeps today’s `SessionPage` so the lab does not replace production UX by default.  
    **Revert:** move to throwaway sub-shape B route `app/[token]/prototype-dd-05` if hosting on the live page is too risky for review.
13. **[assume] Demo question set is a fixed stub (not live templates)** — Keeps the prototype runnable without DB/template coupling and focuses judgment on interaction.  
    **Revert:** wire read-only real template labels if reviewers need production question wording.
14. **[assume] Missed-day illustration is a secondary state toggle in the switcher or a “simular día perdido” control** — Shows calm non-punishment copy without building DD-06 recovery rules.  
    **Revert:** omit miss simulation and only document the anti-pattern in the caption.
15. **[assume] Prototype may use existing `QuestionCard` / inputs as starting atoms but each variant may replace layout freely** — Avoid shared mega-layout that collapses radical difference.  
    **Revert:** force all variants to wrap the current progressive stack if build time is too tight (weaker prototype).

### Hitl

None. Product forks for age/supervision are already locked by DD-02. Remaining choices are reversible prototype framing (`assume`) or skill/convention application (`auto`). Human reaction to the built artifact is the ticket’s **resolve** gate, not a planning HITL.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | UI vs LOGIC branch | `auto` | Ticket look/feel + `/prototype` UI.md |
| 2 | Assisted primary + band deltas | `auto` | Ticket + DD-02 |
| 3 | Three structural variants | `auto` | UI.md default |
| 4 | Stub data / no mutations | `auto` | Prototype skill |
| 5 | Calm streak / no punishment | `auto` | DD-02 anti-patterns |
| 6 | Parental UI surfaces only | `auto` | DD-02; channels → DD-06 |
| 7 | Non-scoring identity teaser | `auto` | Parent MAP out of scope |
| 8 | Host route = `[token]` + `?variant=` | `assume` | UI.md prefers A; reversible to B |
| 9 | Fixed stub questions | `assume` | Contained; reversible |
| 10 | Miss-day simulation control | `assume` | Soft feed DD-06; reversible |

**HITL count: 0** (under cap of 3). Ticket is well-formed and **ready to build** in the next wave.

## Build wave Decisions gist (2026-08-03)

Implemented as planned; no new HITL.

| Decision | Outcome |
|---|---|
| Host | `[token]` + `?variant=` / `?band=`; absent `variant` → production `SessionPage` |
| Lab token | `cprototype000000000000001` skips DB so the lab runs without seed |
| Variants | A Focus · B Quiet timeline · C Reward-forward — separate layout trees |
| Band | Default `assisted`; adaptive Spanish; ages labeled as configurable examples |
| Parental | A presence cue · B silent care note · C deferred see banner — no approve |
| Streak | Calm chip + miss simulation; no guilt copy |
| Football teaser | Non-scoring silhouette (C primary, A optional) |
| Persistence | None — in-memory stubs only |

## Not yet specified (post-reaction)

- Which variant “wins” after human review (post-artifact).
- Whether adaptive strings suffice vs per-band catalogs (DD-02 revert trigger — evidence from this prototype).
- How far football-identity goes before it feels like scoring (parent MAP fog; prototype only teasers).
- Reminder consent, notification channels, streak recovery, escalation thresholds (**DD-06**).
- Promotion of any player-only pattern into `@repo/design-system` (**DD-07**).

## Out of scope

- Guardian auth, parent portal, soft-approval, real push/escalation engines.
- Changing production check-in behavior on main (lab is query-gated only).
- Admin data-surface prototype (DD-04) or visual-language locks (DD-03).

## Human review (2026-08-03)

- **Orchestrator:** `ok a todo` — accept all auto/assume decisions and all HITL recommendations for this ticket.
- **Product override (global):** Age Band cutoffs and Guardian / Parental Supervision Layer settings MUST remain **staff-configurable at all times** (club/team policy). Indicative ages and Guardian defaults in resolutions are **defaults**, not hard-coded product constants. Spec language must say clubs can always retune bands and guardian receive/escalation options without a code change to product doctrine.
- **Decision #1 accepted:** in-app `apps/player` `[token]` lab with `?variant=` / `?band=` (throwaway; not production design ship).
- **Build:** artifact linked on wayfinder issue 05; awaiting human accept/reject/amend of player principles.
## Human reaction (2026-08-03) — variant A

- **Keep structural variant A (Focus frame)** — B and C rejected for the preferred direction.
- **Age bands OK** (Assisted / Guided / Independent) as shown.
- **Amend:** Spanish UI copy is **too dense and informative** — needs calmer, shorter, less explanatory product voice (especially chrome/banners/captions/hints; questions can stay short).
- **Follow-up:** implemented — thinned copy in `prototype-dd-05` (see Decisions amend below).

## Human review (2026-08-03) — thin copy authorized

- **Orchestrator:** `lanza 05 aligerar` — implementer may edit `apps/player/app/[token]/prototype-dd-05/` copy/chrome only (variant A preferred). Keep bands. Shorten dense explanatory Spanish.

## Decisions amend (2026-08-03) — thin Spanish copy

- **Keep A (Focus)** as preferred product direction; B/C remain lab contrasts only.
- **Age bands OK** — Assisted / Guided / Independent stay; indicative ages stay in lab meta, not as long player-facing parentheticals.
- **Copy voice:** calmer, shorter labels over essays — emptied `prototypeHint`, `deferredBanner`, `independentFootnote`, `footballTeaserHint`; shortened presence / care / completion / streak / prompts; BandCaption is a one-line quiet caption (no expandable essay); removed “Estado: N/total respondidas” and clinical Independent phrasing.
- **Still awaiting** final human visual accept of thinned A before folding principles into DD-07/08.
