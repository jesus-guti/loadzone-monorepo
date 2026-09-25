# Map: Check-in Questionnaire versions and DailyEntry coexistence

Labels: `wayfinder:map`  
Tracker: local markdown (`.scratch/check-in-questionnaire-wayfinder/`). Promote to Linear when MCP is available.

## Destination

A written spec (and schema/migration *plan*, not an executed migration) for Team-owned **Check-in Questionnaires**: short/long as **Presets**, immutable **Questionnaire Versions**, **DailyEntry** answers that never mix Versions in staff lists/cards/CSV, opinionated **WellnessMetric**s for load/care/charts, and **Custom Question**s as accumulable export-only data. One production Club is in use — the plan must describe a clean one-shot migration of current DailyEntry rows into Version 1 (today’s full opinionated set = the long Preset).

## Notes

- Domain: LoadZone. Glossary: `CONTEXT.md` (**Check-in Questionnaire**, **Pre-session form**, **Post-session form**, **Questionnaire Version**, **Preset**, **Custom Question**, **WellnessMetric**, **DailyEntry**).
- Skills every session: `/grilling`, `/domain-modeling`; `/research` on AFK research tickets.
- Persistence **replaces** `FormTemplate` / `FormQuestion` / `FormAssignment` (do not extend). RHF Form System ([form-system-wayfinder](../form-system-wayfinder/MAP.md)) is how React forms are built, not check-in content.
- Related but different map: [Form system: RHF + design-system controls](../form-system-wayfinder/MAP.md) (how product forms are built in React — not check-in content).
- This map is **planning**. Do not ship schema, run the migration, or build the staff builder here.
- Language: map/tickets/spec English; product UI copy Spanish.
- Children: `issues/`. Frontier = open, unblocked, unclaimed, lowest number first.

## Decisions so far

Charting (not ticket resolutions): one questionnaire per **Team**; Versions immutable; one live Version; no drafts (abandoning an edit discards it); no reactivating an old Version; short Preset may omit **WellnessMetric**s (dependent stats/care skipped that day); Custom Questions never feed load; CSV never mixes Versions (multi-file/sheet); same-day publish keeps existing DailyEntries on the Version they were submitted against; v1 migration target = current DailyEntry columns as long Preset.

- [Question types for Custom Questions vs WellnessMetric](issues/01-question-types.md) — Reuse type catalog (`SCALE`/`NUMBER`/…). Metrics keep locked ranges; custom = SCALE 2–11 + presentation, NUMBER, SINGLE_SELECT, BOOLEAN, TEXT. [research/question-types.md](research/question-types.md). *(duration-as-non-question superseded by the PRE/POST ticket.)*
- [PRE and POST questions on a Questionnaire Version](issues/02-pre-post-on-a-version.md) — Version snapshots two forms; assign/duplicate freely; load uses default-form value; empty form = no obligation; replace FormTemplate. [resolutions/02-pre-post-on-a-version.md](resolutions/02-pre-post-on-a-version.md).

## Not yet specified

- Custom Question identity across Versions (CSV is split by Version; stitching later).
- Who may publish (Coordinator vs Staff) — likely same as current wellness settings.
- PlayerDailyStats / sRPE when a Version omits rpe or duration.
- Per-Session override of the Team’s live forms (today `FormAssignment.teamSessionId` can bind a template to one Session).

## Out of scope

- Implementing schema, running the migration, or shipping the staff builder.
- High-fidelity builder prototype (Squarespace-like split, player-app phone chrome, reorder slider). Later effort after this spec.
- Graphing or load-style calculations on **Custom Question**s.
- Mixing Versions in one table/CSV; rewriting historical answers; reactivating an old Version as live; a draft entity.
- Breaking uniqueness of one **DailyEntry** per player and date.
- Club-scoped questionnaire (this wave is per Team).
- Age-Band-specific questionnaires.
