# wayfinder:prototype

## Question

Run a dry-run of regenerating all shadcn components to see the actual diff before committing to changes.

Steps:
1. Once `packages/design-system/components.json` is updated, run `pnpm dlx shadcn@latest add --all --overwrite --dry-run -c packages/design-system`
2. Review the diff for each component to understand:
   - API changes (props, composability)
   - Import changes (base UI vs radix)
   - Visual/structure changes (base-nova vs new-york)
3. Identify components that changed significantly and may break app/player code
4. This feeds into the actual migration plan
