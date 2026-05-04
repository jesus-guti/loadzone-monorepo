---
name: conventions
description: Quick reference for LoadZone engineering conventions. Use when you need a compact reminder of architecture, TypeScript, contracts, design-system, and testing expectations before editing code.
---

# LoadZone conventions

- Usa `pnpm`.
- Reutiliza `@repo/*` antes de crear nuevas capas.
- Evita `any`; prefiere `unknown`, Zod y type guards.
- Mantén contratos locales hasta que dos consumidores reales necesiten compartirlos.
- `page.tsx` orquesta; `features/*` implementa.
- Tokens semanticos primero; no metas tokens legacy en codigo nuevo.
- **Iconos**: Phosphor (`@phosphor-icons/react`); ver regla `loadzone-design-system` seccion Iconos.
- Los bugs no triviales se reproducen antes del fix.
- Los cambios con varias capas se planifican con una spec ligera.
