# Primeros pasos (Recommended Setup)

Linear: [JES-81](https://linear.app/jesus-guti-workspace/issue/JES-81/primeros-pasos-recommended-setup-for-staff-first-run-guidance)

### Tickets

| # | Issue | Blocked by |
|---|--------|------------|
| 1 | [JES-82](https://linear.app/jesus-guti-workspace/issue/JES-82/recommended-setup-resolver-tests) Resolver + tests | — |
| 2 | [JES-83](https://linear.app/jesus-guti-workspace/issue/JES-83/club-facts-in-shell-primeros-pasos-sidebar-panel) Club facts + sidebar panel | JES-82 |
| 3 | [JES-84](https://linear.app/jesus-guti-workspace/issue/JES-84/wellness-operational-baseline-empty-states) Wellness empty states | JES-82 |
| 4 | [JES-85](https://linear.app/jesus-guti-workspace/issue/JES-85/reopen-primeros-pasos-from-settings-club) Reopen from Settings → Club | JES-83 |

In-repo PRD for staff first-run guidance after hard onboarding. Domain vocabulary: root `CONTEXT.md` (**Operational Baseline**, **Recommended Setup**).

## Problem Statement

After creating a **Club** and first **Team**, new staff land in the shell (Wellness as home) without a clear next path. Missing **Season**, **Players**, club branding, exercise use, and sessions leave empty operational surfaces with little guidance. Invited staff joining a mature Club should not get a false “empty club” tour. Users who already know the product need a way to get the checklist out of the way without losing contextual empty states on Wellness.

## Solution

Ship a unified **Primeros pasos** checklist in the staff sidebar footer (Attio-style), driven by **Club facts** plus User×Club panel chrome. Five recommended steps encourage full product use without hard-gating Wellness. Minimizing collapses to a brand-bordered progress badge; completing all steps auto-hides the panel; reopen from **Settings → Club**. Wellness (and related surfaces) keep **Operational Baseline** empty states even when the panel is minimized or dismissed.

## User Stories

1. As a new staff user after hard onboarding, I want a clear checklist of next steps, so that I know how to make Wellness usable.
2. As a new staff user, I want to see that I need an active **Season**, so that daily wellness has a time frame.
3. As a new staff user, I want to see that I need at least one **Player**, so that the roster can generate check-ins.
4. As a new staff user, I want to be prompted to set the **Club** logo, so that the workspace feels like our club.
5. As a new staff user, I want to be prompted to use an **Exercise** from the library, so that I engage with training content without being forced to author one.
6. As a new staff user, I want to be prompted to create a Session, so that I learn the scheduling/training loop.
7. As a staff user, I want Primeros pasos completion based on Club-wide facts, so that work done on any **Team** counts once for the Club.
8. As staff invited to a Club that already has logo, seasons, players, exercise use, and sessions, I do not want a false empty-setup tour, so that I am not told to create things that already exist.
9. As a staff user who already knows the product, I want to dismiss or minimize Primeros pasos, so that it is not in the way.
10. As a staff user, I want minimize to turn the panel into a compact badge showing progress (e.g. `Primeros pasos 2/5`) with a brand border, so that I keep orientation without the full list.
11. As a staff user, I want a control in the top-right of the expanded panel to minimize it, so that collapse is obvious.
12. As a staff user, I want the expanded panel to auto-hide when all five steps are complete, so that finished setup does not clutter the shell.
13. As a staff user, I want to reopen Primeros pasos from Settings → Club, so that I can review or restore the panel after auto-hide or dismiss.
14. As a staff user on Wellness with no **Season**, I want an empty state explaining that a season is required, so that the home surface is not silently blank.
15. As a staff user on Wellness with no **Players**, I want an empty state explaining that players are required, so that I know why there is no day board.
16. As a staff user who dismissed Primeros pasos but still lacks **Operational Baseline**, I still want Wellness empty states, so that dismissing chrome does not remove necessary guidance.
17. As a staff user, I want clicking a Primeros pasos step to take me to the right place (season switcher/create, players, club branding, exercises, sessions), so that the checklist is actionable.
18. As a staff user creating a **Season** from the header switcher, I want that Club fact to check off the season step, so that progress updates without a separate ritual.
19. As a staff user who favorites an **Exercise** or places one on a Session, I want the exercise step to complete, so that “use” matches real product behavior.
20. As a staff user who only sees the system exercise catalog and has never favorited or scheduled one, I do not want the exercise step marked done, so that catalog visibility alone is not enough.
21. As a staff user switching active **Team**, I want Primeros pasos progress to stay Club-scoped, so that I am not reset per Team.
22. As a staff user in Settings chrome (settings sidebar), I do not need the operational Primeros pasos footer competing with settings nav, unless product explicitly keeps shell chrome — default: show on operational shell, expose reopen on Club settings.
23. As a staff user on mobile, I want Primeros pasos usable (expanded or badge) without blocking the bottom nav, so that small screens remain operable.
24. As a staff user with permission limits (cannot edit club logo), I still want to see incomplete steps I cannot finish, with clear destination or disabled affordance, so that status is honest (exact permission UX may soft-fail to “go to settings”).
25. As a maintainer, I want completion and panel visibility rules in one pure resolver, so that UI and empty states cannot drift.
26. As a Spanish-speaking staff user, I want product copy **Primeros pasos** (not English “Getting started”), so that language matches the rest of the staff app.
27. As a staff user mid-setup, I want completed steps visually checked and incomplete ones clear, so that progress is scannable.
28. As a staff user, I want expanding the minimized badge to restore the full checklist, so that minimize is reversible without Settings.
29. As a staff user after 5/5 auto-hide, I want Settings → Club to offer restoring visibility, so that auto-hide is not a dead end.
30. As a product owner, I want hard onboarding (Club + first **Team**) left as the access gate, so that Primeros pasos is guidance after the shell, not a second hard wall.

## Implementation Decisions

- Domain terms: **Operational Baseline** (active **Season** + ≥1 **Player** on the Team context for Wellness usefulness) and **Recommended Setup** / UI **Primeros pasos** (five Club-fact steps). See `CONTEXT.md`.
- Hard onboarding remains Club + first Team before shell access; Primeros pasos does not replace it.
- Five steps and predicates (Club facts unless noted):
  1. Club logo set
  2. Any Season on any Team in the Club
  3. Any Player on any Team in the Club
  4. Exercise *use*: any membership favorite on an Exercise in the Club context, **or** any Exercise placed on any Session in the Club
  5. Any Session on any Team in the Club
- Panel chrome is User×Club: `expanded` | `minimized` | `dismissed`. Completing all five facts auto-hides expanded panel; reopen from Settings → Club.
- Minimize control: top-right of expanded panel → badge `Primeros pasos n/5` with brand border; badge expands back to full panel.
- Placement: staff sidebar footer above notifications / user block on operational shell.
- Wellness empty states for missing Season / missing Players remain tied to **Operational Baseline** (and active Team context for day-to-day), independent of panel chrome.
- Single test seam: pure `resolveRecommendedSetup` (alongside staff workspace rules style). Inputs: Club setup facts + User×Club chrome. Outputs: step list, counts, panel visibility mode, baseline flags for empty states (`needsSeason`, `needsPlayers` as appropriate for active Team / Club fact policy — prefer Club facts for checklist; active Team for Wellness empty states when that is what the day board scopes).
- Prefer localStorage or existing client preference patterns for User×Club chrome initially; no requirement for a new DB table in MVP unless persistence across devices is required later.
- Wire checklist CTAs to existing flows: create season dialog / season switcher, players list, Settings → Club branding, exercises library, sessions.
- Spanish product copy throughout Primeros pasos UI.
- Do not introduce a second brand hue; use existing brand tokens for the badge border.
- Nav already removed Inicio / Temporadas / Análisis IA for MVP; Primeros pasos is the guidance path for seasons instead of a seasons list nav item.

## Testing Decisions

- Good tests assert external behavior of `resolveRecommendedSetup` only: given facts + chrome, assert step completion, counts, and visibility mode. Do not assert React tree or CSS.
- Cover: all incomplete → expanded default; partial complete → counts; all complete → auto-hidden; dismissed → hidden even if incomplete; minimized → badge mode with counts; exercise step false when only system catalog present; exercise step true on favorite OR session placement; Club-fact season/player true regardless of active Team; baseline flags still “needed” when panel dismissed.
- Prior art: `staff-workspace-rules` unit tests in the staff app.
- Skip low-value snapshot tests of the sidebar panel markup unless a regression requires it.

## Out of Scope

- Redesigning hard `/onboarding` (Club + Team creation form).
- Multi-club User chrome beyond current active Club membership.
- Guardian / player-app onboarding.
- Full guided product tour / coach marks.
- Persisting Primeros pasos chrome in the database (cross-device) for MVP.
- Re-adding Temporadas / Análisis IA / Inicio navigation.
- Defining a full glossary **Session** entity beyond “scheduled training session” as used in predicates (flagged in `CONTEXT.md`).
- Permission-matrix redesign for who can complete each step.

## Further Notes

- Grill session crystallized glossary terms **Operational Baseline** and **Recommended Setup** in root `CONTEXT.md`.
- Optional follow-up: short ADR recording Club-fact completion vs User×Club chrome if implementers need a durable “why.”
- Confirmed test seam: single pure `resolveRecommendedSetup` resolver; UI consumes it.
