# DD-01 — Define admin experience principles

Status: planning
Parent: `.scratch/design-direction-wayfinder/MAP.md`
Ticket: `.scratch/design-direction-wayfinder/issues/01-define-admin-experience-principles.md`

## Destination

Rule-ready **experience principles and IA rules** for `apps/app` as a Linear-inspired operational staff workspace — enough to rewrite `.cursor/rules/loadzone-design-system.mdc` / `loadzone-admin-shell.mdc` later and to unblock [Decide shared visual language and app divergence](../design-direction-wayfinder/issues/03-decide-shared-visual-language-and-app-divergence.md), [Prototype the admin data surface](../design-direction-wayfinder/issues/04-prototype-the-admin-data-surface.md), and the final synthesis — **not** pixel specs and **not** product code.

## Notes

- Effort destination remains **spec + backlog**, not shipped UI (parent MAP Notes).
- Prefer precedent: parent MAP standing preferences, `loadzone-design-system.mdc`, `loadzone-admin-shell.mdc`, and current `apps/app` shell (`primaryNavigation` / `secondaryNavigation`, exercise-library data surfaces, light-first `globals.css` + `ModeToggle`).
- Linear / Attio are **references for density and predictability**, not issue-tracker product metaphors (parent MAP: outcomes over clones).
- Exact brand hue, typography stacks, motion tokens, and token renames belong to DD-03; this ticket only locks *experience* use of theme and color (default preference, state vs decoration).
- Product UI copy stays Spanish; this planning artifact stays English.

## Decisions so far

### Human review (2026-08-03)

- **Orchestrator:** `DD-01: ok` — accept all auto/assume decisions and HITL recommendation A.
- **[hitl→locked] Primary jobs of the staff UI / “professional and impeccable”:** (1) monitor team wellness/risk day to day, (2) operate sessions and training content (exercises), (3) manage roster, season, and configuration. “Impeccable” means dense, calm, predictable operational clarity — not sports marketing chrome and not issue-tracker bureaucracy.

### Auto

1. **[auto] Navigation destinations stay as documented in `loadzone-admin-shell.mdc` + current `admin-navigation.ts`.** Primary: Inicio, Wellness, Sesiones, Configuración. Secondary: Jugadores, Ejercicios, Lesiones, Temporadas, Análisis IA. Desktop sidebar and mobile bottom nav continue to share one primary config. Reason: documented convention + adjacent code; no product change without contradicting the shell rule.

2. **[auto] Shell remains single-`activeTeam` operational.** No new daily multi-team mashup screens; resolve team from the central helper. Reason: `loadzone-admin-shell.mdc`.

3. **[auto] Default data surfaces are invisible horizontal lists/tables.** No four-sided enclosing box; row separators; uppercase/tracking group labels; toolbar underline language (`border-b border-border-secondary`); exercise library remains the canonical reference. Reason: `loadzone-design-system.mdc` § Superficies de datos.

4. **[auto] Elevation only on floating surfaces** (dialogs, popovers, menus, tooltips) — not on ordinary list/table frames. Reason: design-system rule.

5. **[auto] Theme default is light; dark is an available preference.** Parent MAP already rules out mandatory dark-first / `#080A0A`. Current `apps/app` tokens are light-first with `.dark` overrides and `ModeToggle` in the shell. Exact dark token values / hue family deferred to DD-03.

6. **[auto] Color is for state and risk, not decoration.** Use existing semantic tokens (`brand`, `premium`, `danger`, text/bg/border scales) to signal status, risk, and affordance; do not introduce decorative multi-accent chrome on admin surfaces. Hue/token rename work is DD-03; this locks the *usage* principle only.

7. **[auto] Phosphor + dense icon weight (`fill`) remain the admin default** for compact chrome. Reason: design-system icon rules.

### Assume

8. **[assume] Cards / summary panels are exceptions, not the default container.** Allowed only for: (a) floating elevated UI, (b) a single interactive decision widget the user must act on, or (c) a compact risk/status callout that does **not** wrap a list or table. Lists, libraries, and tables stay frameless. Reason: extends invisible-surface rule so DD-04 has a clear contrast case; two reasonable boundaries exist (strict no-cards vs selective callouts). **Revert:** broaden principles to allow card-wrapped sections for dashboards/KPIs, or tighten to “never cards outside overlays.”

9. **[assume] Interaction speed is progressive, not Linear-clone.** First-class: predictable nav, dense controls, toolbar search/filter/sort on every library/list, clear focus order. Explicitly **not** required for v1 principles: global command palette, issue-key shortcuts, or omnipresent multi-select. Reason: MAP “outcomes over clones”; current admin has toolbars without a command palette. **Revert:** add command-palette / global multi-select as non-negotiable principles.

10. **[assume] Bulk actions are opt-in per surface**, only when a concrete multi-item staff workflow exists — not a global “select many rows everywhere” doctrine. Filters remain first-class. **Revert:** mandate bulk selection as a core admin principle across data surfaces.

11. **[assume] Refuse Linear product metaphors in IA and copy.** Do not model staff work as issues, projects, cycles, backlogs, or ticket IDs. Borrow density, calm chrome, and navigational predictability only. Domain vocabulary stays Club / Team / Season / Player / DailyEntry / etc. (`CONTEXT.md`). **Revert:** deliberately adopt any of those tracker metaphors in the principles doc.

## Not yet specified

- Exact wording of the principles document once grilling resolves primary jobs (artifact shape for later wave — still not app code).
- Whether any secondary destination should later be promoted (e.g. Análisis) after usage evidence — out of this ticket’s lock unless human overrides nav auto.
- Pixel density numbers, type scale, motion ms, and sage-vs-split hue (DD-03).
- Concrete prototype layout for the contrast card vs invisible list (DD-04).
- Health-escalation surfaces inside admin (DD-06).

## Out of scope

- Implementing or restyling `apps/app` production screens.
- Changing shared primitives in `@repo/design-system` during this ticket.
- Player app principles, age bands, parental supervision (DD-02 / DD-05).
- Design-system governance / migration sequencing (DD-07).
- Full synthesized design-direction spec (DD-08).
- Mandatory dark-first industrial theme (parent MAP Out of scope).

## Decision index (classification)

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | Primary jobs / “professional and impeccable” in LoadZone terms | **hitl** | Product doctrine; not fully fixed by MAP |
| 2 | Primary vs secondary navigation | auto | Shell rule + `admin-navigation.ts` |
| 3 | Team-centric shell | auto | Shell rule |
| 4 | Invisible data surfaces | auto | Design-system rule |
| 5 | Elevation / floating only | auto | Design-system rule |
| 6 | Light default + ModeToggle | auto | MAP + current tokens; DD-03 owns token detail |
| 7 | Color for state/risk only | auto | Semantic token usage principle |
| 8 | Icon weight admin default | auto | Design-system rule |
| 9 | Card / summary exception boundary | assume | Needed for DD-04 contrast |
| 10 | Progressive keyboard / no mandatory command palette | assume | Anti-clone |
| 11 | Bulk actions opt-in | assume | Anti-clone |
| 12 | Refuse Linear issue-tracker metaphors | assume | MAP outcomes-over-clones |

**HITL count: 1** (under cap of 3). Ticket is well-formed.
