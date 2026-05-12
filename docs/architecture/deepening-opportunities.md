# Architecture deepening opportunities

Document produced from an architecture review pass (vocabulary: **module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality** — see `.agents/skills/improve-codebase-architecture/LANGUAGE.md`).

**Context:** at review time there was no root `CONTEXT.md` or ADRs under `docs/adr/`; the domain used entity names already present in the monorepo (Team, Season, Player, DailyEntry, etc.). The canonical glossary now lives in [`CONTEXT.md`](../../CONTEXT.md) at the repository root.

---

## Candidate summary

| # | Area | Problem in one sentence |
|---|------|---------------------------|
| 1 | `exercise-library-where.ts` | Shared Prisma predicate: good for DRY, but **interface** = full Prisma type; little semantic depth. |
| 2 | Exercise enums (actions + UI) | Values duplicated between server validation and components; drift risk. |
| 3 | Exercise library (many files) | One product flow split across client, API, queries, and utilities; navigation and orchestration friction. |
| 4 | `get-exercise-library.ts` (P2021) | Two near-identical `findMany` calls; happy path vs fallback can diverge. |
| 5 | Design system + `@repo/auth` | UI provider coupled to auth; layer bleed. |
| 6 | `packages/database` | Mix of Prisma client, business seeds, and wide re-exports. |
| 7 | `ensureBaseFormTemplates` on Player page | Mutation on read path; global side effect per request. |
| 8 | `getCurrentStaffContext` | Monolithic orchestration (cookies + DB + rules); hard to exercise in tests. |
| 9 | Server actions vs tested helpers | Real product surface does not match test surface. |

---

## Deep dive: candidate 1 — `exerciseLibraryWhere`

### What the code does today

File: `apps/app/features/exercises/queries/exercise-library-where.ts`.

- Exports a function returning `Prisma.ExerciseWhereInput`.
- Implicit business rule (code comment): exercises visible in the club library = **not archived** and (**club-owned** OR **system catalog**).

### Where it is used (real seams)

1. **`get-exercise-library.ts`** — `getExerciseLibraryPayload` (happy + fallback branches) and `getExercisePickerRows`: same `where` in both `findMany` calls.
2. **`exercise-actions.ts`** — `toggleExerciseFavorite`: composes `AND: [{ id: exerciseId }, exerciseLibraryWhere(clubId)]` so the exercise is in library scope before toggling favourites.

There are **three distinct consumers** of the same predicate; the file is not orphaned.

### Deletion test (review)

- If you **delete** the module and replace nothing, the `OR` + `isArchived` condition must **reappear** in at least three places → the module **earns its maintenance** as the single source of truth for library visibility.
- The original “too thin / shallow module” critique fits better this way: **depth** is not low by line count, but because the exposed **interface** is Prisma’s generic type—the caller “sees” all of `ExerciseWhereInput` power and invariants (not composing other filters incorrectly) are **not encapsulated** in a narrower type.

### Minor redundancy in the `where` object

Inside `OR`, each branch repeats `isArchived: false` and the root object also sets `isArchived: false`. Redundant but harmless; simplifying is cosmetic unless intent is documented (defence in depth vs mistake).

### Design options (no fixed interface yet)

**A — Keep one thin module (conscious status quo)**

- Add **locality** of knowledge: tests that pin predicate behaviour (e.g. serialisable object snapshot or minimal cases in comment + test).
- **Benefit:** no abstraction bloat; **leverage** stays “one place to change library visibility”.

**B — Grow the same file (same Prisma seam)**

- The module could gain sibling functions if more shared rules appear (e.g. “club only”, “system only”) **only** while the same three call families exist—avoid extracting a function per line without a second consumer.

**C — Introduce an intermediate domain type**

- Only makes sense if a **second adapter** exists that is not Prisma but shares the rule (e.g. external search engine, other ORM). No evidence in-repo today; would be a **hypothetical seam**.

**D — Inline the `where` only inside `get-exercise-library.ts`**

- **Not recommended:** `exercise-actions.ts` still needs the rule; inlining worsens **locality** (duplication or circular imports).

### Risks if the file is “just removed”

- Drift between list/picker and actions that validate club scope (favourites, edit, etc.).
- Security or product regressions hard to spot in review (`where` edited in one place only).

### Practical conclusion for candidate 1

Do not treat the file as disposable pass-through: it is a **common adapter** from the visibility rule to Prisma at **several** call sites. The best **leverage** / **locality** for reasonable effort is **document invariants + regression tests for the predicate**, not delete the module. Reserve a richer domain type for when a second store or engine must share the rule without importing Prisma.

---

## Suggested next steps

- Pick another row from the table to deepen or implement (e.g. tests for `exerciseLibraryWhere`, or tackle #4 / #7 per product priority).
- When deepening exercise candidates, align wording with [`CONTEXT.md`](../../CONTEXT.md) (e.g. exercise library vs system catalog) and extend the glossary there if new load-related terms stabilise.
