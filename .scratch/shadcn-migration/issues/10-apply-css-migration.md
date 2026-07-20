# wayfinder:task

## Question

Apply the CSS migration: rewrite `packages/design-system/styles/globals.css` for base-nova + custom overrides.

Based on research #02:
1. Start with the base-nova default CSS (or `shadcn/tailwind.css` import)
2. Add our custom tokens as overrides (brand, premium, danger, success, elevations)
3. Map our old variable names to the new ones so existing components don't break
4. Remove any CSS that's now redundant
5. Ensure `@import "tailwindcss"` and `@import "tw-animate-css"` are correct for Tailwind v4
