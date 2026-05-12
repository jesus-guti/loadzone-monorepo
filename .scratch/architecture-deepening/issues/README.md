# Issues — architecture-deepening

**Cómo retomar trabajo:** abre un `.md` en esta carpeta con `Status: ready-for-agent` en el frontmatter, implementa el slice, y al cerrar actualiza ese mismo archivo (`Status`, checkboxes y `## Comments`) sin moverlo a otra carpeta.

Orden sugerido (dependencias):

| # | Archivo | Bloqueado por |
|---|---------|----------------|
| 01 | `01-exercise-library-visibility-contract.md` | — |
| 02 | `02-exercise-enums-single-source.md` | — |
| 03 | `03-exercise-library-query-dedupe.md` | — (recomendado tras 01) |
| 04 | `04-design-system-decouple-auth.md` | — |
| 05 | `05-database-client-vs-bootstrap-split.md` | — |
| 06 | `06-player-read-path-no-template-upsert.md` | 05 |
| 07 | `07-staff-context-testable-core.md` | — |
| 08 | `08-exercise-mutation-actions-contract-tests.md` | — (sinergia con 01) |
| 09 | `09-architecture-docs-traceability.md` | — |

Parent: [../PRD.md](../PRD.md)
