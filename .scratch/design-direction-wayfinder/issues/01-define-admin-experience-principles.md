# Define admin experience principles

Status: closed
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee: orchestrator
Blocked by:

## Question

What are the non-negotiable experience principles and information-architecture rules for `apps/app` as a Linear-inspired operational workspace?

Decide at least:

1. Primary jobs of the staff UI (what “professional and impeccable” means in LoadZone terms).
2. Navigation model: what stays in the persistent sidebar vs secondary/settings, and what density/predictability rules apply.
3. Data-surface rules: when to use invisible horizontal-only lists/tables vs cards/summary panels.
4. Interaction speed: keyboard expectations, filters, bulk actions, and what we explicitly will **not** copy from Linear (e.g. issue-tracker metaphors).
5. Light vs dark default and how color is used for state/risk vs decoration.

Record the answer as principles that can rewrite `.cursor/rules/loadzone-design-system.mdc` and `loadzone-admin-shell.mdc` later — not as pixel specs.

## Comments

### 2026-08-03 — Resolution (orchestrator)

**Answer:** Staff admin is a dense, calm, team-centric operational workspace for three jobs — (1) monitor wellness/risk day to day, (2) operate sessions and training content, (3) manage roster, season, and configuration. “Professional and impeccable” means operational clarity, not marketing chrome or issue-tracker bureaucracy.

IA keeps documented primary destinations (Inicio, Wellness, Sesiones, Configuración) with secondary Jugadores / Ejercicios / Lesiones / Temporadas / Análisis IA; single `activeTeam` shell. Data surfaces default to invisible horizontal lists/tables; cards only for floating UI, single interactive decision widgets, or compact risk callouts that do not wrap lists. Interaction is progressive (toolbars, filters, focus) without mandatory command palette or global multi-select; bulk is opt-in per workflow. Refuse Linear product metaphors; borrow density only. Light default; color for state/risk; Phosphor `fill` for dense admin chrome.

**Principles artifact:** [admin-experience-principles.md](../artifacts/admin-experience-principles.md)

**Locked HITL:** Human `DD-01: ok` accepted recommendation A — primary jobs and “impeccable” definition as above. Planning map: [dd-01-admin-principles/map.md](../../dd-01-admin-principles/map.md). All auto/assume decisions from that map are accepted without reopen.
