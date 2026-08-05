# Form system: RHF + design-system controls

Status: closed (destination reached — SPEC accepted AFK)  
Labels: wayfinder:map  
Linear: [JES-63](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)

## Destination

A **Form System SPEC** that locks React Hook Form as the standard for product forms in `apps/app` and `apps/player`, mandates design-system field primitives, and defines Zod validation + Server Action integration — ready to hand off to `/to-issues` for migration. This map does **not** execute the migration.

**Exit artifacts:** [SPEC.md](SPEC.md) · [BACKLOG.md](BACKLOG.md)

## Notes

- Domain: admin + player product forms; consult ADR 0001, `loadzone-design-system.mdc`, and settings autosave (`useSettingsAutosave` / JES-58).
- Standing preferences (charting assumed all recommendations) — now locked in SPEC §1.
- Skills used: `/grilling`, `/research`, `/prototype` as ticket types required.
- Language: SPEC and map artifacts in English; product UI copy remains Spanish.

## Decisions so far

- [Catalog form surfaces and interaction modes](https://linear.app/jesus-guti-workspace/issue/JES-64/catalog-form-surfaces-and-interaction-modes) — [research/form-surfaces-and-interaction-modes.md](research/form-surfaces-and-interaction-modes.md)
- [Inventory DS fields and RHF Form gap](https://linear.app/jesus-guti-workspace/issue/JES-65/inventory-ds-fields-and-rhf-form-gap) — [research/ds-fields-and-rhf-form-gap.md](research/ds-fields-and-rhf-form-gap.md)
- [Decide Form primitive home and RHF wiring shape](https://linear.app/jesus-guti-workspace/issue/JES-66/decide-form-primitive-home-and-rhf-wiring-shape) — [resolutions/form-primitive-home-and-rhf-wiring.md](resolutions/form-primitive-home-and-rhf-wiring.md)
- [Decide autosave + RHF contract for settings](https://linear.app/jesus-guti-workspace/issue/JES-67/decide-autosave-rhf-contract-for-settings) — [resolutions/autosave-rhf-contract.md](resolutions/autosave-rhf-contract.md)
- [Decide validation ownership and action error mapping](https://linear.app/jesus-guti-workspace/issue/JES-68/decide-validation-ownership-and-action-error-mapping) — [resolutions/validation-ownership-and-action-error-mapping.md](resolutions/validation-ownership-and-action-error-mapping.md)
- [Decide control vocabulary and native exceptions](https://linear.app/jesus-guti-workspace/issue/JES-69/decide-control-vocabulary-and-native-exceptions) — [resolutions/control-vocabulary-and-native-exceptions.md](resolutions/control-vocabulary-and-native-exceptions.md)
- [Prototype RHF + DS on submit and autosave pilots](https://linear.app/jesus-guti-workspace/issue/JES-70/prototype-rhf-ds-on-submit-and-autosave-pilots) — [resolutions/rhf-ds-pilots-prototype.md](resolutions/rhf-ds-pilots-prototype.md) · throwaway `/prototype/form-system`
- [Synthesize the Form System SPEC](https://linear.app/jesus-guti-workspace/issue/JES-71/synthesize-the-form-system-spec) — map exit: [SPEC.md](SPEC.md) · planning [../jes-71-form-system-spec/map.md](../jes-71-form-system-spec/map.md)

## Not yet specified

Deferred detail lives in [SPEC.md](SPEC.md) §8 (migration wave order, ESLint/CI guards, player-local RHF adapters). Suggested clusters only: [BACKLOG.md](BACKLOG.md).

## Out of scope

- Executing the full form migration across the monorepo (post-SPEC `/to-issues`).
- Tactics-board / canvas toolbar chrome that is not a product form.
- Throwaway prototypes under `apps/app/app/prototype/**`.
- Redesigning Server Action domain APIs beyond the error-shape contract the SPEC needs.
- Changing Age Band product policy or check-in question content.
