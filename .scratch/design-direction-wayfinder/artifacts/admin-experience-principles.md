# Admin experience principles (`apps/app`)

Status: accepted  
Source ticket: [Define admin experience principles](../issues/01-define-admin-experience-principles.md)  
Locked decisions: [DD-01 planning map](../../dd-01-admin-principles/map.md) (human `DD-01: ok`, 2026-08-03)

These principles are **rule-ready** for a later rewrite of `.cursor/rules/loadzone-design-system.mdc` and `.cursor/rules/loadzone-admin-shell.mdc`. They are **not** pixel specs, type scales, motion timings, or brand-hue decisions (those belong to later tickets, especially shared visual language / DD-03).

## 1. Primary jobs — what “professional and impeccable” means

Staff UI exists to help club staff do three jobs, in priority order:

1. **Monitor team wellness and risk day to day** — see who needs attention, what changed, and what is overdue without hunting.
2. **Operate sessions and training content** — plan and run sessions; manage the exercise library as an operational surface.
3. **Manage roster, season, and configuration** — players, seasons, injuries, team/club settings.

**Impeccable** means dense, calm, predictable **operational clarity**. It does **not** mean sports-marketing chrome, decorative dashboards, or issue-tracker bureaucracy.

Locked HITL: map decision *Primary jobs / “professional and impeccable”* (recommendation A).

## 2. Information architecture and navigation

### Team-centric shell

- Authenticated shell is centered on a single `activeTeam`.
- Resolve team from one central server helper; validate against accessible teams.
- Do **not** invent daily multi-team mashup screens.

### Destinations

**Primary** (persistent sidebar on desktop; shared config with mobile bottom nav):

- Inicio (Dashboard)
- Wellness
- Sesiones
- Configuración

**Secondary** (menus / contextual links, not primary chrome):

- Jugadores
- Ejercicios
- Lesiones
- Temporadas
- Análisis IA

Desktop sidebar and mobile bottom navigation **share one primary config**. Promoting a secondary destination later requires usage evidence and an explicit decision — not ad-hoc nav growth.

Locked: map auto decisions *Navigation destinations* and *Team-centric shell*.

### Density and predictability

- Prefer dense controls, stable destinations, and clear focus order over novelty.
- Staff should always know where they are and how to return; avoid one-off shell patterns per feature.

## 3. Data surfaces (default)

Default operational surfaces are **invisible horizontal lists and tables**:

- No four-sided enclosing box around the whole list or table.
- Row separation is primarily horizontal (`border-t` / table row rules); do not add vertical list-frame borders.
- Section / column group labels: small, uppercase, wide tracking, secondary text tone.
- Library / list toolbars: underline language (`border-b border-border-secondary`), no card chrome, no structural shadow on the toolbar block.
- Canonical reference: exercise library list / toolbar / group rows.

Elevation belongs only on **floating** surfaces (dialogs, popovers, menus, tooltips) — never on ordinary list/table frames.

Locked: map auto decisions *Invisible data surfaces* and *Elevation only on floating surfaces*.

## 4. Cards and summary panels (exception boundary)

Cards / framed summary panels are **exceptions**, not the default container.

**Allowed only for:**

1. Floating elevated UI (overlays and ephemeral chrome).
2. A **single interactive decision widget** the user must act on (removing border/background/radius would hurt the interaction).
3. A **compact risk/status callout** that does **not** wrap a list or table.

**Not allowed:** wrapping libraries, tables, or multi-row operational lists in card frames; treating dashboard KPI walls as the default layout metaphor.

Contrast for later prototype work (DD-04): one intentional callout/widget vs frameless list — not “everything in cards.”

Locked: map assume decision *Cards / summary panels are exceptions*.

## 5. Interaction speed (progressive, not Linear-clone)

First-class expectations:

- Predictable navigation and dense, keyboard-friendly controls.
- Toolbar **search / filter / sort** on every library and list surface.
- Clear focus order and immediate pending feedback for navigation and mutations (existing loading UX rules still apply).

Explicitly **not** required as non-negotiable v1 principles:

- Global command palette
- Issue-key style shortcuts
- Omnipresent multi-select across all tables

Locked: map assume decision *Interaction speed is progressive*.

## 6. Bulk actions

Bulk actions are **opt-in per surface**, only when a concrete multi-item staff workflow exists.

- Filters remain first-class everywhere lists exist.
- Do **not** adopt a global “select many rows on every table” doctrine.

Locked: map assume decision *Bulk actions are opt-in per surface*.

## 7. Anti-Linear product metaphors

Linear (and Attio) inform **density, calm chrome, and navigational predictability** only.

Do **not** model staff work as:

- Issues, projects, cycles, backlogs, or ticket IDs
- Issue-tracker copy patterns in Spanish UI

Domain vocabulary stays LoadZone / `CONTEXT.md`: Club, Team, Season, Player, DailyEntry, Session, Exercise, Injury, and related terms.

Locked: map assume decision *Refuse Linear product metaphors*.

## 8. Theme, color, and icons

### Theme

- **Default is light.** Dark remains an available preference (`ModeToggle` / existing shell pattern).
- Mandatory dark-first industrial themes are out of scope for this effort.
- Exact dark token values and hue family are deferred to shared visual language work (DD-03).

### Color usage

- Color communicates **state, risk, and affordance**, not decoration.
- Prefer semantic tokens already in the system (`brand`, `premium`, `danger`, text/bg/border scales).
- Do not introduce decorative multi-accent chrome on admin operational surfaces.
- Token renames / sage-vs-split hue decisions are DD-03; this principle locks **usage** only.

### Icons

- Phosphor Icons via `@phosphor-icons/react` (SSR entry in Server Components).
- Admin / dense chrome default weight: **`fill`**.
- Size via existing primitive `className` patterns; do not invent icon-only wrappers.

Locked: map auto decisions *Theme default is light*, *Color is for state and risk*, *Phosphor + dense icon weight*.

## 9. Downstream use

| Consumer | Use of this doc |
|---|---|
| DD-03 shared visual language | Experience constraints when choosing hue, type, motion — do not contradict jobs, IA, or anti-decoration color rules |
| DD-04 admin data-surface prototype | Invisible list vs allowed card/callout contrast |
| DD-07 / DD-08 governance & synthesis | Source for rewriting Cursor rules and the final design-direction spec |
| Future rule migration | Port sections into `loadzone-design-system.mdc` / `loadzone-admin-shell.mdc` without inventing pixel numbers here |

## Out of scope here

- Production restyles in `apps/app`
- Changes to `@repo/design-system` primitives
- Player experience principles, age bands, parental supervision
- Reminder / streak / health-escalation surfaces
- Pixel density, type scale, motion ms, brand hue
