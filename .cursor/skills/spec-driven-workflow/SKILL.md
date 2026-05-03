---
name: spec-driven-workflow
description: Plan and execute non-trivial LoadZone work with a lightweight spec. Use when a task spans multiple files, changes contracts, or needs explicit scope before implementation.
---

# Spec-driven workflow

## Cuando usarlo

- Varias features o capas
- Refactors con riesgo
- Cambios de contrato
- Tareas que el agente tendria que reexplicar varias veces

## Flujo

1. Resume objetivo y restricciones.
2. Lista archivos o carpetas candidatas.
3. Fija alcance, contratos y estrategia de verificacion.
4. Implementa por slices pequenos.
5. Revisa drift entre spec, codigo y tests.
6. Registra follow-ups reales.

## Plantilla

Usa `docs/prompts/task-plan-template.md` como formato base.
