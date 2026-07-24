# wayfinder:research

## Question

What does the default `base-nova` globals.css look like, and what is the diff against our current custom `packages/design-system/styles/globals.css`?

Specifically:
1. Fetch/recreate the default `base-nova` CSS that `shadcn init --base base` generates
2. Map our custom tokens (`--bg-primary`, `--text-primary`, `--brand`, `--premium`, `--danger`, `--success`, elevation shadows) onto the standard shadcn variables
3. Identify what custom CSS we can drop and what must be preserved as overrides
4. Determine if we need `@import "shadcn/tailwind.css"` or if we can keep our current tailwind v4 setup
