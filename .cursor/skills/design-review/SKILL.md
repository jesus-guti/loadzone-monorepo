---
name: design-review
description: Review LoadZone UI changes against design-system rules. Use when editing styles, Tailwind classes, layout components, forms, cards, dialogs, or visual states in `apps/app`, `apps/player`, or `packages/design-system`.
---

# Design review

## Checklist

- Reutiliza primitives existentes antes de crear wrappers.
- Prefiere tokens semanticos sobre tokens legacy o colores hardcodeados.
- Evita sombras estructurales en superficies normales.
- Revisa densidad, radio, borde y consistencia con el shell correcto.
- Busca valores de motion y timing que deberian vivir en constantes compartidas.
- **Iconografia**: solo `@phosphor-icons/react`; peso coherente con la superficie (`fill` en densidad alta, mas ligero en player/marketing); sin mezclar Heroicons/Lucide/Radix icons en UI propia.

## Flujo

1. Detecta la superficie visual afectada.
2. Revisa si ya existe un primitive o patron parecido.
3. Marca clases legacy, colores hardcodeados y variantes inconsistentes.
4. Propone el cambio minimo para volver al sistema.

## Output esperado

- Lista priorizada de hallazgos con `archivo`, `problema`, `ajuste recomendado`.
