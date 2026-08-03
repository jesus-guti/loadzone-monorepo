# LoadZone Design Direction

Status: closed
Labels: wayfinder:map

## Destination

An implementation-ready design and interaction specification for both LoadZone apps: a Linear-inspired staff workspace (`apps/app`) and a calm, age-adaptive player experience (`apps/player`) with parental supervision — plus a concrete backlog of implementation tickets ready for later handoff.

## Notes

- **Domain:** LoadZone amateur football wellness monitoring; vocabulary in root `CONTEXT.md`.
- **Skills every session should consult:** `/grilling`, `/domain-modeling`, `/prototype` for prototype tickets, existing design rules under `.cursor/rules/loadzone-design-system.mdc` and related app rules.
- **Standing preferences already locked for this effort:**
  - Destination artifact is a **spec + backlog**, not shipped code.
  - `apps/player` is **player-first and age-adaptive**, with parental supervision as a separate layer — not a joint family co-experience as the primary model, and not teen-only autonomy.
  - Scope includes **design language, interaction patterns, and adherence features** (check-in flow, reminders, recoverable streaks, calm motivation, health escalation). Pure visual token polish alone is too narrow; a full parent-portal product build and real performance/health scoring systems are out of scope for this map.
  - Prefer **outcomes over clones**: Linear and Headway are references, not pixel specifications.
  - Keep shared primitives in `@repo/design-system` app-agnostic; diverge via each app’s `globals.css` and app-local product patterns.
  - Product UI copy remains **Spanish**; repo docs and this map stay **English**.
- **Tracker:** local Markdown under `.scratch/`; see `docs/agents/issue-tracker.md` → Wayfinding operations.
- **Exit artifacts:** [SPEC.md](SPEC.md) · [BACKLOG.md](BACKLOG.md)

## Decisions so far

- **Configurable Age Bands & Guardian settings (2026-08-03):** Age Band cutoffs and Parental Supervision / Guardian receive–escalation options are always staff-configurable defaults, never fixed-only constants — clubs may retune without changing product doctrine.
- [Define admin experience principles](issues/01-define-admin-experience-principles.md) — three staff jobs (wellness/risk, sessions/exercises, roster/season/config); invisible data surfaces; cards as exceptions; progressive interaction; light default; color for state/risk — [artifact](artifacts/admin-experience-principles.md).
- [Define player age bands and parental supervision](issues/02-define-player-age-bands-and-parental-supervision.md) — Age Bands Assisted (~under 10) / Guided (~10–15) / Independent (16+); Player-first; Guardian see+notify only (care slice, no routine approve); one adaptive Spanish copy strategy — [resolution](resolutions/player-age-bands-and-parental-supervision.md).
- [Decide shared visual language and app divergence](issues/03-decide-shared-visual-language-and-app-divergence.md) — shared sage (~OKLCH 160–162); diverge density/radius/border/elevation/motion only; Geist; Phosphor fill vs regular/bold; light defaults; semantic tokens keep / legacy shadcn retire; `--surface-*` internal — [artifact](artifacts/shared-visual-language-and-app-divergence.md).
- [Prototype the admin data surface](issues/04-prototype-the-admin-data-surface.md) — throwaway **rejected** as layout winner; keep live `apps/app`; **only** larger sidebar icons kept — [resolution](resolutions/admin-data-surface-prototype.md).
- [Prototype the player check-in and reward loop](issues/05-prototype-the-player-check-in-and-reward-loop.md) — keep **variant A (Focus)**; bands OK; Spanish copy thinned; lab under `apps/player/app/[token]/prototype-dd-05/`.
- [Define reminders, streaks, and health escalation](issues/06-define-reminders-streaks-and-health-escalation.md) — Player push+in-app / Guardian receive-only / staff re-nudge; anti-nag; consent×band defaults (configurable); Season-scoped recoverable streaks + Excused Absence freeze; Care Alerts for injury/care flags — [artifact](artifacts/reminders-streaks-and-health-escalation.md).
- [Define design-system governance and migration boundary](issues/07-define-design-system-governance-and-migration-boundary.md) — DS = app-agnostic primitives; five promotion gates; no app kits in package; migration waves 0–3 — [artifact](artifacts/design-system-governance-and-migration.md) · [ADR 0001](../../docs/adr/0001-design-system-package-boundary.md).
- [Synthesize the design direction specification](issues/08-synthesize-the-design-direction-specification.md) — map exit: [SPEC.md](SPEC.md) + [BACKLOG.md](BACKLOG.md).

## Not yet specified

Deferred detail lives in [SPEC.md](SPEC.md) § deferred / fog restatement (Guardian auth, care-slice field allow-lists, legal consent copy, Age Band persistence, player-card scoring boundary, numeric red-flag thresholds, Guardian delivery mechanism, Excused Absence workflow).

## Out of scope

- Implementing the design changes in app code during this map (destination is the spec and backlog; execution is a later effort).
- Mandatory dark-first industrial theme or a fixed `#080A0A` base palette.
- Adopting the contradictory spacing scale from the source document (claims 4px multiples while listing 5 / 11 / 13 / 19).
- Mapping FUT attributes into real medical or on-pitch performance scores.
- Geolocation-based attendance as a default mechanism.
- Ambient audio, triangular mouse-intent menus, and high-resolution card export before the core check-in habit is validated.
- Automatic promotion of components to the Core Kit solely because they appear more than twice.
- Childish competitive leaderboards, loud badge spam, or punishment UX for missed check-ins.
- Building a full illustrated Headway-style content library wholesale.
