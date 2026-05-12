---
Status: ready-for-agent
Labels: ready-for-agent
---

# PRD: LoadZone architecture deepening (exercise library and cross-cutting seams)

## Problem Statement

Engineering and agents working in the LoadZone monorepo (staff and player apps, shared packages) lose time hopping across many small modules to understand a single product flow. Business rules are duplicated or scattered (e.g. exercise vocabulary across validation and UI), shared predicates lack explicit tests, shared packages mix persistence with domain seeding, and sensitive player routes run global side effects on read paths. The test surface does not match the real surface of server actions and staff context, increasing silent regression risk. A root `CONTEXT.md` glossary now exists to stabilise naming between humans and agents; it should be extended lazily as terms settle.

## Solution

Run an incremental **deepening** programme: consolidate rules where several real consumers already exist; add tests at the **interface** the product uses (shared predicates, critical actions where appropriate); decouple layers where leakage blocks reuse or reasoning (design vs auth, database package vs bootstrap); and move “ensure system data” effects off the player’s critical read request. Prioritise changes with strong **locality** (one place to fix) and **leverage** (same rule, many call sites) without a big-bang rewrite. Record decisions in this PRD and, when warranted, in future ADRs; extend `CONTEXT.md` when domain terms stabilise.

## User Stories

1. As a staff maintainer, I want the rule for which Exercises appear in the club library to live in one well-tested place, so that list views and server actions never disagree on scope.
2. As a staff maintainer, I want favorite toggles to respect the same library visibility rule as the list, so that players cannot target exercises outside the library through stale IDs.
3. As a staff maintainer, I want picker rows and full library payloads to use identical visibility logic, so that training session flows match the exercise library.
4. As a QA-minded developer, I want automated tests that pin the semantics of library visibility (not Prisma internals), so that refactors do not silently widen or narrow what staff can see.
5. As a security-conscious reviewer, I want server-side mutations to compose scope predicates in one way, so that authorization reviews have a single mental model.
6. As a frontend developer, I want exercise enum values and labels defined once, so that forms and Zod schemas never drift after a product copy change.
7. As a frontend developer, I want adding a new exercise attribute to require touching a minimal set of modules, so that delivery stays fast and safe.
8. As a staff user, I want filters and badges in the exercise library to reflect the same categories the backend accepts, so that I never see a filter that saves nothing or errors obscurely.
9. As a product engineer, I want the exercise library feature slice to read as one story (list + toolbar + API + query), so that onboarding and code review stay cheap.
10. As an agent (AFK implementer), I want a map of which modules implement “library list + filters + favorites”, so that I can change behavior without missing the API route or sort helpers.
11. As a maintainer, I want duplicated Prisma query shapes (happy path vs fallback) documented or unified, so that the favorites table migration path cannot diverge in selected fields.
12. As a developer, I want a clear policy for when a second `findMany` fallback is acceptable, so that we do not accumulate copy-paste compatibility layers.
13. As a platform engineer, I want the design system package not to hard-depend on auth, so that I can reuse UI primitives in docs, marketing, or tools without pulling session providers.
14. As an app engineer, I want each app’s root layout to compose auth and design providers explicitly, so that the dependency graph matches mental ownership.
15. As a player-app maintainer, I want the player shell to stay free of unnecessary providers, so that bundle and behavior stay predictable.
16. As a database package consumer, I want importing the DB client not to imply running business seed logic, so that scripts and tests stay lightweight.
17. As a DevOps engineer, I want base form templates ensured via migrations or deploy hooks, so that production traffic does not pay upsert cost on every player page view.
18. As a player, I want the check-in page to load reliably without hidden global writes, so that intermittent DB contention does not block read paths.
19. As a staff developer, I want `getCurrentStaffContext` (or its successors) to expose a small testable surface for “active team/season/membership” rules, so that permission bugs are caught near the rule not only in E2E.
20. As a test author, I want to test staff workspace resolution without mocking the entire Next.js cookie stack when testing pure rules, so that unit tests stay fast.
21. As a staff user, I want wrong or expired session edge cases handled consistently, so that I see clear errors instead of partial UI.
22. As a maintainer, I want server actions that mutate Exercises or DailyEntry to have integration-style tests where business risk is high, so that revalidatePath and DB updates stay correct together.
23. As a maintainer, I want pure sort/filter helpers to remain unit-tested without pretending they cover action orchestration, so that coverage numbers do not create false confidence.
24. As a library author, I want a documented rule for when to extract a new seam (two adapters), so that we do not invent interfaces without a second consumer.
25. As an architect, I want optional domain glossary entries for “system catalog exercise” vs “club exercise”, so that PRs and issues use the same words as CONTEXT (once created).
26. As a documentation reader, I want this PRD linked from the architecture deepening note, so that I can trace prose recommendations to trackable work.
27. As a release manager, I want risky refactors split into vertical slices (e.g. visibility tests before enum merge), so that each PR is reviewable and revertible.
28. As a staff user, I want exercise archiving behavior consistent everywhere, so that archived items never reappear in pickers due to a forgotten predicate branch.
29. As a compliance-minded stakeholder, I want player token flows to avoid unnecessary writes and logging, so that the attack surface and audit trail stay clear.
30. As a monorepo contributor, I want fewer barrel re-exports from the database package, so that tree-shaking and mental models improve.
31. As a performance investigator, I want player route handlers not to run seed upserts on cold starts, so that p95 latency stays stable.
32. As a code reviewer, I want PR descriptions to name the seam being tightened, so that architecture discussions reuse shared vocabulary (module, interface, seam, adapter).
33. As a new hire, I want an index of “where lives exercise library scope”, so that I do not grep half the repo on day one.
34. As a staff maintainer, I want exercise library API responses to stay aligned with server-rendered lists, so that client refetch and SSR do not disagree.
35. As a player-app engineer, I want save-entry style actions reviewed for test gaps, so that validation and persistence invariants stay paired.
36. As a staff engineer, I want session-related actions to share patterns with exercise actions for context acquisition, so that bug classes repeat less often.
37. As a future multi-tenant engineer, I want club-scoped predicates centralized, so that later row-level security or tenancy rules plug in at one seam.
38. As a tooling engineer, I want CI to run the new predicate tests on every PR touching exercises, so that regressions are caught early.
39. As a product owner, I want out-of-scope items explicitly listed, so that expectations for this initiative stay bounded.
40. As a maintainer, I want follow-up ADRs only when a rejected approach would otherwise be re-proposed, so that docs stay high-signal.

## Implementation Decisions

- **Exercise library visibility predicate**: Keep a single module that encodes “non-archived club exercises plus non-archived system catalog exercises” for staff library and related mutations; do not duplicate the `OR` composition across list, picker, and favorite-toggle paths. Optionally simplify redundant `isArchived` clauses only if behavior stays identical and tests cover it.
- **Regression tests for visibility**: Add tests that assert the observable contract of that predicate (e.g. serialized shape or table-driven expectations of which exercise classes match), not every Prisma detail, so the interface remains stable for callers.
- **Exercise enums and schemas**: Introduce or extend a shared vocabulary module consumed by server validation and by UI option lists, so Zod enums and display labels have one source of truth.
- **Library query dual path**: For the code path that catches missing favorites relation errors, either extract the duplicated select into a shared builder function or document invariant that both branches must stay field-identical; prefer mechanical deduplication to reduce drift risk.
- **Design system vs auth**: Move session/auth provider composition to app layouts (or an app-level provider wrapper), so the design system package’s public surface does not require `@repo/auth` for basic UI usage.
- **Database package responsibilities**: Split “Prisma client + type re-exports” from “ensure base templates / seed-like upserts” so application imports can depend on the thin client without inheriting product bootstrap side effects.
- **Player read routes**: Relocate `ensureBaseFormTemplates` (or equivalent) to migration, deploy script, or a guarded one-off job so the player token page read path does not perform global writes.
- **Staff context resolution**: Decompose `getCurrentStaffContext` into smaller modules with narrow interfaces (e.g. session resolution vs workspace membership vs active team/season selection) behind a thin orchestrator, only where it improves testability without scattering call sites.
- **Server actions**: For high-risk actions (mutations touching Exercises, favorites, DailyEntry, sessions), add tests that exercise the action’s public contract (success/error shapes and key side effects) using patterns consistent with the repo’s existing test stack; keep pure helpers in fast unit tests.
- **Documentation**: Keep the living architecture summary in `docs/architecture/` updated when slices land; create `CONTEXT.md` terms lazily when naming stabilizes, per project convention.
- **No ADR unless needed**: Record an ADR only if a durable “we will not X” decision must prevent future re-debate (e.g. explicit rejection of domain types mirroring every Prisma where clause).

## Testing Decisions

- **Good tests** assert **external behavior**: return shapes, error modes, and stable contracts of predicates and actions—not internal import graphs or private function names unless they encode a public invariant.
- **Modules to test first**: (1) exercise library visibility predicate; (2) shared exercise enum/schema module once centralized; (3) selected server actions with highest business or security sensitivity; (4) any extracted pure rules from staff context resolution.
- **Prior art**: Follow existing patterns under staff app automated tests (e.g. scope and wellness workspace helper tests) for naming, runners, and assertion style; extend rather than invent a parallel framework.
- **Not required in first slice**: Full E2E replacement for every action; snapshot tests of entire HTML responses; testing Prisma-generated types themselves.

## Out of Scope

- Rewriting the exercise editor, diagram subsystem, or media pipeline.
- Replacing Prisma or the database vendor.
- Introducing a second non-Prisma storage adapter solely to justify a domain predicate type (wait until a real second adapter exists).
- Building a full `CONTEXT.md` glossary from scratch in this initiative unless a term becomes load-bearing during implementation.
- Large-scale migration of every server action to a new architecture pattern in one release.
- Changing player-facing UX copy or visual design beyond what technical refactors require.
- Performance benchmarking campaigns unless a change is motivated by measured regression.

## Further Notes

- This PRD synthesizes a prior architecture review and the deep-dive on **exercise library visibility**: that predicate should be **retained** as the single source of truth (multiple real consumers), strengthened with tests rather than deleted as a “thin pass-through.”
- Coordinate with whoever owns CI: new tests should run on the existing `pnpm` test workflow for the affected app or package.
- After implementation slices land, consider linking from the deepening opportunities document to this PRD path for traceability.
