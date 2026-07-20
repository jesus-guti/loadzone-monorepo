# wayfinder:research

## Question

What is the exact `components.json` configuration needed for each workspace in this specific monorepo setup using Base UI (`--base base`) and `base-nova` style?

Specifically:
1. **`packages/design-system`** — as the shared UI package, with aliases pointing to `@repo/design-system`
2. **`apps/app`** — as consumer, aliases pointing to `@repo/design-system` for shared components + `@/` for app-local
3. **`apps/player`** — same as app

Research the shadcn docs for:
- The `--base base` option requirements
- Monorepo `components.json` requirements (every workspace needs one)
- How aliases should be configured when keeping `@repo/design-system` naming
- Whether `package.json#imports` or `tsconfig.json#paths` is needed
- Differences between "ui package" and "app consumer" `components.json` files


## Research Findings

### Sources consulted

- https://ui.shadcn.com/docs/monorepo
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/docs/components-json
- Current project files (see Project State below)

### 1. `--base base` and `style` field

- **`--base base`** is a **CLI init flag only** (values: `base`, `radix`, `aria`). It does NOT appear as a field in `components.json`. It tells the CLI which underlying component library to use:
  - `base` → `@base-ui/react` (Headless UI from the Base UI team)
  - `radix` → `radix-ui` (what this project currently uses)
  - `aria` → `react-aria-components`
- The **`style`** field in `components.json` should be `"base-nova"` (as confirmed by the monorepo docs examples). This is the visual style that layers on top of the base library.
- The existing project uses `"style": "new-york"` with radix-ui. Changing to `"style": "base-nova"` implies also migrating the underlying components from radix-ui to `@base-ui/react`. These are two separate migrations but the `components.json` config is the same regardless.
- **Warning:** Both `style` and `baseColor` are "cannot be changed after initialization" fields per the docs — components must be regenerated if these change.

### 2. Monorepo requirements

From the shadcn monorepo docs:

1. **Every workspace** (shared UI package AND every consumer app) must have its own `components.json`.
2. **Same `style`, `iconLibrary`, and `baseColor`** must be used across all `components.json` files.
3. **For Tailwind CSS v4**: the `tailwind.config` field must be empty string `""`.
4. The `components.json` aliases tell the CLI where to install files and how to rewrite imports.

### 3. Aliases: pattern for ui-package vs consumer

The monorepo docs establish this pattern:

**UI Package** (`packages/ui/components.json`) — all aliases self-reference the shared package:
```json
{
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components"
  }
}
```

**App Consumer** (`apps/web/components.json`) — `ui` and `utils` point to shared package; `components`/`hooks`/`lib` are local:
```json
{
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

**Logic**: The CLI uses `ui` alias for primitive components (button, dialog, etc.) → installed in shared package. The `components` alias is for blocks/page-level components (login-01, dashboard-01, etc.) → installed in the app locally. `utils` is the import path for `cn`.

### 4. `package.json#imports` vs `tsconfig.json#paths`

After researching the docs:

- **Either approach works.** The `components.json` aliases tell the CLI where to install. The resolution mechanism (`tsconfig paths` or `package.json#imports`) handles TypeScript/bundler resolution.
- **For our project, `tsconfig.json#paths` is already set up and working:**
  - `packages/design-system/tsconfig.json`: `"@repo/design-system/*": ["./*"]`
  - `apps/app/tsconfig.json`: `"@/*": ["./*"]` and `"@repo/*": ["../../packages/*"]`
  - `apps/player/tsconfig.json`: same as app
- **No `package.json#imports` needed** unless we want to switch to that pattern. The current tsconfig paths work fine.
- However, the monorepo docs recommend `package.json#imports` for package-local aliases and explicit `components.json` aliases for cross-workspace imports, because `package.json#imports` + `moduleResolution: "bundler"` + `resolvePackageJsonImports: true` provides cleaner resolution with bundlers like Turbopack.

**Recommendation**: Keep the existing `tsconfig.json#paths` approach for now. The tsconfig path `@repo/design-system/*` → `./*` already satisfies the aliases. Optionally add `exports` to `packages/design-system/package.json` to make the package properly publishable:
```json
{
  "exports": {
    "./components/*": "./components/*.tsx",
    "./hooks/*": "./hooks/*.ts",
    "./lib/*": "./lib/*.ts",
    "./styles/*": "./styles/*.css"
  }
}
```

### 5. `iconLibrary` field

- The docs only show `"iconLibrary": "lucide"` in examples. shadcn's default icon library is lucide-react.
- This project uses `@phosphor-icons/react` (NOT lucide). All existing components already import from `@phosphor-icons/react/ssr`.
- **The `iconLibrary` field tells the CLI which icons to generate in NEW components.** Setting it to `"lucide"` means newly added CLI components will import from `lucide-react`, requiring manual conversion to phosphor icons.
- There is a `shadcn migrate icons` command (referenced in CLI docs) that can migrate between icon libraries, but the details page was not available (404). It may or may not support phosphor.
- **Decision**: Keep `"iconLibrary": "lucide"` in the config for CLI compatibility. When adding new components via CLI, the lucide imports will need to be manually swapped to phosphor equivalents. The existing phosphor-using components are unaffected.

### 6. CSS path for consumer apps

The consumer `components.json` should point `tailwind.css` to the shared UI package's global CSS to ensure the CLI adds theme variables to the right file:

- `apps/app` → `"css": "../../packages/design-system/styles/globals.css"`
- `apps/player` → same

However, looking at the current project, each app has its own `app/globals.css` with app-specific theme overrides. They import the shared CSS via `app/styles.css`:
```css
@import "tailwindcss";
@import "@repo/design-system/styles/globals.css";
@import "./globals.css";
```

Given this pattern, pointing `tailwind.css` to the design system's globals.css is correct (it's the source of truth for theme variables). App-specific overrides stay in the local `globals.css` and are imported separately.

**Alternatively**, pointing `tailwind.css` to the app's own `app/globals.css` would also work, but then the CLI would add theme variables there. Given the multi-theme setup (each app has different theme values), it's safer to point to the design system's CSS since that's where the base theme infrastructure lives.

**Decision**: Point `tailwind.css` to the shared design-system CSS for both consumer apps. This follows the monorepo docs pattern exactly.


## Project State (for reference)

### `packages/design-system/components.json` (current)
- style: `"new-york"` (needs → `"base-nova"`)
- iconLibrary: `"lucide"` (keep, but note phosphor usage)
- tailwind.css: `"styles/globals.css"` (correct)
- aliases: all `@repo/design-system/*` (correct pattern)
- registries: `@aceternity` (keep)

### `packages/design-system/tsconfig.json`
- paths: `"@repo/design-system/*": ["./*"]` (correct)

### `apps/app/tsconfig.json`
- paths: `"@/*": ["./*"]`, `"@repo/*": ["../../packages/*"]` (correct)

### `apps/player/tsconfig.json`
- same as app (correct)

### App CSS import chain
```
apps/app/app/styles.css
  → @import "tailwindcss"
  → @import "@repo/design-system/styles/globals.css"
  → @import "./globals.css"
```


## Exact `components.json` configurations

### 1. `packages/design-system/components.json`

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "base-nova",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "config": "",
        "css": "styles/globals.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
    },
    "iconLibrary": "lucide",
    "aliases": {
        "components": "@repo/design-system/components",
        "utils": "@repo/design-system/lib/utils",
        "hooks": "@repo/design-system/hooks",
        "lib": "@repo/design-system/lib",
        "ui": "@repo/design-system/components"
    },
    "registries": {
        "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
    }
}
```

**Changes from current:**
1. `"style"`: `"new-york"` → `"base-nova"`
2. `"tailwind.config"`: `""` stays empty (Tailwind v4 — already correct)
3. `"aliases.ui"`: `"@repo/design-system/components/ui"` → `"@repo/design-system/components"` (base-nova components live directly in `components/`, not in a `ui/` subdirectory)
4. Everything else stays the same.

**Explanation of each alias:**
- `components` → where block-level/page components get installed. Self-references the shared package so blocks can also be shared if desired.
- `ui` → where primitive UI components (button, dialog, etc.) get installed. Points to `@repo/design-system/components` (same as `components` alias). In base-nova, ui primitives land directly in `components/`.
- `hooks` → where hooks get installed. Points to shared package.
- `lib` → where lib utilities get installed. Points to shared package.
- `utils` → import path for `cn`/utility function. Points to `@repo/design-system/lib/utils`.

### 2. `apps/app/components.json`

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "base-nova",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "config": "",
        "css": "../../packages/design-system/styles/globals.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
    },
    "iconLibrary": "lucide",
    "aliases": {
        "components": "@/components",
        "ui": "@repo/design-system/components",
        "hooks": "@/hooks",
        "lib": "@/lib",
        "utils": "@repo/design-system/lib/utils"
    }
}
```

**Explanation:**
- `style`, `iconLibrary`, and `baseColor` must match the design-system config (per monorepo docs).
- `tailwind.css` points to the shared design-system global CSS. The CLI uses this to know where theme variables live.
- `tailwind.config` is empty (Tailwind v4).
- **Aliases rationale:**
  - `ui` → `@repo/design-system/components`: Primitive UI components are installed in the shared package.
  - `utils` → `@repo/design-system/lib/utils`: The `cn` utility is imported from the shared package.
  - `components` → `@/components`: Block/page-level components (login-01, dashboard, etc.) are installed locally in the app. The `@/*` → `./*` tsconfig path resolves this.
  - `hooks` → `@/hooks`: App-specific hooks installed locally.
  - `lib` → `@/lib`: App-specific lib utilities installed locally.

### 3. `apps/player/components.json`

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "base-nova",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "config": "",
        "css": "../../packages/design-system/styles/globals.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
    },
    "iconLibrary": "lucide",
    "aliases": {
        "components": "@/components",
        "ui": "@repo/design-system/components",
        "hooks": "@/hooks",
        "lib": "@/lib",
        "utils": "@repo/design-system/lib/utils"
    }
}
```

Identical to `apps/app/components.json`. Apps share the same monorepo pattern.

**Note**: `apps/player` currently has no `components/` directory. That's fine — the CLI will create it when a block component is added. The `@/components` alias resolves via the existing tsconfig path `"@/*": ["./*"]`.


## Additional considerations

### `package.json#exports` for the shared package

The monorepo docs recommend adding `exports` to the UI package to enable proper module resolution across workspace boundaries. Consider adding to `packages/design-system/package.json`:

```json
{
  "exports": {
    "./components/*": "./components/*.tsx",
    "./hooks/*": "./hooks/*.ts",
    "./lib/*": "./lib/*.ts",
    "./styles/globals.css": "./styles/globals.css"
  }
}
```

This is optional if `tsconfig.json#paths` already handles resolution, but explicit `exports` is recommended for cleaner bundler resolution (especially with Turbopack in Next.js 16).

### Phosphor icons migration path

Since `iconLibrary: "lucide"` will cause the CLI to generate lucide imports in new components, there are two approaches:
1. **Manual conversion**: After adding a component, swap `lucide-react` imports to `@phosphor-icons/react/ssr` equivalents.
2. **Check `shadcn migrate icons`**: Investigate whether this command supports phosphor as a target. The command is documented in the CLI reference as `shadcn migrate icons`, but the detailed docs page wasn't available.

### Local directories that may need creation

- `apps/player/components/` — doesn't exist yet; the CLI will create it on first block add.
- `apps/player/hooks/` — doesn't exist yet; will be created if hooks are added.
- `apps/player/lib/` — doesn't exist yet; will be created if lib utils are added.

### `"rsc": true`

Both apps use Next.js with React Server Components. This field tells the CLI to add `"use client"` directive to client components. Correct.

### `"tsx": true`

All project code is TypeScript. Correct.
