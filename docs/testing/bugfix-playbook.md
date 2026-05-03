# Bugfix playbook

## Cuándo usarlo

Usa este flujo cuando el bug no sea obvio, afecte reglas de negocio, o tenga riesgo de regresión.

## Flujo

1. Describe el síntoma.
2. Identifica la frontera afectada: schema, action, route o UI.
3. Formula una hipótesis corta.
4. Reproduce con un test pequeño o documenta el repro manual si no es automatizable.
5. Aplica el fix mínimo.
6. Verifica la regresión y un happy path.
7. Registra follow-ups si el arreglo deja deuda técnica.

## Capas recomendadas

- `schema/unit`: validación, parsing, transforms.
- `integration`: server actions y flujos con DB o helpers de servidor.
- `route/component`: render y estados visibles.
- `e2e`: solo cuando el fallo depende del flujo completo.

## Bailouts válidos

- Necesita credenciales reales de terceros.
- Es una carrera temporal difícil de estabilizar.
- Requiere interacción manual no scriptable.

Si ocurre un bailout, documenta el motivo y el camino manual de verificación.
