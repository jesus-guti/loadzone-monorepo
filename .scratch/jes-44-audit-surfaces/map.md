# JES-44 — Audit pilot screens for semantic surfaces and card exceptions

Status: planning complete (plan:auto · 0 hitl)  
Parent: [JES-37 Implement LoadZone design direction](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction)  
Ticket: [JES-44](https://linear.app/jesus-guti-workspace/issue/JES-44/audit-pilot-screens-for-semantic-surfaces-and-card-exceptions)  
Blocked by (assume landed): [JES-39](https://linear.app/jesus-guti-workspace/issue/JES-39/increase-admin-sidebar-icon-size), [JES-42](https://linear.app/jesus-guti-workspace/issue/JES-42/ship-the-player-focus-frame-check-in), [JES-43](https://linear.app/jesus-guti-workspace/issue/JES-43/configure-age-band-cutoffs-and-guardian-policy)  
Backlog source: W2a + W2b in `.scratch/design-direction-wayfinder/BACKLOG.md`  
Route: `plan:auto` · Risk: `bajo` · Blocks: none

## Destination

After Wave 1 pilots land, audit **only** the admin + player files those pilots touched: strip legacy shadcn product authoring, keep or remove framed/`bevel-card` wrappers per DD-01 card exceptions, and leave ordinary containers without structural shadows — **without** a big-bang restyle of untouched screens.

## Notes

- **Doctrine (binding):**
  - DD-01 / [admin-experience-principles.md](../design-direction-wayfinder/artifacts/admin-experience-principles.md) §§3–4: invisible data surfaces; elevation only on floating UI; cards only for floating / single decision widget / compact risk callout (never wrapping lists/tables).
  - `.cursor/rules/loadzone-design-system.mdc`: semantic tokens (`bg-bg-*`, `text-text-*`, `border-border-*`, `brand`, `premium`, `danger`); ban `bg-card`, `bg-muted`, `text-muted-foreground` (and equivalents) in product authoring; no structural shadows on ordinary containers.
  - DD-07 / governance artifact Wave 2: on-touch hygiene only; no mass migration.
- **Wave 1 pilots (accepted backlog, not DD-04 Wellness restyle):**
  - **JES-39** — admin sidebar icon size only; Wellness/list layouts stay production baseline.
  - **JES-42** — player Focus-frame check-in (variant A production path).
  - **JES-43** — staff Age Band cutoffs + Guardian / Parental Supervision settings surfaces.
- **Explicit non-goals (JES-37):** DD-04 Wellness prototype layout; Guardian auth / parent portal; promoting player compositions into `@repo/design-system`.
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Prefer 0 `hitl`. Max 3. Planning only in this wave — no product edits, no commit.
- **Worktree:** `/Users/jesus-guti/Code/personal/worktrees/rely/jes-44` · branch `jgutierrez/jes-44-audit-surfaces`.
- Product UI copy stays Spanish; this map stays English.

## Precedent snapshot (pre-pilot baseline in this worktree)

Useful for implementers; **not** an invitation to widen scope:

| Area | Observation |
|---|---|
| Admin `bevel-card` / framed cards | Present on Wellness player cards, sessions hub cards, session detail — **out of audit unless a pilot PR touches them** |
| Admin legacy tokens | Scattered (`onboarding`, `webhooks`, `seasons`, …) — **out of scope** if untouched |
| Player | Few `text-muted-foreground` hits on entry/`not-found`; check-in tree largely semantic today — still audit **files JES-42 changes** |
| `apps/web` | Heavy legacy tokens — **never in this ticket** |

## Decisions so far

### Auto

1. **[auto] Audit file set = union of paths changed by JES-39 + JES-42 + JES-43 only.**  
   Compute at implement time from the landed pilot diffs (commits/PRs), not from a frozen path list written before pilots exist. Shared layout files count only if a pilot actually edited them (e.g. sidebar for JES-39; settings routes for JES-43; `[token]` check-in tree for JES-42).  
   Reason: ticket AC + BACKLOG W2 “on touched screens”; autonomy = apply documented convention.

2. **[auto] Do not restyle Wellness toward DD-04 invisible-list chrome in this ticket.**  
   W1a-deferred / JES-37 non-goal. Existing `team-wellness-player-card` / Wellness layouts stay unless a pilot file set includes them (JES-39 explicitly must not).  
   Reason: locked backlog + parent non-goals.

3. **[auto] Legacy authoring banlist on audited files.**  
   Replace (or remove) product usage of at least: `bg-card`, `bg-muted`, `text-muted-foreground`, `bg-background` / `text-foreground` when used as shadcn functional stand-ins, and equivalent muted/card patterns. Prefer `bg-bg-*`, `text-text-*`, `border-border-*`. Do not introduce raw Tailwind palette colors (`bg-green-500`, etc.).  
   Reason: design-system rule + ticket AC.

4. **[auto] Card / frame / elevation rules on audited admin surfaces = DD-01 §4.**  
   - Default: frameless lists/tables/toolbars (exercise-library pattern).  
   - Retain framed/`bevel-card`/`glass-surface` only when: (a) floating elevated UI, (b) single interactive decision widget, or (c) compact risk/status callout that does **not** wrap a list/table.  
   - Ordinary containers: no structural `shadow-*`. Elevation stays on dialogs/popovers/menus/tooltips (and true floating chrome).  
   Reason: locked DD-01; design-system elevation rule; DD-07 admin utility constraints.

5. **[auto] Player Focus-frame compositions are not “admin invisible lists.”**  
   Apply the same **token** banlist and **no unjustified structural shadow** rule. Framed step UI (`QuestionCard` / Focus frame) is allowed when removing border/background/radius would hurt the one-question interaction (DD-01 exception b + player app-local patterns). Do not flatten the check-in into an admin-style invisible table.  
   Reason: DD-01 exception boundary + DD-07 player-local patterns; ticket targets unjustified wrappers, not Focus-frame itself.

6. **[auto] Out of scope surfaces stay untouched.**  
   Exclude: untouched admin/player screens; `apps/web`; `@repo/design-system` primitive internals / decorative quarantine (JES-40); sessions hub card walls; onboarding/webhooks/seasons legacy islands; mass `bevel-card` deletion across the admin app.  
   Reason: Wave 2 vs Wave 3 split; anti–big-bang AC.

7. **[auto] No new shared DS primitives or token renames in this ticket.**  
   Hygiene is class swaps + wrapper removal/retain in pilot files. Package quarantine is JES-40.  
   Reason: scope containment; promotion gates unchanged.

8. **[auto] Implementation order.**  
   (1) Bring landed JES-39/42/43 tips into this worktree. (2) Build the touched-file set. (3) Grep banlist + `Card`/`bevel-card`/`glass-surface`/`shadow-*` on that set. (4) Fix tokens; classify each remaining frame against DD-01. (5) PR with checklist mapping AC.  
   Reason: mechanical; matrix `auto`.

9. **[auto] Tests.**  
   No new unit tests required for class-name hygiene unless a pilot left a screenshot/visual regression harness — then keep it green. Prefer a short PR checklist over snapshot noise.  
   Reason: low-value tests that only restate class strings are skipped per LoadZone core rules.

### Assume

10. **[assume] Retained exceptions are documented in the PR body (and a one-line code comment only when non-obvious), not a new repo doctrine file.**  
    List each kept `Card` / `bevel-card` / elevated surface with which DD-01 exception (a/b/c) applies. Do not create `.scratch` exception registries or rule-file edits here (Wave 0 / JES-38 owns doctrine).  
    **Revert:** add a tiny `resolutions/jes-44-retained-exceptions.md` if the human wants a durable audit artifact beyond the PR.

11. **[assume] If a pilot touches a shared leaf that still has legacy classes, fix that leaf fully; do not chase importers outside the touched set.**  
    Example: editing `sidebar.tsx` for icons → clean legacy tokens in that file; do not restyle every nav consumer page.  
    **Revert:** expand to full feature-folder hygiene only if human widens the ticket.

12. **[assume] Zero findings is a valid done state.**  
    If pilots already meet AC, ship an audit-only PR (or close with comment) showing the greps and file set — no cosmetic drive-bys.  
    **Revert:** still require at least one no-op commit documenting the audit if process demands a PR per Linear issue.

## HITL

None. All decisions are `auto` / `assume` under `plan:auto` (max 3 hitl unused).

## Not yet specified (implement-time, not product fog)

- Exact path list (depends on landed pilot diffs).
- Which specific frames (if any) JES-42/JES-43 introduce that claim exception b or c.
- Whether pilots land via merged `dev` or stacked branch tips into this worktree.

## Out of scope

- Big-bang restyle of admin or player apps.
- DD-04 Wellness invisible-list production restyle.
- JES-40 decorative DS quarantine.
- Changing Age Band / Guardian **policy behavior** (owned by JES-43); this ticket only audits surfaces those settings touch.
- Focus-frame product behavior / streak semantics (JES-42 / JES-46).
- `apps/web`, marketing, Figma.

## Decision ledger

| # | Decision | Level |
|---|---|---|
| 1 | Audit set = JES-39∪42∪43 touched paths | auto |
| 2 | No DD-04 Wellness restyle | auto |
| 3 | Legacy token banlist → semantic | auto |
| 4 | Admin cards/elevation = DD-01 §4 | auto |
| 5 | Player Focus-frame may keep interaction chrome | auto |
| 6 | Untouched / web / DS quarantine excluded | auto |
| 7 | No DS primitive / token vocabulary work | auto |
| 8 | Implement order: rebase → grep → fix → PR | auto |
| 9 | No class-name unit tests by default | auto |
| 10 | Document retained exceptions in PR | assume |
| 11 | Fix touched leaves only; no importer chase | assume |
| 12 | Zero findings may close the ticket | assume |

**HITL count: 0** — ready to implement after blockers land and human `JES-44: ok` (or equivalent) on the auto/assume set.

## Handoff for implementer

1. Confirm JES-39, JES-42, JES-43 are on the base used by this worktree.
2. Derive touched files; run banlist + card/elevation greps limited to that set.
3. Apply semantic token swaps; remove unjustified frames; retain + document DD-01 exceptions.
4. Verify admin lists/toolbars in the touched settings/shell paths stay frameless; ordinary containers have no structural shadows.
5. Do not expand into Wellness/sessions/`apps/web`/DS quarantine.
6. PR checklist must map every JES-44 acceptance criterion.

## Report snapshot (for orchestrator)

**Decidido:** auto 1–9, assume 10–12 as above.  
**Pendiente de ti:** — (lista para implementar once pilots land).  
**Riesgo:** bajo · **Bloquea a:** —

### Human review (2026-08-04)
- **JES-44: ok** — all auto/assume accepted; implement only after JES-39, JES-42, JES-43 land (soft-merge tips if needed).
