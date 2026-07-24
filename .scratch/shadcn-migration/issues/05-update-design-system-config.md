# wayfinder:task

## Question

Rewrite `packages/design-system/components.json` for the new setup: `base-nova` style, Base UI, keeping `@repo/design-system` aliases. Run the dry-run to validate.

This is blocked until research tickets #01 (components.json config) and #02 (CSS migration) are resolved, since the config depends on those answers.

Pre-requisite knowledge needed:
- Exact `style` field value for base-nova
- Whether `iconLibrary` stays `lucide` or we keep phosphor (decision: phosphor, but CLI may not support it)
- Correct alias format for monorepo with custom package name
- The `tailwind.css` path for the shared package
