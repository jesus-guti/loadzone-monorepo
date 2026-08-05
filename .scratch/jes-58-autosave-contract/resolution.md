# JES-58 — Settings autosave contract (resolution)

Issue: [Define settings autosave contract](https://linear.app/jesus-guti-workspace/issue/JES-58/define-settings-autosave-contract)  
Parent: [Admin settings shell](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar) (JES-56)  
Grounded on: JES-57 prototype (Equipo has **no Save** chrome; controls feel autosave-shaped)

## Law (all five routes)

Applies to **Equipo / Wellness / Políticas / Club / Cuenta**. Autosave is absolute — no page-level **Guardar** for any subset. Destructive/irreversible actions (if any later) stay **outside** this contract.

## Answers

### 1. What counts as “a change”?

One **control commit**:

| Control kind | Commit moment |
|---|---|
| Toggle / select / segmented / checkbox | **Immediate** on value change |
| Text / number | **Debounce ~300ms** (UI timing band from design-system motion guidance) **and** commit on **blur** if value differs from last saved |

Dense multi-field policies (age bands, reminder consent): save **the field that changed**, not the whole policy blob as one atomic UI action. Still one server mutation per control unless an existing action already batches for correctness.

### 2. Debounce / blur / immediate?

- Immediate: discrete controls (toggle, select, segmented, checkbox).
- Debounced + blur: continuous text/number inputs.
- Do not require Enter to save.

### 3. Success and failure feedback?

- **Success:** silent or very subtle (no success-toast spam).
- **Failure:** Spanish error toast; control returns to last known good **or** stays dirty with an obvious retry path.
- Permission-denied: existing authz error path; do **not** loosen `canEdit` / `canCreateTeam`.

### 4. Concurrent edits / team switch mid-save?

Ignore stale responses (request generation / aborted fetch). Do **not** apply results for a team (or route context) that is no longer active. Leaving a route mid-save: same rule — drop stale completions.

### 5. Explicit Guardar?

**No** — autosave absolute across the five routes. No subset keeps a Save button under this contract.

## Observability from prototype

JES-57 Equipo intentionally omits Save/Submit chrome so density matches this law. Implementers must not reintroduce footer Guardar when wiring production actions.

## No-goals (unchanged)

- Implementing autosave in product UI in this ticket.
- Redesigning server action APIs beyond what implementers need later.
- Optimistic-UI animation design beyond feedback rules above.
- Player-app persistence.
