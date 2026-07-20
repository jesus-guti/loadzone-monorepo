# wayfinder:map — shadcn/ui Monorepo Migration

## Destination

Migrate `apps/app` and `apps/player` to the latest shadcn/ui monorepo setup: **Base UI** (`--base base`) as the component library, **base-nova** style, standard CSS variables with brand/premium overrides, per-app `components.json`, and the shadcn MCP server for agent-assisted development. Keep `@repo/design-system` naming and `@phosphor-icons/react`.

## Notes

- **Issue tracker**: Local markdown under `.scratch/shadcn-migration/`
- **Skills**: grilling, domain-modeling, research, prototype, codebase-design
- **Key constraint**: `packages/design-system` stays named `@repo/design-system`
- **Phosphor icons**: keep `@phosphor-icons/react`, do NOT migrate to lucide
- **Player**: uses design-system components + custom styling; keep customizations intact
- **Language**: repo content in English, UI copy in Spanish

## Decisions so far

- [01-components-json-config](issues/01-components-json-config.md) — Confirmed exact `components.json` for all 3 workspaces. Key findings: `"style": "base-nova"`, `aliases.ui` drops `/ui` subdir, consumer apps point `tailwind.css` to shared package. `tsconfig.json#paths` is sufficient; no `package.json#imports` needed.
- [02-css-variables-migration](issues/02-css-variables-migration.md) — Custom tokens must stay as source of truth (app CSS overrides depend on them). Standard shadcn tokens map FROM custom tokens. Add `@import "shadcn/tailwind.css"`. Keep custom `--premium`, `--success`, `--text-tertiary`, `--text-brand`, `--border-tertiary`, elevations. Drop `--surface-*` aliases. Fix radius scale to base-nova multipliers. Drop inline accordion keyframes.
- [03-custom-components-audit](issues/03-custom-components-audit.md) — 7 components are now standard shadcn (button-group, empty, field, input-group, item, kbd, spinner) → regenerate. 4 remain custom (stateful-button, hover-border-gradient, moving-border, noise-background) → keep as-is.
- [04-mcp-server-setup](issues/04-mcp-server-setup.md) — Command: `pnpm dlx shadcn@latest mcp init --client cursor`. Writes `.cursor/mcp.json` at monorepo root. Works out of the box with default shadcn registry. No changes to `components.json` needed.

## Frontier (open tickets by dependency order)

### Phase 2 — Config (unblocked now that Phase 1 is resolved)
- [05-update-design-system-config](issues/05-update-design-system-config.md) — Rewrite `packages/design-system/components.json` for base-nova
- [07-create-app-components-json](issues/07-create-app-components-json.md) — Create `apps/app/components.json` + `apps/player/components.json`

### Phase 3 — Execute (depends on #05)
- [06-dry-run-regeneration](issues/06-dry-run-regeneration.md) — Dry-run `shadcn add --all --overwrite` to preview changes
- [10-apply-css-migration](issues/10-apply-css-migration.md) — Rewrite globals.css for base-nova + custom overrides (depends on #06 for validation)

### Phase 4 — Cleanup (depends on #06)
- [08-dependency-cleanup](issues/08-dependency-cleanup.md) — Remove radix packages, add Base UI
- [09-custom-components-decisions](issues/09-custom-components-decisions.md) — Decide fate of each custom component

## Not yet specified

- Exact import path changes across `apps/app/features/*` after component regeneration (depends on #06)
- Player-specific customizations that may break after Base UI migration (depends on #06)
- Post-migration build verification and typecheck across apps
- Update `package.json` scripts (bump-ui, etc.) for the new workflow

## Out of scope

- `apps/studio` and `apps/web` migration (separate follow-up effort)
- `apps/api` (no UI)
- Full design polish / visual QA pass
