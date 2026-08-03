# ADR 0001: Design-system package boundary and promotion gates

- **Status:** Accepted
- **Date:** 2026-08-03
- **Context:** Design-direction wayfinder DD-07
- **Supersedes:** —

## Context

LoadZone shares UI primitives via `@repo/design-system` while `apps/app` and `apps/player` diverge through each app’s `globals.css` and app-local product patterns. Without an explicit boundary, contributors risk:

- auto-promoting components because they appear more than twice
- parking admin- or player-flavored kits inside the shared package
- inventing Figma / multi-kit ceremony that fights the orthogonal shadcn-migration effort

Day-to-day visual principles live in `.cursor/rules`. This ADR records only the **hard-to-reverse** package shape and promotion policy.

Full governance language (migration waves, app-local constraints, prototype graduation): [design-system-governance-and-migration.md](../../.scratch/design-direction-wayfinder/artifacts/design-system-governance-and-migration.md).

## Decision

1. **`@repo/design-system` holds app-agnostic shared primitives and infrastructure only** — interaction atoms, `cn`/fonts/theme, non-domain shared hooks. Appearance comes from each app’s semantic tokens in `globals.css`. Keep the single package name; do not add `components/admin/*` or `components/player/*` kits, and do not split into `@repo/ui-admin` / `@repo/ui-player`.

2. **Promotion into the package requires all five intentional gates** (never use-count alone):
   - App-agnostic contract (no admin density, player check-in/DailyEntry domain, Spanish product copy, or Age Band branches in the primitive)
   - Same interaction need across at least two product boundaries among `{apps/app, apps/player, apps/web}` (or a shared non-UI consumer) — same behavior/API, not merely similar visuals
   - Token-driven appearance only (no per-app class forks in the shared file)
   - Intentional move PR naming the second consumer and linking governance
   - Prefer regenerable registry primitives over one-off shared composites; product composites stay app-local by default

3. **Admin- and player-only patterns stay under their apps** until those gates pass. Document constraints in rules; do not default-promote utilities such as `bevel-card` / `glass-surface` or compositions such as `QuestionCard`.

4. **ADRs remain rare.** Write a new ADR when changing public package export/folder boundary, public semantic token vocabulary for feature authors, or the base component library. Ordinary principle updates go to `.cursor/rules` and wayfinder artifacts only.

## Consequences

- Contributors have a clear reject for drive-by promotes and app kits in the shared package.
- Divergence continues via tokens and app-local composition — aligned with DD-01 / DD-03.
- Wave 0 rule rewrites (after DD-08) cite this ADR; screen pilots and package hygiene follow later waves without reopening the boundary.
- Age Band / Guardian settings stay staff-configurable policy; shared primitives must not fork chrome per band.

## Alternatives considered

- **Rules-only (no ADR)** — lighter, but package boundary is hard to reverse and benefits from an ADR home.
- **Namespaced kits inside DS** — recreates multi-kit bureaucracy rejected by the design-direction map.
- **Use-count auto-promote** — explicitly out of scope for this effort; promotes accidental coupling.
