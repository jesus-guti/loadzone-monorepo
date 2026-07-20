# wayfinder:research — RESOLVED

## Question

How do we install and configure the shadcn MCP server for use with Cursor (or VS Code) in this monorepo?

## Resolution

See the full MCP docs at https://ui.shadcn.com/docs/mcp.

### 1. Exact commands

**Cursor:**
```
pnpm dlx shadcn@latest mcp init --client cursor
```
This writes `.cursor/mcp.json` automatically.

**VS Code (GitHub Copilot):**
```
pnpm dlx shadcn@latest mcp init --client vscode
```
This writes `.vscode/mcp.json` automatically.

**Claude Code:**
```
pnpm dlx shadcn@latest mcp init --client claude
```

**Note:** The `mcp init` command is a convenience wrapper. The config files can also be created manually (see below). The `--client` values are: `claude`, `cursor`, `vscode`, `codex`, `opencode`.

### 2. Manual config (if you prefer not to run the CLI)

**Cursor** — `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```
Then enable the shadcn MCP server in Cursor Settings. A green dot confirms it's connected.

**VS Code (GitHub Copilot)** — `.vscode/mcp.json`:
```json
{
  "servers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```
Note VS Code uses `"servers"` (not `"mcpServers"`). Open `.vscode/mcp.json` and click **Start** next to the shadcn server.

### 3. Config file locations

| Client | Config file |
|--------|------------|
| Cursor | `.cursor/mcp.json` (project root) |
| VS Code | `.vscode/mcp.json` (project root) |
| Claude Code | `.mcp.json` (project root) |
| Codex | `~/.codex/config.toml` (manual only, CLI can't auto-update) |

All project-level configs live at the monorepo root, **not** inside `packages/design-system/`.

### 4. Does it need to know about `@repo/design-system`?

**No.** The MCP server reads `components.json` to discover registered registries. It does not care about the internal package name or import aliases (`@repo/design-system`). Those aliases are only used by the `shadcn add` CLI when writing import paths into generated component files.

### 5. Capabilities

Once connected, the AI assistant gains these tools:

| Capability | Description |
|-----------|-------------|
| **Browse Components** | List all available components, blocks, and templates from any configured registry |
| **Search Across Registries** | Find specific components by name or functionality across multiple sources |
| **Install with Natural Language** | "Add a login form", "Create a contact form using shadcn components" |
| **Multi-Registry Support** | Access public registries, private company libraries, and third-party sources simultaneously |
| **Namespaced Access** | "Show me components from @acme registry", "Install @internal/auth-form" |

Example prompts that work:
- "Show me all available components in the shadcn registry"
- "Add the button, dialog and card components to my project"
- "Create a contact form using components from the shadcn registry"
- "Build a landing page using hero, features and testimonials sections"

### 6. Can it work with just the default shadcn registry?

**Yes.** The docs explicitly state: "No configuration is needed to access the standard shadcn/ui registry." The MCP server reads from the default `https://ui.shadcn.com/r/{name}.json` automatically.

Custom/third-party registries need to be listed in `components.json` → `registries`.

### 7. Do we need to configure `registries` in `components.json`?

**Not for the default shadcn registry.** The MCP server accesses it automatically.

However, we already have `@aceternity` registered in `components.json`, and the MCP server will pick that up — so the AI can also browse and install from Aceternity UI.

Our current `components.json` registries section:
```json
"registries": {
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
}
```

This is sufficient. No changes needed to `registries` for MCP to work.

### 8. OpenCode / Zed

**Command:**
```bash
pnpm dlx shadcn@latest mcp init --client opencode
```

This project uses **Zed** as the editor with **OpenCode** as the agent system (see `opencode.json` at repo root). The `--client opencode` flag is the correct one. The CLI writes the MCP config in the location OpenCode expects.

## Recommended next step

Run the `mcp init` command from the monorepo root:

```bash
# From loadzone-monorepo/
pnpm dlx shadcn@latest mcp init --client opencode
```

After that, the AI agent within Zed (OpenCode) will be able to browse, search, and install components from the shadcn registry using natural language.

**Note for monorepo context:** The config files go at the monorepo root. The MCP server reads `packages/design-system/components.json` (or whichever workspace you run `shadcn` commands from) to resolve aliases and registry URLs. Run the `mcp init` at the monorepo root — the MCP server will discover the `components.json` in whichever cwd the AI agent is operating.
