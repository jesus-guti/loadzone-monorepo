# JES-69 — Decide control vocabulary and native exceptions

Issue: [Decide control vocabulary and native exceptions](https://linear.app/jesus-guti-workspace/issue/JES-69/decide-control-vocabulary-and-native-exceptions)  
Parent map: [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
Route: `plan:auto` (AFK full pipeline) · Risk: `med` · Worktree: `../worktrees/rely/jes-69`  
Grounded on: [Catalog form surfaces and interaction modes](https://linear.app/jesus-guti-workspace/issue/JES-64/catalog-form-surfaces-and-interaction-modes), [Inventory DS fields and RHF Form gap](https://linear.app/jesus-guti-workspace/issue/JES-65/inventory-ds-fields-and-rhf-form-gap), ADR 0001, `loadzone-design-system.mdc`

## Destination

Policy for which DS controls product forms may author, when native HTML is allowed, and that RHF adoption migrates controls to DS primitives in the same contract — ready for pilots (JES-70) and SPEC synthesis (JES-71). No production migration in this ticket.

## Decisions so far

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | Closed finite option lists → DS `Select*`; searchable/filterable or long lists → DS `Combobox*`; `DropdownMenu` is not a form value picker | `hitl→accepted` (AFK) | Aligns with session/exercise Select usage; Combobox unused but present |
| 2 | Product forms: use DS `Select` for closed option lists. Raw `<select>` banned | `hitl→accepted` (AFK) | RHF `Controller` removes FormData-native excuse; EnumSelect+hidden pattern already proves Select path |
| 3 | Ban new raw `<input>` / `<select>` / `<textarea>` in product form trees outside the explicit exception list; existing natives are migration debt | `hitl→accepted` (AFK) | Matches JES-63 standing preference |
| 4 | Exception allow-list: `type="hidden"`; `type="file"` (hidden native + DS trigger); DS `Input` typed variants (`date`, `datetime-local`, `number`, …); DS `InputOTP`; readonly non-control display; internals of ADR-gated app-local player controls (`ScaleInput` / `SliderInput` / `ChipInput`) | `auto` | From JES-64/65 inventory + browser constraints |
| 5 | Booleans → DS `Checkbox` / `Switch` / `ToggleGroup` / `RadioGroup` as interaction requires — never native `type="checkbox"` / `type="radio"` in product forms | `auto` | DS primitives exist; settings still use native checkboxes |
| 6 | Text → DS `Input`; multiline → DS `Textarea`; layout labels/errors via future Form* / Field* (JES-66 home), not ad-hoc native | `auto` | Standing map preference |
| 7 | Lint/CI guard against natives stays fog — not mandated as mandatory deliverable of this ticket | `auto` | Listed under parent map Not yet specified; open follow-up |

**HITL count: 3** (all AFK-accepted) — no user gate remaining.

## Resolution artifact

[.scratch/form-system-wayfinder/resolutions/control-vocabulary-and-native-exceptions.md](../form-system-wayfinder/resolutions/control-vocabulary-and-native-exceptions.md)

## Out of scope

- Migrating existing native fields in product (post-SPEC / pilots).
- Mandating ESLint/CI enforcement in this ticket.
- Player Age Band chrome forks or check-in question redesign.
- How Scale/Slider/Chip register with RHF (parent map fog → later ticket).
