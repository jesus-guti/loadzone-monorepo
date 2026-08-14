# Admin UI polish — avatars, Wellness cromos, sidebar IA

## Goal

Staff surfaces that show people look consistently circular; Team Wellness player cards read as vertical trading-card (“cromo”) chrome (whole card clickable to Player detail); the admin sidebar drops dead chrome (notifications + theme), puts Configuración at the bottom, and uses a sports-related icon for Ejercicios.

## No-goals

- No notification system implementation or theme-picker relocation beyond removing them from the ops sidebar footer.
- No redesign of Wellness settings autosave rows (Linear-style settings stay as they are).
- No player-app (`apps/player`) visual redesign unless a shared Avatar fix affects it transitively.
- No new design-system kit for “cromo” cards — keep the composition app-local unless promotion gates later pass.
- No change to nav destinations or route structure.

## Product decisions already closed (grill, assumed)

Source: 2026-08-11 dump + grill with **assume answers**.

1. **People avatars are always circles** — Player / staff person faces use `rounded-full` end-to-end (root + image + fallback), with clipping so photos cannot escape. Intentional squircles for **club/team logos** may remain.
2. **Root cause accepted** — Several staff call sites override Avatar/Fallback with `rounded-2xl`, so initials look like rounded squares while photos look circular. Fix call sites for people + harden the shared Avatar primitive (e.g. overflow clip) without inventing a second people-avatar component.
3. **“Cards del wellness” = Team Wellness player cards** — Not settings rows. Restyle `TeamWellnessPlayerCard` (and the Tarjetas view that hosts them) into a **vertical cromo**: portrait-forward stack (avatar / identity / metrics), denser vertical rhythm, still navigating to the Player detail.
4. **Cromo hit target** — The whole cromo is clickable to Player detail. No separate “Ver” / “Abrir” button (revoked 2026-08-11). No secondary destinations.
5. **Sidebar footer** — Remove the Notifications (`Bell`) control and the theme `ModeToggle` from the ops sidebar footer. User menu stays. Do not build notifications. Theme toggle is out of sidebar scope (may remain elsewhere later; not required in this batch).
6. **Sidebar order** — Operational destinations together; **Configuración** alone at the bottom of the nav (above footer). Suggested order: Wellness → Sesiones → Jugadores → Ejercicios → Lesiones, then Configuración.
7. **Ejercicios icon** — Replace `ClipboardTextIcon` with Phosphor `SoccerBallIcon` (`weight="fill"` in dense admin chrome). Label stays “Ejercicios”.

## Issues

| Id | Title | Type | plan | risk | Blocked by |
|---|---|---|---|---|---|
| [JES-87](https://linear.app/jesus-guti-workspace/issue/JES-87) | People Avatars always circular in staff UI | Bug | auto | med | None |
| [JES-88](https://linear.app/jesus-guti-workspace/issue/JES-88) | Team Wellness player cards as vertical cromos | Improvement | auto | med | Related to JES-87 (not blocked) |
| [JES-89](https://linear.app/jesus-guti-workspace/issue/JES-89) | Admin sidebar: drop footer chrome, reorder, sports Ejercicios icon | Improvement | direct | low | None |

## User stories

1. As staff, I want Player face bubbles and card avatars to always look circular, so identity chrome does not look broken when a photo is missing.
2. As staff, I want Team Wellness Tarjetas to feel like vertical player cromos, so I can scan the roster faster.
3. As staff, I want to open a Player by clicking the cromo itself, so there is no extra button chrome.
4. As staff, I want Configuración at the bottom of the sidebar, so day-to-day destinations stay grouped.
5. As staff, I do not want a dead Notifications bell or theme toggle in the sidebar footer.
6. As staff, I want Ejercicios to use a sports-related icon, so the nav reads as football ops rather than a clipboard checklist.

## Testing decisions

- Prefer visual/manual checks on Wellness Tarjetas (with and without `imageUrl`) and on Player detail / settings people avatars.
- Avatar bug: at least one regression assertion or documented checklist that Fallback + Image both render circular at representative sizes.
- Sidebar: smoke that mobile bottom nav still matches operational destinations and settings path still swaps to the settings sidebar.

## Out of scope

See No-goals. Also out of scope: dark-mode product policy, notification inbox, mobile bottom-nav icon for Ejercicios beyond sharing the same nav config, and redesign of pending-player summary bubbles (they already use `rounded-full`).

## Further notes

- Terrain notes from exploration: shared Avatar lacks `overflow-hidden`; people call sites with `rounded-2xl` include Wellness player card, Player detail shell, cuenta/club settings, edit-profile dialog. Club branding may keep squircle intentionally.
- Spec path: `.scratch/admin-ui-polish-2026-08-11/PRD.md`
