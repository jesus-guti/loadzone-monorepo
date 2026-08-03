# LoadZone Design Direction

Status: open
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

## Decisions so far

- **Configurable Age Bands & Guardian settings (2026-08-03):** Age Band cutoffs and Parental Supervision / Guardian receive–escalation options are always staff-configurable defaults, never fixed-only constants — clubs may retune without changing product doctrine.
- [Define admin experience principles](issues/01-define-admin-experience-principles.md) — three staff jobs (wellness/risk, sessions/exercises, roster/season/config); invisible data surfaces; cards as exceptions; progressive interaction; light default; color for state/risk — [artifact](artifacts/admin-experience-principles.md).
- [Define player age bands and parental supervision](issues/02-define-player-age-bands-and-parental-supervision.md) — Age Bands Assisted (~under 10) / Guided (~10–15) / Independent (16+); Player-first; Guardian see+notify only (care slice, no routine approve); one adaptive Spanish copy strategy — [resolution](resolutions/player-age-bands-and-parental-supervision.md).
- [Decide shared visual language and app divergence](issues/03-decide-shared-visual-language-and-app-divergence.md) — shared sage (~OKLCH 160–162); diverge density/radius/border/elevation/motion only; Geist; Phosphor fill vs regular/bold; light defaults; semantic tokens keep / legacy shadcn retire; `--surface-*` internal — [artifact](artifacts/shared-visual-language-and-app-divergence.md).
- [Define reminders, streaks, and health escalation](issues/06-define-reminders-streaks-and-health-escalation.md) — Player push+in-app / Guardian receive-only / staff re-nudge; anti-nag; consent×band defaults (configurable); Season-scoped recoverable streaks + Excused Absence freeze; Care Alerts for injury/care flags (not ACWR, not miss); calm motivation in / competitive+FUT deferred — [artifact](artifacts/reminders-streaks-and-health-escalation.md).
- [Prototype the admin data surface](issues/04-prototype-the-admin-data-surface.md) — throwaway Wellness list prototype (invisible rows + one risk callout + locked nav); principles held pending human visual accept — [prototype](../dd-04-admin-prototype/prototype/).
- [Prototype the player check-in and reward loop](issues/05-prototype-the-player-check-in-and-reward-loop.md) — throwaway lab on `apps/player` `[token]?variant=` / `?band=` (A Focus / B Quiet timeline / C Reward-forward); Assisted OQAT; calm streak; parental see-only surfaces; non-scoring football teaser. Awaiting human reaction to principles.

>>>>>>> origin/jgutierrez/dd-04-admin-data-prototype

>>>>>>> origin/jgutierrez/dd-06-reminders-streaks
>>>>>>> origin/jgutierrez/dd-05-player-checkin-prototype

## Not yet specified

- Guardian auth / account linkage (notification-only contacts vs login); parent surface product remains fog beyond the supervision layer.
- Exact care-slice field allow-lists vs staff DailyEntry (injury / care-relevant boundary locked in DD-06; field list graduates in backlog).
- Exact care-slice field allow-lists vs staff DailyEntry (refine with DD-06 escalation).
>>>>>>> origin/jgutierrez/dd-04-admin-data-prototype
>>>>>>> origin/jgutierrez/dd-06-reminders-streaks
- Legal/jurisdictional consent copy for minors’ wellness data (policy).
- How Age Band is assigned/persisted in admin (DOB vs manual tier) — implementation backlog.
- How far the player card / football identity layer goes before it becomes a scoring system.
- Migration sequencing from current Attio/Airbnb-framed rules and surfaces to the new principles (which screens first, what can wait).
- Exact numeric thresholds for immediate red-flag wellness form fields (classes locked in DD-06).
- Guardian contact delivery mechanism (email / SMS / push) once auth fog clears.
- Whether Excused Absence is staff-only vs Guardian-request workflow (Assisted).
- Whether admin and player should diverge in brand hue, or keep a shared sage family with different density/radius/motion only.
- Notification timing, channels, and anti-nag rules once reminders are defined (DD-06).
- How recoverable streaks interact with season boundaries and missed sessions that are not the player’s fault (DD-06).
>>>>>>> origin/jgutierrez/dd-04-admin-data-prototype
>>>>>>> origin/jgutierrez/dd-06-reminders-streaks

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
