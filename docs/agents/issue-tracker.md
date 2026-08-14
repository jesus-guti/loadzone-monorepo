# Issue tracker: Linear

Issues for this repo live in Linear. Use the **Linear MCP** (`plugin-linear-linear`) for all create/read/update operations — not `gh issue`.

## Workspace

- **Team:** `Jesus-guti-workspace` (issue key prefix `JES-…`)
- **Product project:** [LoadZone](https://linear.app/jesus-guti-workspace/project/loadzone-ac4c93b90c0c) — umbrella for the product; optional per-feature projects for large epics
- **Assignee default:** `me` (solo developer)
- **PRDs / feature specs:** may live in-repo at `.scratch/<feature-slug>/PRD.md` (or `spec.md`); link the Linear issue to the PRD path or URL in the description

## Conventions

- **Create an issue:** Linear MCP `save_issue` with `title`, `team: "Jesus-guti-workspace"`, optional `project: "LoadZone"`, `assignee: "me"`, and triage labels
- **Read an issue:** `get_issue` with the identifier (e.g. `JES-123`) or UUID
- **List issues:** `list_issues` with team/project/label/assignee filters as needed
- **Comment:** `save_comment` on the issue
- **Apply triage labels:** `save_issue` with `labels: [...]` (replaces the full label set — include any type labels you want to keep, e.g. `Feature` / `Bug` / `Improvement`)
- **Workflow states:** Backlog → Todo → In Progress → In Review → Done (plus Canceled / Duplicate)

## When a skill says "publish to the issue tracker"

Create a Linear issue via MCP (`save_issue`), not a GitHub issue or a markdown file under `.scratch/issues/`.

## When a skill says "fetch the relevant ticket"

Call `get_issue` with the Linear identifier the user passed (e.g. `JES-123`).

## Wayfinding operations

Used by `/wayfinder`. Prefer Linear parent/child + blocking relations when available via MCP; otherwise:

- **Map:** a Linear issue titled as the effort map, labelled or described as the wayfinder map, holding Notes / Decisions-so-far / Fog
- **Child ticket:** a Linear issue with `parentId` set to the map; record type (`research` / `prototype` / `grilling` / `task`) in the body or via a label
- **Blocking:** Linear `blockedBy` / `blocks` on `save_issue`
- **Claim:** assign to `me`
- **Resolve:** comment the answer, then set state to Done; append a context pointer to the map issue
