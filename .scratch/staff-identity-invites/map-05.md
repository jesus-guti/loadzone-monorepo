# SI-05 — Super Admin creates Clubs and operates without impersonation

## Destination

Super Admin creates Club (no Membership), picks any Club, invite/revoke/roles including first Coordinator, change User email (unique), grant Super Admin. No impersonation.

## Notes

- Blocked by SI-03; merge SI-03 tip into this worktree before implementing.
- **[human] 2026-08-31 `ok todo`** — club picker cookie + Settings → Plataforma stand.
- Reuse SI-01/03 seams with Super Admin bypass. Do not change `staffCanCreateTeam`.

## Decisions so far

See planner report: createClub slug; shell without Membership; cookie `loadzone_active_club`; grant Super Admin no ungrant; no impersonation.
