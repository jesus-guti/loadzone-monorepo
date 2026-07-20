# wayfinder:task

## Question

After all components are regenerated with Base UI and base-nova, what packages can be removed from `packages/design-system/package.json`?

Currently it has `"radix-ui": "latest"` (from the radix migration). With Base UI:
1. Is `radix-ui` still needed or replaced entirely?
2. What other radix-specific packages can be dropped?
3. Does Base UI add its own dependency, and what is it?
4. Update `packages/design-system/package.json` accordingly

Post-cleanup, run `pnpm install` and verify the monorepo builds.
