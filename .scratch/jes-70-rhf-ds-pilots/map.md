# JES-70 — Prototype RHF + DS on submit and autosave pilots

**Ticket:** [JES-70](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots)  
**Branch:** `jgutierrez/jes-70-rhf-ds-pilots`  
**Mode:** AFK full pipeline  
**Resolution:** [.scratch/form-system-wayfinder/resolutions/rhf-ds-pilots-prototype.md](../form-system-wayfinder/resolutions/rhf-ds-pilots-prototype.md)

## Question

Does the proposed Form System contract feel right when applied to one classic-submit form and one settings-autosave form?

## Decisions so far

1. **[hitl → accepted] Contract feels right on both pilots** — Classic submit (CreateTeam shape) and wellness autosave slice author cleanly against JES-66–69. Verdict AFK-accepted; no law reversals.
2. **[assume] Ship minimal Form* in DS on this branch as prototype fuel** — `packages/design-system/components/form.tsx` exports Form / FormField / FormControl / FormMessage (+ re-exports `useForm`, `zodResolver` for pilot convenience). Not a production migration PR by itself; JES-66 already locked home.
3. **[assume] Sub-shape B throwaway route** — `/prototype/form-system` under existing `apps/app/app/prototype/**` (no production host page for Form System yet).
4. **[hitl → accepted] Amendments are clarifications only** — Empty Select sentinel, FormControl-wraps-leaf, typed action→RHF mapper location, preferred RHF import path. Behavioral contracts stand.
5. **[assume] Stub actions only** — In-memory store; no Server Action / DB writes from the prototype.

## Artifact paths

- Prototype: `apps/app/app/prototype/form-system/`
- Form wiring: `packages/design-system/components/form.tsx`
- Findings: `.scratch/form-system-wayfinder/resolutions/rhf-ds-pilots-prototype.md`

## Blocks

- **JES-71** (Synthesize Form System SPEC) — unblocked for pilot evidence + amendments.
