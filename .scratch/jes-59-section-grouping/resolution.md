# JES-59 — Per-route settings section grouping (resolution)

Issue: [Decide per-route settings section grouping](https://linear.app/jesus-guti-workspace/issue/JES-59/decide-per-route-settings-section-grouping)  
Parent: [Admin settings shell](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar) (JES-56)  
Prototype alignment: JES-57 Equipo (`Identidad` / `Zona horaria`, `pt-8 first:pt-0`, row `border-t`)  
Approved: orchestrator `Jes-59:ok` (2026-08-05)  
Full planning map: [`map.md`](./map.md)

**No production UI in this ticket** — composition law for JES-56 Wave 3 implementers.

## Shared chrome (all five routes)

- Page title = nav label.
- Body = stacked **sections** in one column (not cards / enclosed panels).
- Rows = label-left / control-right; separators `border-t` as in JES-57.
- Inter-section spacing: `pt-8` after the first section.
- Section description only when the title alone is ambiguous (Spanish).
- No page-level **Guardar** (JES-58).

## Composition table

| Route | Path | Section | Description | Rows / fields |
|---|---|---|---|---|
| Equipo | `/settings/equipo` (default `/settings` → here) | **Identidad** | — | Categoría |
| Equipo | | **Zona horaria** | — | Zona horaria |
| Wellness | `/settings/wellness` | **Formularios** | — | Formulario pre-sesión; Formulario post-sesión |
| Wellness | | **Umbrales de alertas** | Short: empty = off; cuidado (Guardian) only on agujetas; rest staff-only; carga/ACWR not configured here. | Agujetas; Recuperación; Energía; Horas de sueño; Calidad del sueño |
| Wellness | | **Recordatorios** | — | Recordatorio pre-sesión (min); Recordatorio post-sesión (min) |
| Políticas | `/settings/politicas` | **Tramos de edad** | Effective source line (team override / club / defaults) when useful. | Usar valores del club (toggle, team only); Asistida hasta; Guiada hasta; Mayoría desde (+ AgeBandPolicyFields) |
| Políticas | | **Consentimiento de recordatorios** | Defaults by age band; per-player state on player sheet. | Per-band mode + guardian-receive (ReminderConsentPolicyFields) |
| Club | `/settings/club` | **Marca** | — | Logo; Nombre del club (per existing `canEdit` / ClubBranding) |
| Club | | **Política de edad del club** | Teams without override inherit these values. | Club AgeBandPolicyFields (no inherit toggle) |
| Cuenta | `/settings/cuenta` | **Perfil** | — | Nombre; Email (read-only if today); Avatar / foto |
| Cuenta | | **Apariencia** | — | Tema / modo (rehost ModeToggle — no new account features) |

## Anchors & density notes

- Wellness forms deep-link: `#formularios` (legacy `#wellness-forms` — JES-60 inventory).
- Dense Política controls stay **one section each** (not one section per age band); field-level autosave per JES-58.
- Field **partition** unchanged from JES-56 — this map only groups within each route.

## No-goals (unchanged)

- Implementing production settings pages.
- Card / boxed-panel grouping.
- Moving fields across routes.
- Autosave mechanics (JES-58), deep-link retargets (JES-60), Volver memory (JES-61).
