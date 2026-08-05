# Form surfaces and interaction modes

**Ticket:** [JES-64](https://linear.app/jesus-guti-workspace/issue/JES-64/catalog-form-surfaces-and-interaction-modes)  
**Parent map:** [JES-63](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
**Question:** What product form surfaces exist today in `apps/app` and `apps/player`, and which interaction mode does each use?  
**Scope:** Product forms only. Excludes `apps/app/app/prototype/**`, player `prototype-dd-05/**`, and non-form chrome (tactics board canvas).  
**Method:** Inventory from primary source files (no secondary write-ups). Surveyed `<form`, `useActionState`, `useSettingsAutosave`, file inputs, and `*form*.tsx` under both apps.  
**Date:** 2026-08-05

## Mode vocabulary

| Mode | Meaning in this inventory |
| --- | --- |
| **Classic submit / `useActionState`** | `<form action={…}>` wired through React `useActionState` (or a direct Server Action `action` prop) with an explicit submit control. |
| **Per-field settings autosave** | Controlled fields call `useSettingsAutosave` (`saveImmediate` / `saveDebounced` / `flushDebounced`) into field-level Server Actions; no full-form submit. |
| **Multi-step focus check-in** | Focus-step chrome (`currentStep`, `nextFocusStepIndex`) over player questions; values held in React state + hidden inputs; final `requestSubmit()` into `useActionState`. |
| **File upload** | Hidden native `input[type=file]`; upload starts on file selection (or with a nearby save), typically via `useTransition` + `FormData`. |
| **Other** | Product interaction that collects input but does not match the modes above (batch save, chat compose, GET search, vendor auth). |

**Cross-cutting finding:** Neither `apps/app` nor `apps/player` imports `react-hook-form` / `useForm` / `@hookform/*` today (repo grep over `apps/**`). Validation and state are hand-rolled or left to the Server Action.

## Inventory table

| Path | App | Mode | Notable native / DS controls |
| --- | --- | --- | --- |
| `apps/app/features/teams/components/create-team-form.tsx` | app | Classic submit / `useActionState` | DS `Input` (clubName, teamName, timezone). Used from onboarding (`apps/app/app/onboarding/page.tsx`). |
| `apps/app/features/settings/components/create-team-dialog.tsx` | app | Classic submit (**other wiring:** `form action` + `useTransition`, not `useActionState`) | DS `Input` (name, category, timezone). Opened from team switcher. |
| `apps/app/features/seasons/components/create-season-form.tsx` | app | Classic submit / `useActionState` | DS `Input`; native date via `Input type="date"` (start/end/preSeasonEnd). |
| `apps/app/features/players/components/create-player-form.tsx` | app | Classic submit / `useActionState` | DS `Input`; `Input type="date"`; **native `<select>`** for ageBandOverride. |
| `apps/app/features/players/components/edit-player-form.tsx` | app | Classic submit / `useActionState` | DS `Input` + DS `Select` (status); `Input type="date"`; **native `<select>`** for ageBandOverride + reminderConsentAction; hidden `id`. |
| `apps/app/features/players/components/excused-absence-form.tsx` | app | Classic submit / `useActionState` (dual actions: mark/unmark) | DS `Input type="date"` + text reason; hidden `playerId`. |
| `apps/app/features/players/components/player-photo-cell.tsx` | app | File upload | Hidden **native `input[type=file]`**; upload on change via `useTransition` + `updatePlayerPhoto`. |
| `apps/app/features/sessions/components/session-form.tsx` | app | Classic submit / `useActionState` | DS `Input`, `Select`, `Textarea`; `Input type="datetime-local"` / `type="number"`; HTML `datalist` for locations. |
| `apps/app/features/sessions/components/edit-session-form.tsx` | app | Classic submit / `useActionState` | Same control mix as create; hidden `sessionId` / `scope`. |
| `apps/app/features/sessions/components/attendance-form.tsx` | app | **Other** — `useState` grid + `useTransition` batch `setAttendance` (no `<form>`, no `useActionState`) | DS `Select` + DS `Input type="number"` per row; Save button. |
| `apps/app/features/exercises/components/exercise-form.tsx` | app | Classic submit / `useActionState` | DS `Input`, `Textarea`, `Select` (via local `EnumSelect` + hidden native input for name=); hidden `diagramData`. Tactics board is embedded chrome — **out of Form System scope**; the surrounding metadata form is in scope. |
| `apps/app/app/(authenticated)/injuries/page.tsx` | app | Classic submit (**direct** Server Action `action={updateInjury}`, no `useActionState`) | **Native `<select>`**, **native `<textarea>`**, native submit `<button>`, hidden `injuryId`. |
| `apps/app/features/settings/components/wellness-settings-form.tsx` | app | Per-field settings autosave | **Native `<select>`** for pre/post templates; DS `Input` for reminder minutes + wellness limits (`useSettingsAutosave`). |
| `apps/app/features/settings/components/equipo-settings-form.tsx` | app | Per-field settings autosave | DS `Input` (category, timezone) with debounce + blur flush. |
| `apps/app/features/settings/components/cuenta-settings-form.tsx` | app | Hybrid: per-field autosave (name) + file upload (avatar) | DS `Input`; hidden **native `input[type=file]`**; ModeToggle (theme, not a form field). |
| `apps/app/features/settings/components/club-settings-form.tsx` | app | Hybrid: file upload (logo) + per-field autosave (age policy) | Hidden **native `input[type=file]`**; DS `Input type="number"`; **native `input[type=checkbox]`** for youth/miss/care flags. |
| `apps/app/features/settings/components/politicas-settings-form.tsx` | app | Per-field settings autosave | **Native `input[type=checkbox]`**; DS `Input type="number"`; **native `<select>`** + checkboxes for reminder-consent matrix; `<form className="contents" onSubmit={preventDefault}>` wrappers only. |
| `apps/app/features/settings/components/club-branding-card.tsx` | app | File upload | Hidden **native `input[type=file]`** + `useTransition`. Exported from settings index; **no current page import** found (logo UX lives in `club-settings-form.tsx`). |
| `apps/app/components/layouts/edit-profile-dialog.tsx` | app | Classic submit (**other wiring:** `onSubmit` + `preventDefault` + `useTransition`) + file pick | DS `Input`; hidden **native `input[type=file]`** (file held until Save). |
| `apps/app/features/analysis/components/analysis-chat.tsx` | app | **Other** — chat compose (`useChat` / streaming API) | DS `Input` in `<form onSubmit>`; not a domain mutation form. |
| `apps/app/components/layouts/search.tsx` | app | **Other** — GET navigation `action="/search"` | DS `Input name="q"`. **No product imports found** (orphan layout helper). |
| `apps/app/app/(unauthenticated)/sign-in/[[...sign-in]]/page.tsx` | app | **Other** — vendor auth (`@repo/auth` Clerk `SignIn`) | Not a LoadZone-authored product form; exclude from RHF migration pilots. |
| `apps/player/app/[token]/components/pre-session-form.tsx` | player | Multi-step focus check-in (+ final `useActionState` submit) | App-local `ScaleInput`, `SliderInput`, `ChipInput`; many **native hidden inputs**; focus-step state machine. |
| `apps/player/app/[token]/components/post-session-form.tsx` | player | Multi-step focus check-in (+ final `useActionState` submit) | App-local `SliderInput` (RPE); hidden inputs; same focus-step pattern (often one step). |
| `apps/player/app/[token]/components/injury-report-form.tsx` | player | Classic submit / `useActionState` | **Native `<input>`**, **`<select>`**, **`<textarea>`** (styled locally, not DS primitives). |
| `apps/player/app/[token]/components/session-page.tsx` | player | **Other** — date chrome (not a submit form) | **Native `input[type=date]`** for day navigation; hosts pre/post forms. |
| `apps/player/app/[token]/components/slider-input.tsx` | player | (Control used by check-in forms) | **Native `input[type=range]`** + hidden value input. |
| `apps/player/app/[token]/components/scale-input.tsx` | player | (Control used by check-in forms) | Button scale UI + **native hidden** value input. |
| `apps/player/app/[token]/components/chip-input.tsx` | player | (Control used by check-in forms) | Chip buttons + optional **native `input[type=number]`** + hidden value. |

## Mode counts (product surfaces)

Approximate product surfaces (excluding orphan `Search`, unused `ClubBrandingCard`, vendor sign-in, and player control primitives counted only with their parent forms):

| Mode | Count (approx.) | Examples |
| --- | --- | --- |
| Classic submit / `useActionState` (or direct action) | ~12 | Create team/season/player, edit player/session/exercise, injuries status, player injury report, create-team dialog |
| Per-field settings autosave | 5 settings sections | Wellness, Equipo, Políticas, Club age fields, Cuenta name |
| Multi-step focus check-in | 2 | Pre-session, post-session |
| File upload (standalone or hybrid) | 4 live | Player photo cell, club logo (in club settings), cuenta avatar, edit-profile dialog |
| Other | 3 live | Attendance batch save, analysis chat, player date chrome |

## Native-control hotspots (SPEC / pilot relevance)

These surfaces still author native HTML controls instead of (or alongside) DS primitives:

1. **Native `<select>`:** create/edit player age band, edit player consent action, wellness form template pickers, políticas reminder-consent selects, injuries status, player injury severity (`create-player-form.tsx`, `edit-player-form.tsx`, `wellness-settings-form.tsx`, `politicas-settings-form.tsx`, `injuries/page.tsx`, `injury-report-form.tsx`).
2. **Native checkbox:** club + políticas age/consent flags (`club-settings-form.tsx`, `politicas-settings-form.tsx`).
3. **Native text inputs / textarea:** player injury report; injuries staff notes (`injury-report-form.tsx`, `injuries/page.tsx`).
4. **Native file:** avatar/logo/player photo surfaces listed above.
5. **Native range / number (player-local):** `SliderInput` (`type="range"`), `ChipInput` custom number (`slider-input.tsx`, `chip-input.tsx`).
6. **Date/time via DS `Input`:** seasons, players, sessions, excused absence — still browser-native pickers under the DS Input wrapper (`type="date"` / `datetime-local`).

## Suggested SPEC / pilot implications

- **Hard cases already named on JES-63 map still hold:** settings autosave (`useSettingsAutosave` in `apps/app/features/settings/hooks/use-settings-autosave.ts`, e.g. wellness) vs classic submit (`CreateTeamForm` / `useActionState`).
- **Additional hard cases for scope:** attendance (no `<form>`, JSON-shaped Server Action), player focus check-in (multi-step + app-local inputs + hidden fields + `useActionState`), and file-upload hybrids.
- **RHF is greenfield:** every surface above is a migration candidate; none already use Hook Form.
- **Good classic-submit pilots:** `CreateTeamForm` (small, DS-only inputs) or `CreateSeasonForm` (adds date inputs).
- **Good autosave pilot:** `EquipoSettingsForm` (two text fields) before `WellnessSettingsForm` / `PoliticasSettingsForm` (native selects/checkboxes).
- **Player check-in:** keep Age Band / focus chrome app-local; SPEC should define how `ScaleInput` / `SliderInput` / `ChipInput` register with RHF (Controller vs outside `FormField`) — already listed under JES-63 “Not yet specified”.

## Explicit exclusions

| Path / area | Reason |
| --- | --- |
| `apps/app/app/prototype/**` | Throwaway prototypes (map out of scope). |
| `apps/player/app/[token]/prototype-dd-05/**` | Design-direction prototypes. |
| `apps/app/features/exercises/components/tactics-board/**` (+ board chrome) | Non-form canvas tooling; only the exercise metadata form around it is in inventory. |
| `apps/web/**` | Outside JES-64 apps (`apps/app`, `apps/player`). |

## Sources

Primary files cited in the inventory table paths above; supporting hooks/actions:

- `apps/app/features/settings/hooks/use-settings-autosave.ts`
- `apps/app/features/settings/actions/settings-field-actions.ts`
- `apps/player/app/[token]/actions/save-entry.ts`
- `apps/player/app/[token]/actions/save-injury.ts`
