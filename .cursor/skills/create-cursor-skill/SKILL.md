---
name: create-cursor-skill
description: Create small project or personal Cursor skills for repeated workflows. Use when a workflow is repeated often enough to deserve a reusable `SKILL.md`.
---

# Create Cursor skill

## Regla principal

Una skill debe resolver un solo trabajo repetible.

## Flujo

1. Define el workflow exacto.
2. Decide si va en `.cursor/skills/` o `~/.cursor/skills/`.
3. Escribe una `description` con WHAT + WHEN.
4. Mantén `SKILL.md` corto y operativo.
5. Extrae detalle a `reference.md` solo si realmente ahorra contexto.

## Antipatrones

- Skills gigantes con varios workflows.
- Nombres vagos como `helper` o `utils`.
- Repetir conocimiento general del modelo.
- Asumir herramientas opcionales sin fallback.
