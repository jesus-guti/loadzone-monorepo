# Control vocabulary and native exceptions

**Ticket:** [Decide control vocabulary and native exceptions](https://linear.app/jesus-guti-workspace/issue/JES-69/decide-control-vocabulary-and-native-exceptions)  
**Parent map:** [Form system: RHF + design-system controls](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
**Accepted:** AFK full pipeline (`hitl→accepted` ×3) — 2026-08-05  
**Map scratch:** [.scratch/jes-69-control-vocabulary/map.md](../../jes-69-control-vocabulary/map.md)  
**Grounded on:** JES-64 form-surfaces inventory, JES-65 DS/RHF gap, ADR 0001, `loadzone-design-system.mdc`

## Answer

Product forms in `apps/app` and `apps/player` author **design-system field primitives only**, except the explicit allow-list below. Adopting React Hook Form on a surface **includes** migrating that surface’s controls to this vocabulary in the same change — do not wrap leftover raw natives in `Controller` and call it done.

### 1. Option-list vocabulary

| Need | Use | Do not use |
| --- | --- | --- |
| Closed, finite options (enums, status, templates, age band, short lists) | DS `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` / … | Raw `<select>`, `NativeSelect` (new fields), `DropdownMenu` as value picker |
| Long lists and/or typeahead / filter / clearable search | DS `Combobox` / `ComboboxInput` / `ComboboxList` / `ComboboxItem` / … | `Select` stretched into a search box; menu-as-picker |
| Commands / actions (not a form field value) | DS `DropdownMenu` (or Button + menu) | Using menu items to set RHF field values |

**Law:** `DropdownMenu` is chrome for actions, not a substitute Select. Team/season switchers that are navigation chrome may keep DS `Select` (current pattern); they are not product form fields under this vocabulary.

**RHF note:** Wire `Select` / `Combobox` through Form* / `Controller` (once Form* exists). Do not require a parallel hidden native `<input name=…>` once the field is RHF-controlled; the exercise-form `EnumSelect` + hidden input pattern is a pre-RHF bridge, not the target contract.

### 2. NativeSelect stance

| Scope | Stance |
| --- | --- |
| `@repo/design-system` package | **Keep** `native-select.tsx` (no deletion / no ADR change). |
| New product form fields | **Discouraged → treat as no-new-usage.** Prefer DS `Select`. |
| Raw `<select className=…>` | **Banned** in product form trees (replace with `Select`; do not “upgrade” only to `NativeSelect` as the end state). |
| Transitional debt | Existing raw selects (settings templates, player age band, injuries, player injury report, etc.) migrate to `Select` when those surfaces adopt RHF — not to `NativeSelect` as a permanent home. |

**Why not ban the package export:** NativeSelect can still serve non-form demos, progressive-enhancement experiments, or rare non-product trees without forcing a package delete. Product form law is stricter than package inventory.

### 3. Ban on new raw field elements

**Banned** in product form trees (`apps/app` / `apps/player` feature forms and settings sections), outside §4:

- raw `<input>` (any visible text-like or boolean control)
- raw `<select>`
- raw `<textarea>`

**In scope for the ban:** settings autosave sections, classic submit forms, attendance grids that act as forms, player injury report, staff injury status editors, dialogs that collect domain fields.

**Out of ban scope (not product form trees):** throwaway `prototype/**`, tactics-board canvas chrome, vendor Clerk auth, analysis chat compose (unless SPEC later pulls it in), marketing `apps/web` (outside this map’s core; still prefer DS when touched).

Existing violations listed in JES-64 “Native-control hotspots” are **migration debt**, not precedent for new code.

### 4. Explicit exceptions (allow-list)

| Exception | Rule |
| --- | --- |
| `input type="hidden"` | **Allowed** for ids, scopes, serialized payloads, and temporary FormData bridges until a field is fully RHF-controlled. |
| `input type="file"` | **Allowed** as a native element (usually visually hidden) triggered by a DS `Button` / labeled control. Prefer not to style a visible raw file input; DS `Input type="file"` is acceptable when the file chrome is intentional. Upload UX stays as today (change / transition / FormData). |
| Typed text-ish fields | Use **DS `Input`** with `type`: `text`, `email`, `password`, `number`, `date`, `datetime-local`, `time`, `search`, `tel`, `url`, etc. — not a raw `<input>`. Browser-native date/time pickers under DS `Input` are acceptable until a Calendar-based pattern is chosen elsewhere. |
| OTP | Use DS **`InputOTP`** (+ slots/group). Do not assemble OTP from raw inputs. |
| Readonly display | Prefer typography / read-only text, not a disabled fake field, unless a11y needs a focusable read-only control — then DS `Input readOnly` / disabled as appropriate, not raw markup. |
| Player app-local check-in controls | **`ScaleInput` / `SliderInput` / `ChipInput`** may keep native internals (`type="range"`, hidden value inputs, optional number) **inside** those ADR-gated compositions. New *outer* form trees still do not sprinkle raw fields beside them. How they register with RHF remains parent-map fog (not decided here). |
| Checkboxes / radios / switches | **Not** exceptions — use DS `Checkbox`, `RadioGroup`, `Switch`, or `ToggleGroup`. Native `type="checkbox"` / `type="radio"` in settings is debt. |

### 5. Core control map (quick reference)

| Intent | Primitive |
| --- | --- |
| Single-line text / typed browser input | `Input` |
| Multiline text | `Textarea` |
| Closed options | `Select*` |
| Searchable / long options | `Combobox*` |
| Boolean (binary) | `Checkbox` or `Switch` (density/affordance choice is implementation detail; both DS) |
| One-of few visible options | `RadioGroup` or `ToggleGroup` |
| Continuous numeric (shared) | `Slider` |
| Date filter / picker UI | `Calendar` where product already uses it; else `Input type="date"` via DS |
| OTP | `InputOTP*` |
| Field layout / errors | DS `Field*` and/or future Form* (home decided by sibling tickets) — not ad-hoc `<label>`+native stacks for new work |

### 6. Enforcement (fog)

Whether to add an ESLint / CI guard for raw `<input>`/`<select>`/`<textarea>` in product form trees remains **Not yet specified** on the parent map. This resolution does **not** require shipping a linter in the Form System SPEC destination; it may graduate later. Until then, reviewers and pilots treat §3–§4 as law.

## Implications for blocked tickets

- **[Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots):** pilots must demonstrate DS `Select` (not native/`NativeSelect`) on any option field they touch; settings autosave pilot should replace native selects/checkboxes on the chosen surface.
- **[Synthesize Form System SPEC](https://linear.app/jesus-guti-workspace/issue/JES-71/synthesize-form-system-spec):** encode this vocabulary + exception table as normative SPEC sections.

## No-goals

- Production migration of all native hotspots.
- Deleting or quarantining `NativeSelect` at package export level.
- Mandating CI/ESLint in this ticket.
- Deciding Form* package home (JES-66) or autosave↔RHF contract (JES-67) or error mapping (JES-68).
