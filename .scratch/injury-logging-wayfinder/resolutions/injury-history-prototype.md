# Prototype injury history body map with counts

**Ticket:** [JES-35](https://linear.app/jesus-guti-workspace/issue/JES-35/prototype-injury-history-body-map-with-counts)  
**Verdict:** **accepted** with amend (2026-08-04)

## Answer

History body map communicates injury history clearly for staff:

- Total / year filters, Frente/Espalda, per-region count badges, Histórico list, click-badge region filter

## Amend

Hide **Estado en memoria** in the default UI. Show only in development (`?dev=1` on the throwaway; product implementation: omit or gate behind a dev-only flag — never for staff users).

## Artifact

- Worktree `jes-35` · branch `jgutierrez/jes-35-injury-history-prototype`
- Path: `.scratch/jes-35-history-prototype/prototype/`
- Commits: `a25b1c5` (build) · `1abfbe3` (hide state unless ?dev=1)
- Run: `python3 -m http.server 8768` → http://localhost:8768
