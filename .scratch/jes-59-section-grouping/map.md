# JES-59 — Decide per-route settings section grouping

Planning map for [Decide per-route settings section grouping](https://linear.app/jesus-guti-workspace/issue/JES-59/decide-per-route-settings-section-grouping).  
Parent map: [Admin settings shell — centered config + settings sidebar](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar) (JES-56).  
Blocked by: [Prototype settings shell + Equipo sections](https://linear.app/jesus-guti-workspace/issue/JES-57/prototype-settings-shell-equipo-sections) (JES-57 tip `c402dec`).  
Route: `plan:auto` · Risk: `low` · Label: `wayfinder:task`.

## Destination

A **per-route composition map** (section title → optional description → rows/fields) for Equipo / Wellness / Políticas / Club / Cuenta that implementers can follow without inventing a second layout language. **Approved** via orchestrator (`Jes-59:ok`, 2026-08-05). Consumer summary: [`resolution.md`](./resolution.md). **Do not implement** production pages in this ticket.

## Notes

- **Grouping law (product override 2026-08-05):** sections, **not cards** — small section title (+ optional short description) then settings rows (label left / control right). No bordered/background Card wrapping a cluster.
- **Field partition stays JES-56** — this ticket only groups fields already owned by each route; it does not move fields across routes.
- **Prototype reaction (JES-57):** Equipo uses two stacked sections **Identidad** / **Zona horaria** with `pt-8 first:pt-0` inter-section spacing and `border-t` row separators. Production Equipo **keeps that grouping and spacing language**. Content column geometry (single column; `max-w-[640px] mx-10 mb-16` at all breakpoints — user revoke 2026-08-05) is shell/layout law from JES-57 — not re-decided here.
- **Autosave:** no Save chrome on any of these pages (JES-58). Composition must not reserve footer space for Guardar.
- **Skills / rules:** `orchestrator/autonomy-matrix.md`, `.cursor/rules/loadzone-design-system.mdc`, `.cursor/rules/loadzone-content-design.mdc`, `.cursor/rules/loadzone-admin-shell.mdc` (settings exception for section/row density).
- **Language:** this map English; product section titles / descriptions Spanish.

## Composition map (resolution)

### Shared chrome (all five routes)

- Page title = nav label (Equipo, Wellness, Políticas, Club, Cuenta).
- Body = stacked sections in one column; rows = label-left / control-right; row separators `border-t` as in prototype.
- Inter-section spacing: match Equipo prototype (`pt-8` after first section).
- Section description only when the title alone is ambiguous (see per-route).
- No Card / enclosed panel as grouping container.
- No page-level Guardar.

### Equipo → `/settings/equipo` (default `/settings` redirect)

Aligns with JES-57 prototype.

| Section | Description | Rows / fields |
|---|---|---|
| **Identidad** | _(none)_ | Categoría |
| **Zona horaria** | _(none)_ | Zona horaria |

### Wellness → `/settings/wellness`

| Section | Description | Rows / fields |
|---|---|---|
| **Formularios** | _(none)_ | Formulario pre-sesión; Formulario post-sesión |
| **Umbrales de alertas** | Short: empty = off; cuidado (Guardian) only on agujetas; rest staff-only; carga/ACWR not configured here. | Agujetas; Recuperación; Energía; Horas de sueño; Calidad del sueño |
| **Recordatorios** | _(none)_ | Recordatorio pre-sesión (min); Recordatorio post-sesión (min) |

Deep-link anchor for forms cluster: `#formularios` (replaces today’s `#wellness-forms` — see JES-60).

### Políticas → `/settings/politicas`

| Section | Description | Rows / fields |
|---|---|---|
| **Tramos de edad** | Effective source line (team override / club / defaults) when useful. | Usar valores del club (toggle, team only); Asistida hasta; Guiada hasta; Mayoría desde (+ existing AgeBandPolicyFields controls) |
| **Consentimiento de recordatorios** | Defaults by age band; per-player state lives on player sheet. | Per-band mode + guardian-receive controls (existing ReminderConsentPolicyFields) |

Dense multi-control policies stay **one section each**; each control still autosaves per JES-58 (field-level, not whole-blob UI action).

### Club → `/settings/club`

| Section | Description | Rows / fields |
|---|---|---|
| **Marca** | _(none)_ | Logo; Nombre del club (read/edit per `canEdit` / existing ClubBranding) |
| **Política de edad del club** | Teams without override inherit these values. | Club AgeBandPolicyFields (no inherit toggle) |

Mutations remain permission-gated; Club nav visible to all (JES-56).

### Cuenta → `/settings/cuenta`

| Section | Description | Rows / fields |
|---|---|---|
| **Perfil** | _(none)_ | Nombre; Email (read-only if today); Avatar / foto |
| **Apariencia** | _(none)_ | Tema / modo (rehost existing ModeToggle — no new account features) |

## Decisions so far

### Auto

1. **[auto] No settings cards as grouping containers.** Product override 2026-08-05 + JES-56 / JES-59 body.
2. **[auto] Structure = section title + optional description + settings rows.** Linear captures + parent lock.
3. **[auto] Rows stay label-left / control-right.** Settings exception to invisible-list; not a Card component.
4. **[auto] Field partition unchanged from JES-56.** Equipo = category + timezone; Wellness = forms + thresholds + reminder minutes; Políticas = team age bands + reminder consent; Club = branding + club age policy; Cuenta = existing profile + theme/mode.
5. **[auto] Equipo = Identidad + Zona horaria stacked**, matching JES-57 prototype spacing language (`pt-8 first:pt-0`, row `border-t`).
6. **[auto] Wellness = three sections** (Formularios / Umbrales de alertas / Recordatorios) matching parent partition.
7. **[auto] Políticas = two sections** (Tramos de edad / Consentimiento de recordatorios).
8. **[auto] Club = two sections** (Marca / Política de edad del club).
9. **[auto] Cuenta = two sections** (Perfil / Apariencia); ModeToggle rehosted, no new account product.
10. **[auto] Section descriptions only when title alone is ambiguous**; Spanish copy; lean.
11. **[auto] No Save chrome in composition.** Soft contract from JES-58 / prototype emptiness.
12. **[auto] Zero planning HITL.** Issue AC + parent locks + prototype reaction are enough; overrides via orchestrator revoke lines.

### Assume

13. **[assume] Spanish section titles as tabled above** (Identidad, Zona horaria, Formularios, Umbrales de alertas, Recordatorios, Tramos de edad, Consentimiento de recordatorios, Marca, Política de edad del club, Perfil, Apariencia). Reason: match existing page headings where they exist; lean new titles where hybrid routes need them. **Revert:** rename any title via orchestrator revoke without regrouping fields.
14. **[assume] Wellness forms deep-link id `#formularios`** for the Formularios section (maps from `#wellness-forms`). Reason: Spanish section id consistency with route language. **Revert:** keep `#wellness-forms` if implementers prefer zero rename friction (JES-60 lists both).
15. **[assume] Age-band and reminder-consent dense controls stay under one section each** (not one section per band). Reason: parent partition; prototype density; JES-58 field-level autosave handles commits. **Revert:** sub-section per band only if reaction after implement shows cognitive overload.

### Human

16. **[human] `Jes-59:ok` (2026-08-05).** Orchestrator recorded user approval of this composition map. Decisions closed — do not reopen HITL; further changes only via orchestrator revoke lines.

## Not yet specified

- Exact microcopy polish for threshold helper text (can tighten in implement).
- Whether Club “Nombre” is editable inline or display-only beside logo (follow existing ClubBranding behavior).
- Production hash inventory application (JES-60 owns retarget table; this map only names `#formularios`).

## Out of scope

- Implementing production settings pages.
- Introducing Card / boxed-panel grouping.
- Moving fields across routes.
- Autosave mechanics (JES-58).
- Design-system promotion of settings primitives (ADR 0001).
- Volver memory (JES-61).

## Decision ledger

| # | Decision | Level |
|---|---|---|
| 1–12 | Locks / partition / Equipo spacing / five-route maps / no HITL | `auto` |
| 13 | Spanish section titles | `assume` |
| 14 | `#formularios` anchor | `assume` |
| 15 | Dense policies = one section each | `assume` |
| 16 | User approval `Jes-59:ok` | `human` |

**HITL count: 0** (under cap of 3). **Resolved** — map approved; publish `resolution.md` for JES-56 / implementers.
