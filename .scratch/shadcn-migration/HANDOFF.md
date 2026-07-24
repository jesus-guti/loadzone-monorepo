# Handoff: shadcn/ui Monorepo Migration — Loadzone

## Session summary

This session completed the **Wayfinder "Chart the map" phase** for migrating `apps/app` and `apps/player` to the latest shadcn/ui monorepo setup. The map and 10 tickets exist at `.scratch/shadcn-migration/`. Phase 1 (4 research tickets) is resolved; Phase 2-4 are ready to execute.

## Destination

Migrate `apps/app` and `apps/player` to shadcn/ui monorepo with **Base UI** (`--base base`), **base-nova** style, per-app `components.json`, standard CSS variables with brand/premium overrides, and the shadcn MCP server. Keep `@repo/design-system` naming and `@phosphor-icons/react`.

## What was decided

| Decision | Detail |
|----------|--------|
| Layout | Keep `packages/design-system` + `@repo/design-system` (not `@workspace/ui`) |
| Style | `base-nova` (from `new-york`) |
| Base library | Base UI (`--base base`) instead of Radix |
| Icons | Keep `@phosphor-icons/react`, not lucide |
| Theme vars | Custom tokens stay as source of truth; standard shadcn tokens map FROM them (app CSS overrides survive) |
| MCP server | `pnpm dlx shadcn@latest mcp init --client opencode` (user is on Zed + OpenCode) |
| Scope | `apps/app` + `apps/player` only. `studio`/`web` out of scope. |

## Artifacts created

- **Map**: `.scratch/shadcn-migration/MAP.md` — the canonical index
- **10 tickets**: `.scratch/shadcn-migration/issues/01-*.md` through `10-*.md`

## Research resolved (Phase 1 — DONE)

Read the ticket files for full detail; gists below:

- **#01 components.json configs**: Exact JSON for all 3 workspaces (`packages/design-system`, `apps/app`, `apps/player`) documented in the ticket. `"style": "base-nova"`, `aliases.ui` drops `/ui` subdir. `tsconfig.json#paths` is sufficient; no `package.json#imports` needed.
- **#02 CSS variables migration**: Custom tokens (`--bg-primary`, `--brand`, `--premium`, etc.) stay as source of truth. Standard shadcn tokens map FROM them. Add `@import "shadcn/tailwind.css"`. Drop `--surface-*` aliases. Fix radius scale. App CSS files (`apps/app/app/globals.css`, `apps/player/app/globals.css`) need **zero changes**.
- **#03 Custom components audit**: 7/11 custom components are now standard shadcn → regenerate. 4 remain truly custom → keep as-is.
- **#04 MCP server**: Command is `pnpm dlx shadcn@latest mcp init --client opencode` from monorepo root. Works with default shadcn registry. No config changes needed.

## What to do next (next agent session)

Follow the **Wayfinder "Work through the map"** flow:

### Phase 2 — Config (unblocked, AFK tasks)

1. **#05**: Update `packages/design-system/components.json` — change `"style": "new-york"` → `"base-nova"`, update `aliases.ui` to `@repo/design-system/components` (drop `/ui` subdir). Exact config is in ticket #01 research findings.

2. **#07**: Create `apps/app/components.json` and `apps/player/components.json` — exact configs are in ticket #01 research findings.

### Phase 3 — Execute (blocked by #05)

3. **#06**: Run `pnpm dlx shadcn@latest add --all --overwrite --dry-run -c packages/design-system` to preview all component diffs before committing.

4. **#10**: Apply CSS migration (rewrite `packages/design-system/styles/globals.css`). Follow the detailed plan in ticket #02. Key: preserve the two-layer token architecture so app CSS overrides keep working.

### Phase 4 — Cleanup (blocked by #06)

5. **#08**: Remove `radix-ui` dependency, add `@base-ui/react`. Clean up `packages/design-system/package.json`.

6. **#09**: Decide which custom components to regenerate vs keep. 7 are now standard shadcn (regenerate via CLI), 4 stay custom.

### If the dry-run (#06) reveals unexpected breakage

After #06, the fog of war will clear on:
- Exact import changes needed across `apps/app/features/*`
- Player-specific breakage from Base UI migration
- Whether `shadcn migrate icons` can help with phosphor icon imports in regenerated components

## Suggested skills

When working through the map:

- **wayfinder** — load the map at `.scratch/shadcn-migration/MAP.md` and pick the next frontier ticket
- **codebase-design** — when making structural decisions about component APIs or CSS architecture
- **prototype** — before applying the full CSS migration (#10) or component regeneration (#06), prototype the approach on a small subset
- **domain-modeling** / **grilling** — if any design decisions need the human's input (particularly for #09 custom components)
- **research** — if new questions arise during execution that need doc-diving

## Key files to reference

| File | Purpose |
|------|---------|
| `.scratch/shadcn-migration/MAP.md` | Canonical map and frontier |
| `.scratch/shadcn-migration/issues/01-*.md` | Research findings (resolved) |
| `.scratch/shadcn-migration/issues/05-*.md` through `10-*.md` | Pending tickets |
| `packages/design-system/components.json` | Current config to update |
| `packages/design-system/styles/globals.css` | Current CSS to migrate |
| `packages/design-system/components/ui/` | ~57 components to regenerate |
| `apps/app/app/globals.css` | App theme overrides (DO NOT touch) |
| `apps/player/app/globals.css` | Player theme overrides (DO NOT touch) |

## Constraints / guardrails

- `packages/design-system` stays named `@repo/design-system` (NOT renamed to `@workspace/ui`)
- `apps/app/app/globals.css` and `apps/player/app/globals.css` — zero changes needed per #02 research
- Custom phosphor icons — regenerated components will have lucide imports that need manual conversion, OR investigate `shadcn migrate icons`
- Language: repo content (docs, code comments) in English; UI copy in Spanish
