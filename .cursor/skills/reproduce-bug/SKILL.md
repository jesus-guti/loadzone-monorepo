---
name: reproduce-bug
description: Reproduce a LoadZone bug before fixing it. Use when a bug is non-trivial, touches business rules, or risks regression, and you need a targeted failing test or a documented manual repro first.
---

# Reproduce bug

## Objetivo

Reducir fixes a ciegas y dejar evidencia reproducible del fallo.

## Flujo

1. Resume el sintoma en una frase.
2. Elige la capa minima: `schema/unit`, `integration`, `route/component`, o `e2e`.
3. Formula una hipotesis: entrada, comportamiento incorrecto, causa probable.
4. Escribe una reproduccion:
   - test automatizado si es viable
   - repro manual documentado si no lo es
5. Ejecuta la prueba o deja claro el bailout.
6. Solo despues pasa al fix.

## Bailouts validos

- Requiere credenciales reales.
- Depende de una carrera temporal dificil de estabilizar.
- Requiere interaccion manual no automatizable.

## Output esperado

```md
## Reproduccion
- Sintoma:
- Capa elegida:
- Hipotesis:
- Evidencia:
- Siguiente paso:
```
